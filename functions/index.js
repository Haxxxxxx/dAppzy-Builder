// Use Firebase Functions v2
const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const nacl = require("tweetnacl");
const { PublicKey, Connection, LAMPORTS_PER_SOL } = require("@solana/web3.js");
const { ethers } = require("ethers");
const fetch = require("node-fetch");
// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  "https://builder.dappzy.io",
  "https://dappzy.io",
  "https://www.dappzy.io",
];
if (process.env.FUNCTIONS_EMULATOR) {
  ALLOWED_ORIGINS.push("http://localhost:3000");
}
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// 1) Define your secret using firebase-functions/params
const udJwt = defineSecret("UD_JWT");
const EMAIL_USER = defineSecret("EMAIL_USER");
const EMAIL_PASS = defineSecret("EMAIL_PASS");
// 2) Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore(); // Firestore instance

// Nonce TTL: 5 minutes
const NONCE_TTL_MS = 5 * 60 * 1000;

// Generate and store a nonce for wallet auth challenge-response
exports.generateNonce = onRequest(
  {
    region: "us-central1",
    cors: ALLOWED_ORIGINS,
    invoker: "public",
  },
  async (req, res) => {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }
    const clientIp = req.ip || req.headers["x-forwarded-for"] || "unknown";
    if (!checkRateLimit(clientIp, 5)) {
      return res.status(429).json({ error: "Too many requests. Try again later." });
    }
    const { walletAddress } = req.body;
    if (!walletAddress || typeof walletAddress !== "string" || walletAddress.length < 10 || walletAddress.length > 128 || /[\/\.]/.test(walletAddress)) {
      return res.status(400).json({ error: "Invalid wallet address" });
    }
    const nonce = crypto.randomBytes(32).toString("hex");
    await db.collection("authNonces").doc(walletAddress).set({
      nonce,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt: new Date(Date.now() + NONCE_TTL_MS),
    });
    return res.json({ nonce });
  }
);

// Consume and validate a nonce — returns true if valid, false if expired/missing
async function consumeNonce(walletAddress, nonce) {
  const nonceRef = db.collection("authNonces").doc(walletAddress);
  const nonceDoc = await nonceRef.get();
  if (!nonceDoc.exists) return false;
  const data = nonceDoc.data();
  if (data.nonce !== nonce) return false;
  if (data.expiresAt.toDate() < new Date()) {
    await nonceRef.delete();
    return false;
  }
  await nonceRef.delete(); // consume the nonce
  return true;
}

exports.sendSupportEmail = onRequest(
  {
    secrets: [EMAIL_USER, EMAIL_PASS],
    cors: ALLOWED_ORIGINS,
    invoker: "public",
    region: "us-central1",
  },
  async (req, res) => {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    // Require Firebase Auth token to prevent spam
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized — missing auth token" });
    }
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(authHeader.split("Bearer ")[1]);
    } catch (authError) {
      return res.status(401).json({ error: "Unauthorized — invalid auth token" });
    }

    try {
      const { text, imageBase64 } = req.body;

      // Validate
      if (!text || text.trim().length === 0) {
        return res.status(400).json({ error: "Message text is required" });
      }
      if (text.length > 5000) {
        return res.status(400).json({ error: "Message too long (max 5000 chars)" });
      }
      if (imageBase64 && imageBase64.length > 5 * 1024 * 1024) {
        return res.status(413).json({ error: "Image too large (max ~3.5MB)" });
      }

      // 3) Store the text in Firestore (no image)
      await db.collection("supportRequests").add({
        message: text,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        userId: decodedToken.uid,
      });

      // 4) Create a Nodemailer transporter
      let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: EMAIL_USER.value(),
          pass: EMAIL_PASS.value(),
        },
      });

      // 5) Build mail options
      const mailOptions = {
        from: EMAIL_USER.value(),
        to: "vcharles@dappzy.io",  // The developer's address
        subject: "New Support Request",
        text: text,
      };

      // 6) Attach the image if present
      if (imageBase64) {
        const base64Data = imageBase64.split("base64,")[1];
        mailOptions.attachments = [
          {
            filename: "screenshot.png",
            content: base64Data,
            encoding: "base64",
          },
        ];
      }

      // 7) Send the email
      await transporter.sendMail(mailOptions);

      // 8) Respond success
      return res.json({ success: true, message: "Email sent & Firestore updated" });
    } catch (error) {
      console.error("Error sending support email:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);
// Simple in-memory rate limiter for public endpoints
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 30; // max requests per window per IP

function checkRateLimit(ip, max = RATE_LIMIT_MAX) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { windowStart: now, count: 1 });
    return true;
  }
  entry.count++;
  if (entry.count > max) return false;
  return true;
}

