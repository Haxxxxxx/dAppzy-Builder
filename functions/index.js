// Use Firebase Functions v2
const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const nacl = require("tweetnacl");
const { PublicKey } = require("@solana/web3.js");
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

    try {
      const jwtValue = udJwt.value();
      if (!jwtValue) {
        return res.status(500).json({ error: "UD JWT not configured" });
      }

      const address = req.query.address;
      if (!address) {
        return res.status(400).json({ error: "Missing address parameter" });
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
        "Lets create your beta accout reserved for testing issues ! Thanks for your QA and enjoy your time."
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


