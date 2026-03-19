// Builder-specific Cloud Functions (codebase: default)
// Auth, wallet verification, and shared functions live in ThirdSpaceCMS (codebase: cms)
const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const fetch = require("node-fetch");
const FormData = require("form-data");

const ALLOWED_ORIGINS = [
  "https://builder.dappzy.io",
  "https://dappzy.io",
  "https://www.dappzy.io",
  "https://3rd-builder.web.app",
];
if (process.env.FUNCTIONS_EMULATOR) {
  ALLOWED_ORIGINS.push("http://localhost:3000");
}

const ANTHROPIC_API_KEY = defineSecret("ANTHROPIC_API_KEY");
const PINATA_API_KEY = defineSecret("PINATA_API_KEY");

admin.initializeApp();

// --- Rate Limiters ---
// NOTE: These are in-memory rate limiters — they reset on every function cold
// start and are not shared across Cloud Functions instances. For stricter
// enforcement, consider using Firestore or Redis.
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

// AI rate limiter (15 per hour, keyed by IP)
const aiRateLimitMap = new Map();
const AI_RATE_LIMIT_MAX = 15;

function checkAIRateLimit(ip) {
  const now = Date.now();
  const entry = aiRateLimitMap.get(ip);
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    aiRateLimitMap.set(ip, { windowStart: now, count: 1 });
    return true;
  }
  entry.count++;
  if (entry.count > AI_RATE_LIMIT_MAX) return false;
  return true;
}

// Upload rate limiter (30 per hour, keyed by Firebase UID)
const uploadRateLimitMap = new Map();
const UPLOAD_RATE_LIMIT_MAX = 30;

function checkUploadRateLimit(uid) {
  const now = Date.now();
  const entry = uploadRateLimitMap.get(uid);
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    uploadRateLimitMap.set(uid, { windowStart: now, count: 1 });
    return true;
  }
  entry.count++;
  if (entry.count > UPLOAD_RATE_LIMIT_MAX) return false;
  return true;
}

