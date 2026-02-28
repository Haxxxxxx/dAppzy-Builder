// Use Firebase Functions v2
const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const nacl = require("tweetnacl");
const { PublicKey, Connection, LAMPORTS_PER_SOL } = require("@solana/web3.js");
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
const nodemailer = require("nodemailer");

// 1) Define your secret using firebase-functions/params
const udJwt = defineSecret("UD_JWT");
const EMAIL_USER = defineSecret("EMAIL_USER");
const EMAIL_PASS = defineSecret("EMAIL_PASS");
// 2) Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore(); // Firestore instance

exports.sendSupportEmail = onRequest(
  {
    secrets: [EMAIL_USER, EMAIL_PASS],
    cors: ALLOWED_ORIGINS,
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
    try {
      await admin.auth().verifyIdToken(authHeader.split("Bearer ")[1]);
    } catch (authError) {
      return res.status(401).json({ error: "Unauthorized — invalid auth token" });
    }

    try {
      const { text, imageBase64, userId } = req.body;

      // Validate
      if (!text || text.trim().length === 0) {
        return res.status(400).json({ error: "Message text is required" });
      }

      // 3) Store the text in Firestore (no image)
      await db.collection("supportRequests").add({
        message: text,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        userId:userId,
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
      return res.status(500).json({ error: error.message });
    }
  }
);
// Simple in-memory rate limiter for public endpoints
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 30; // max requests per window per IP

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { windowStart: now, count: 1 });
    return true;
  }
  entry.count++;
  if (entry.count > RATE_LIMIT_MAX) return false;
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
        return res.status(response.status).json({
          error: "Error fetching domain data from UD API",
          details: errorText,
        });
      }

      const data = await response.json();
      return res.json(data);
    } catch (error) {
      console.error("Error in reverseLookup:", error);
      return res.status(500).json({ error: error.message });
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

    try {
      const { publicKey, signature } = req.body;
      if (!publicKey || !signature) {
        return res.status(400).json({ error: "Missing parameters" });
      }

      const signatureBuffer = Buffer.from(signature, "base64");
      const messageBuffer = Buffer.from(
        "Lets create your beta account reserved for testing issues ! Thanks for your QA and enjoy your time."
      );

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
      return res.status(500).json({ error: error.message });
    }
  }
);

// Define secrets for subscription verification
const SOLANA_ADMIN_WALLET = defineSecret("SOLANA_ADMIN_WALLET");
const HELIUS_API_KEY = defineSecret("HELIUS_API_KEY");

// Plan pricing (must match client-side planConfig)
const PLAN_PRICES = { monthly: 20, annual: 16 };

exports.verifySubscription = onRequest(
  {
    secrets: [SOLANA_ADMIN_WALLET, HELIUS_API_KEY],
    cors: ALLOWED_ORIGINS,
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

      // Fetch SOL price for verification (allow 10% tolerance for price fluctuation)
      const expectedUsd = PLAN_PRICES[billingCycle];
      let solPriceUsd;
      try {
        const priceRes = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd");
        const priceData = await priceRes.json();
        solPriceUsd = priceData.solana.usd;
      } catch (priceErr) {
        console.error("Failed to fetch SOL price:", priceErr);
        return res.status(500).json({ error: "Failed to verify SOL price" });
      }

      const expectedSol = expectedUsd / solPriceUsd;
      const tolerance = 0.10; // 10% tolerance for price fluctuation during tx
      if (receivedSol < expectedSol * (1 - tolerance)) {
        return res.status(400).json({
          error: `Insufficient payment. Expected ~${expectedSol.toFixed(4)} SOL, received ${receivedSol.toFixed(4)} SOL`,
        });
      }

      // Check that this transaction hasn't been used before
      const txDoc = await db.collection("processedTransactions").doc(transactionSignature).get();
      if (txDoc.exists) {
        return res.status(400).json({ error: "Transaction already processed" });
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

      // Mark transaction as processed to prevent replay
      batch.set(db.collection("processedTransactions").doc(transactionSignature), {
        walletAddress,
        processedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      await batch.commit();

      return res.json({
        success: true,
        subscriptionStatus: "pioneer",
        subscriptionEndDate: endDate.toISOString(),
      });
    } catch (error) {
      console.error("Error in verifySubscription:", error);
      return res.status(500).json({ error: error.message });
    }
  }
);