// 3) Reverse Lookup Function
exports.reverseLookup = onRequest(
  {
    secrets: [udJwt],
    cors: ALLOWED_ORIGINS,
    invoker: "public",
  },
  async (req, res) => {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    // Require Firebase Auth
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Authentication required" });
    }
    try {
      await admin.auth().verifyIdToken(authHeader.split("Bearer ")[1]);
    } catch {
      return res.status(401).json({ error: "Invalid token" });
    }

    // Rate limit by IP
    const clientIp = req.ip || req.headers["x-forwarded-for"] || "unknown";
    if (!checkRateLimit(clientIp)) {
      return res.status(429).json({ error: "Too many requests. Try again later." });
    }

    try {
      const jwtValue = udJwt.value();
      if (!jwtValue) {
        return res.status(500).json({ error: "UD JWT not configured" });
      }

      const address = req.query.address;
      if (!address || !/^[a-zA-Z0-9]{20,50}$/.test(address)) {
        return res.status(400).json({ error: "Missing or invalid address parameter" });
      }

      const apiUrl = `https://api.unstoppabledomains.com/partner/v3/owners/${address}/domains`;
      const queryParams = new URLSearchParams({ "$expand": "records" }).toString();
      const fullUrl = `${apiUrl}?${queryParams}`;

      const response = await fetch(fullUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${jwtValue}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error fetching domain data from UD API:", response.status, errorText);
        return res.status(502).json({
          error: "Error fetching domain data from UD API",
        });
      }

      const data = await response.json();
      return res.json(data);
    } catch (error) {
      console.error("Error in reverseLookup:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

// 6) Existing Phantom verification endpoint (unchanged)
exports.verifyPhantomV2 = onRequest(
  {
    region: "us-central1",
    cors: ALLOWED_ORIGINS,
    invoker: "public",
  },
  async (req, res) => {
    if (req.method === "OPTIONS") {
      return res.status(204).send("");
    }
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    const clientIp = req.ip || req.headers["x-forwarded-for"] || "unknown";
    if (!checkRateLimit(clientIp)) {
      return res.status(429).json({ error: "Too many requests." });
    }

    try {
      const { publicKey, signature, message, nonce } = req.body;
      if (!publicKey || !signature || !message || !nonce) {
        return res.status(400).json({ error: "Missing parameters: publicKey, signature, message, nonce" });
      }

      // Validate nonce
      const nonceValid = await consumeNonce(publicKey, nonce);
      if (!nonceValid) {
        return res.status(401).json({ error: "Invalid or expired nonce" });
      }

      // Verify nonce is embedded in the signed message
      if (!message.includes(nonce)) {
        return res.status(401).json({ error: "Nonce not found in signed message" });
      }

      const signatureBuffer = Buffer.from(signature, "base64");
      const messageBuffer = Buffer.from(message);

      const pubKey = new PublicKey(publicKey);
      const pubKeyBytes = pubKey.toBytes();

      const isVerified = nacl.sign.detached.verify(
        messageBuffer,
        signatureBuffer,
        pubKeyBytes
      );
      if (!isVerified) {
        return res.status(401).json({ error: "Signature verification failed" });
      }

      const customToken = await admin.auth().createCustomToken(publicKey, {
        walletType: "Phantom",
      });

      return res.json({ customToken });
    } catch (error) {
      console.error("Error in verifyPhantomV2:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Define secrets for subscription verification
const SOLANA_ADMIN_WALLET = defineSecret("SOLANA_ADMIN_WALLET");
const HELIUS_API_KEY = defineSecret("HELIUS_API_KEY");

// Plan pricing (must match client-side planConfig)
const PLAN_PRICES = { monthly: 20, annual: 16 };

// In-memory SOL price cache (60 second TTL) to avoid CoinGecko rate limits
const solPriceCache = { price: null, fetchedAt: 0 };
const PRICE_CACHE_TTL_MS = 60 * 1000;

async function getSolPriceUsd() {
  const now = Date.now();
  if (solPriceCache.price && now - solPriceCache.fetchedAt < PRICE_CACHE_TTL_MS) {
    return solPriceCache.price;
  }
  try {
    const priceRes = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd"
    );
    if (!priceRes.ok) throw new Error(`CoinGecko HTTP ${priceRes.status}`);
    const priceData = await priceRes.json();
    const price = priceData.solana.usd;
    solPriceCache.price = price;
    solPriceCache.fetchedAt = now;
    return price;
  } catch (err) {
    // Fallback to cached price if available
    if (solPriceCache.price) {
      console.warn("CoinGecko fetch failed, using cached price:", err.message);
      return solPriceCache.price;
    }
    throw err;
  }
}

exports.verifySubscription = onRequest(
  {
    secrets: [SOLANA_ADMIN_WALLET, HELIUS_API_KEY],
    cors: ALLOWED_ORIGINS,
    invoker: "public",
    region: "us-central1",
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
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(authHeader.split("Bearer ")[1]);
    } catch (authError) {
      return res.status(401).json({ error: "Unauthorized — invalid auth token" });
    }

    try {
      const { transactionSignature, walletAddress, billingCycle } = req.body;

      if (!transactionSignature || !walletAddress || !billingCycle) {
        return res.status(400).json({ error: "Missing required fields: transactionSignature, walletAddress, billingCycle" });
      }
      if (!/^[1-9A-HJ-NP-Za-km-z]{80,90}$/.test(transactionSignature)) {
        return res.status(400).json({ error: "Invalid transaction signature format" });
      }
      if (!["monthly", "annual"].includes(billingCycle)) {
        return res.status(400).json({ error: "Invalid billingCycle" });
      }

      // Verify authenticated user matches the wallet address
      if (decodedToken.uid !== walletAddress) {
        return res.status(403).json({ error: "Wallet address does not match authenticated user" });
      }

      // Validate wallet address
      let fromPubkey;
      try {
        fromPubkey = new PublicKey(walletAddress);
      } catch (e) {
        return res.status(400).json({ error: "Invalid wallet address" });
      }

      const adminWallet = SOLANA_ADMIN_WALLET.value();
      if (!adminWallet) {
        return res.status(500).json({ error: "Admin wallet not configured" });
      }

      // Build RPC URL
      const heliusKey = HELIUS_API_KEY.value();
      const rpcUrl = heliusKey
        ? `https://mainnet.helius-rpc.com/?api-key=${heliusKey}`
        : "https://api.mainnet-beta.solana.com";

      const connection = new Connection(rpcUrl, "confirmed");

      // Fetch and verify the transaction
      const tx = await connection.getTransaction(transactionSignature, {
        commitment: "confirmed",
        maxSupportedTransactionVersion: 0,
      });
      if (!tx) {
        return res.status(400).json({ error: "Transaction not found or not confirmed" });
      }
      if (tx.meta.err) {
        return res.status(400).json({ error: "Transaction failed on-chain" });
      }

      // Verify the transfer: check that SOL was sent to admin wallet
      const adminPubkey = new PublicKey(adminWallet);
      const accountKeys = tx.transaction.message.staticAccountKeys || tx.transaction.message.accountKeys;
      const adminIndex = accountKeys.findIndex(
        (key) => key.toBase58() === adminPubkey.toBase58()
      );
      const senderIndex = accountKeys.findIndex(
        (key) => key.toBase58() === fromPubkey.toBase58()
      );

      if (adminIndex === -1 || senderIndex === -1) {
        return res.status(400).json({ error: "Transaction does not involve expected wallets" });
      }

      // Check the amount received by admin
      const preBalance = tx.meta.preBalances[adminIndex];
      const postBalance = tx.meta.postBalances[adminIndex];
      const receivedLamports = postBalance - preBalance;
      const receivedSol = receivedLamports / LAMPORTS_PER_SOL;

      // Fetch SOL price with caching and fallback
      const expectedUsd = PLAN_PRICES[billingCycle];
      let solPriceUsd;
      try {
        solPriceUsd = await getSolPriceUsd();
      } catch (priceErr) {
        console.error("Failed to fetch SOL price:", priceErr);
        return res.status(503).json({ error: "Unable to verify SOL price. Please retry.", retryAfter: 60 });
      }

      const expectedSol = expectedUsd / solPriceUsd;
      const tolerance = 0.10; // 10% tolerance for price fluctuation during tx
      if (receivedSol < expectedSol * (1 - tolerance)) {
        return res.status(400).json({
          error: `Insufficient payment. Expected ~${expectedSol.toFixed(4)} SOL, received ${receivedSol.toFixed(4)} SOL`,
        });
      }

      // All checks passed — write subscription data server-side
      const now = new Date();
      const durationDays = billingCycle === "annual" ? 365 : 30;
      const endDate = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

      const batch = db.batch();

      // Update user subscription
      const userRef = db.collection("users").doc(walletAddress);
      batch.set(userRef, {
        subscriptionStatus: "pioneer",
        upgradedAt: now.toISOString(),
        billingCycle,
        subscriptionStartDate: now.toISOString(),
        subscriptionEndDate: endDate.toISOString(),
        originalPrice: expectedUsd,
        finalPrice: receivedSol,
      }, { merge: true });

      // Record transaction
      batch.create(db.collection("transactions").doc(), {
        walletId: walletAddress,
        PlanTitle: "Pioneer Plan",
        solAmount: receivedSol.toFixed(4),
        solLink: `https://solscan.io/tx/${transactionSignature}`,
        price: `$ ${expectedUsd.toFixed(2)}`,
        date: now.toISOString(),
        verifiedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Mark transaction as processed — create() fails if doc already exists,
      // providing atomic uniqueness and preventing TOCTOU race conditions
      batch.create(db.collection("processedTransactions").doc(transactionSignature), {
        walletAddress,
        processedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      try {
        await batch.commit();
      } catch (batchError) {
        // create() throws if processedTransactions doc already exists (replay attempt)
        if (batchError.code === 6 || batchError.message?.includes("already exists")) {
          return res.status(400).json({ error: "Transaction already processed" });
        }
        throw batchError;
      }

      return res.json({
        success: true,
        subscriptionStatus: "pioneer",
        subscriptionEndDate: endDate.toISOString(),
      });
    } catch (error) {
      console.error("Error in verifySubscription:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

// MetaMask signature verification endpoint
exports.verifyMetaMask = onRequest(
  {
    region: "us-central1",
    cors: ALLOWED_ORIGINS,
    invoker: "public",
  },
  async (req, res) => {
    if (req.method === "OPTIONS") {
      return res.status(204).send("");
    }
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    const clientIp = req.ip || req.headers["x-forwarded-for"] || "unknown";
    if (!checkRateLimit(clientIp)) {
      return res.status(429).json({ error: "Too many requests." });
    }

    try {
      const { address, signature, message, nonce } = req.body;
      if (!address || !signature || !message || !nonce) {
        return res.status(400).json({ error: "Missing parameters: address, signature, message, nonce" });
      }

      // Validate nonce
      const nonceValid = await consumeNonce(address.toLowerCase(), nonce);
      if (!nonceValid) {
        return res.status(401).json({ error: "Invalid or expired nonce" });
      }
      if (!message.includes(nonce)) {
        return res.status(401).json({ error: "Nonce not found in signed message" });
      }

      // Verify the signature matches the claimed address
      const recoveredAddress = ethers.verifyMessage(message, signature);
      if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
        return res.status(401).json({ error: "Signature verification failed" });
      }

      // Create a Firebase custom token using the wallet address as uid
      const customToken = await admin.auth().createCustomToken(address.toLowerCase(), {
        walletType: "MetaMask",
      });

      return res.json({ customToken });
    } catch (error) {
      console.error("Error in verifyMetaMask:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Freighter (Stellar) signature verification endpoint
exports.verifyFreighter = onRequest(
  {
    region: "us-central1",
    cors: ALLOWED_ORIGINS,
    invoker: "public",
  },
  async (req, res) => {
    if (req.method === "OPTIONS") {
      return res.status(204).send("");
    }
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    const clientIp = req.ip || req.headers["x-forwarded-for"] || "unknown";
    if (!checkRateLimit(clientIp)) {
      return res.status(429).json({ error: "Too many requests." });
    }

    try {
      const { publicKey, signature, message, nonce } = req.body;
      if (!publicKey || !signature || !message || !nonce) {
        return res.status(400).json({ error: "Missing parameters: publicKey, signature, message, nonce" });
      }

      // Validate nonce
      const nonceValid = await consumeNonce(publicKey, nonce);
      if (!nonceValid) {
        return res.status(401).json({ error: "Invalid or expired nonce" });
      }
      if (!message.includes(nonce)) {
        return res.status(401).json({ error: "Nonce not found in signed message" });
      }

      // Stellar uses ed25519 — verify with tweetnacl
      const messageBytes = Buffer.from(message);
      const signatureBytes = Buffer.from(signature, "base64");

      // Decode Stellar StrKey (G...) to raw 32-byte ed25519 public key
      // StrKey = base32(versionByte + 32-byte-key + 2-byte-crc16)
      const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
      const decodeBase32 = (str) => {
        let bits = 0, value = 0;
        const output = [];
        for (const c of str) {
          const idx = BASE32_ALPHABET.indexOf(c);
          if (idx === -1) continue;
          value = (value << 5) | idx;
          bits += 5;
          if (bits >= 8) {
            bits -= 8;
            output.push((value >>> bits) & 0xff);
          }
        }
        return Buffer.from(output);
      };
      const decoded = decodeBase32(publicKey);
      // Strip version byte (first) and CRC16 checksum (last 2)
      const publicKeyBytes = decoded.slice(1, 33);

      const isVerified = nacl.sign.detached.verify(
        messageBytes,
        signatureBytes,
        publicKeyBytes
      );

      if (!isVerified) {
        return res.status(401).json({ error: "Signature verification failed" });
      }

      // Create a Firebase custom token
      const customToken = await admin.auth().createCustomToken(publicKey, {
        walletType: "Freighter",
      });

      return res.json({ customToken });
    } catch (error) {
      console.error("Error in verifyFreighter:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Unstoppable Domains verification endpoint
// Validates the UAuth idToken server-side before issuing a Firebase custom token
exports.verifyUnstoppable = onRequest(
  {
    region: "us-central1",
    cors: ALLOWED_ORIGINS,
    secrets: [udJwt],
    invoker: "public",
  },
  async (req, res) => {
    if (req.method === "OPTIONS") {
      return res.status(204).send("");
    }
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    const clientIp = req.ip || req.headers["x-forwarded-for"] || "unknown";
    if (!checkRateLimit(clientIp)) {
      return res.status(429).json({ error: "Too many requests." });
    }

    try {
      const { accessToken, sub } = req.body;
      if (!accessToken || !sub) {
        return res.status(400).json({ error: "Missing parameters: accessToken, sub" });
      }

      // Verify the accessToken by checking with UD's userinfo endpoint
      const userinfoRes = await fetch("https://auth.unstoppabledomains.com/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!userinfoRes.ok) {
        return res.status(401).json({ error: "Invalid Unstoppable Domains token" });
      }

      const userinfo = await userinfoRes.json();
      if (userinfo.sub !== sub) {
        return res.status(401).json({ error: "Token subject does not match claimed identity" });
      }

      const customToken = await admin.auth().createCustomToken(sub, {
        walletType: "Unstoppable",
      });

      return res.json({ customToken });
    } catch (error) {
      console.error("Error in verifyUnstoppable:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);