// AI Project Generation — proxies to Claude API
exports.generateAIProject = onRequest(
  {
    secrets: [ANTHROPIC_API_KEY],
    cors: ALLOWED_ORIGINS,
    invoker: "public",
    region: "us-central1",
    timeoutSeconds: 120,
    memory: "512MiB",
  },
  async (req, res) => {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    // Require Firebase Auth
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized — missing auth token" });
    }
    try {
      await admin.auth().verifyIdToken(authHeader.split("Bearer ")[1]);
    } catch (authError) {
      return res.status(401).json({ error: "Unauthorized — invalid auth token" });
    }

    // AI-specific rate limit (15 per hour)
    const clientIp = req.ip || "unknown";
    if (!checkAIRateLimit(clientIp)) {
      return res.status(429).json({ error: "AI generation limit reached (15 per hour). Try again later." });
    }

    try {
      const { prompt, systemPrompt } = req.body;

      if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
        return res.status(400).json({ error: "Prompt is required" });
      }
      if (prompt.length > 2000) {
        return res.status(400).json({ error: "Prompt too long (max 2000 chars)" });
      }

      const apiKey = ANTHROPIC_API_KEY.value();
      if (!apiKey) {
        return res.status(500).json({ error: "AI service not configured" });
      }

      // Call Claude API
      const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4096,
          system: systemPrompt || "You are a web page builder AI. Return only valid JSON arrays.",
          messages: [
            { role: "user", content: prompt },
          ],
        }),
      });

      if (!anthropicRes.ok) {
        const errText = await anthropicRes.text();
        console.error("Anthropic API error:", anthropicRes.status, errText);
        return res.status(502).json({ error: "AI service error" });
      }

      const anthropicData = await anthropicRes.json();
      const aiText = anthropicData.content?.[0]?.text || "";

      // Parse the AI response as JSON
      let sections;
      try {
        sections = JSON.parse(aiText);
      } catch (parseErr) {
        console.error("AI response not valid JSON:", aiText.substring(0, 500));
        return res.status(400).json({ error: "AI returned invalid JSON. Please try a different prompt." });
      }

      // Validate structure
      if (!Array.isArray(sections) || sections.length === 0) {
        return res.status(400).json({ error: "AI returned empty or non-array response." });
      }

      for (const section of sections) {
        if (!section.type) {
          return res.status(400).json({ error: "AI returned a section without a type." });
        }
        if (!section.styles || typeof section.styles !== "object") {
          section.styles = {};
        }
      }

      return res.json({ sections });
    } catch (error) {
      console.error("Error in generateAIProject:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

// --- IPFS Upload Proxy ---
// Proxies file uploads to Pinata so the API key never touches the client.
// Accepts JSON with base64-encoded file content (same shape the client already sends).
// Max 10 MB payload (Cloud Functions default for JSON bodies).
const PINATA_API_URL = "https://api.pinata.cloud";
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

exports.pinFileToIPFS = onRequest(
  {
    secrets: [PINATA_API_KEY],
    cors: ALLOWED_ORIGINS,
    invoker: "public",
    region: "us-central1",
    timeoutSeconds: 120,
    memory: "512MiB",
  },
  async (req, res) => {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    // --- Auth ---
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized — missing auth token" });
    }
    let uid;
    try {
      const decoded = await admin.auth().verifyIdToken(authHeader.split("Bearer ")[1]);
      uid = decoded.uid;
    } catch (authError) {
      return res.status(401).json({ error: "Unauthorized — invalid auth token" });
    }

    // --- Rate limit (30 per hour per user) ---
    if (!checkUploadRateLimit(uid)) {
      return res.status(429).json({ error: "Upload limit reached (30 per hour). Try again later." });
    }

    try {
      const { fileName, content, contentType, metadata } = req.body;

      // --- Validate inputs ---
      if (!fileName || typeof fileName !== "string") {
        return res.status(400).json({ error: "fileName is required" });
      }
      if (!content || typeof content !== "string") {
        return res.status(400).json({ error: "Base64 file content is required" });
      }

      const fileBuffer = Buffer.from(content, "base64");
      if (fileBuffer.length === 0) {
        return res.status(400).json({ error: "File content is empty" });
      }
      if (fileBuffer.length > MAX_FILE_SIZE_BYTES) {
        return res.status(413).json({ error: `File too large (max ${MAX_FILE_SIZE_BYTES / 1024 / 1024} MB)` });
      }

      const apiKey = PINATA_API_KEY.value();
      if (!apiKey) {
        return res.status(500).json({ error: "IPFS service not configured" });
      }

      // --- Build multipart form for Pinata ---
      const form = new FormData();
      form.append("file", fileBuffer, {
        filename: fileName,
        contentType: contentType || "application/octet-stream",
      });

      // Pinata metadata (name + keyvalues)
      if (metadata && typeof metadata === "object") {
        form.append("pinataMetadata", JSON.stringify({
          name: metadata.name || fileName,
          keyvalues: metadata.keyvalues || {},
        }));
      }

      // Pinata options
      form.append("pinataOptions", JSON.stringify({ cidVersion: 1 }));

      // --- Forward to Pinata ---
      const pinataRes = await fetch(`${PINATA_API_URL}/pinning/pinFileToIPFS`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          ...form.getHeaders(),
        },
        body: form,
      });

      if (!pinataRes.ok) {
        const errText = await pinataRes.text();
        console.error("Pinata API error:", pinataRes.status, errText);
        if (pinataRes.status === 401 || pinataRes.status === 403) {
          return res.status(502).json({ error: "IPFS service authentication failed" });
        }
        return res.status(502).json({ error: "IPFS upload failed" });
      }

      const pinataData = await pinataRes.json();

      // Return the same shape Pinata returns: { IpfsHash, PinSize, Timestamp }
      return res.json({
        IpfsHash: pinataData.IpfsHash,
        PinSize: pinataData.PinSize,
        Timestamp: pinataData.Timestamp,
        // Also return normalised keys for convenience
        ipfsHash: pinataData.IpfsHash,
        pinSize: pinataData.PinSize,
      });
    } catch (error) {
      console.error("Error in pinFileToIPFS:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);
