// Use Firebase Functions v2
const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const nacl = require("tweetnacl");
const { PublicKey } = require("@solana/web3.js");
const fetch = require("node-fetch");
const cors = require("cors")({ origin: true }); // For manual CORS handling
const nodemailer = require("nodemailer");

// 1) Define your secret using firebase-functions/params
const udJwt = defineSecret("UD_JWT");
const EMAIL_USER = defineSecret("EMAIL_USER");
const EMAIL_PASS = defineSecret("EMAIL_PASS");
// 2) Initialize Firebase Admin
admin.initializeApp();



exports.sendSupportEmail = onRequest(
  {
    secrets: [EMAIL_USER, EMAIL_PASS],
    cors: true,        // For v2, handles OPTIONS automatically
    invoker: "public", // Make it publicly callable
  },
  (req, res) => {
    cors(req, res, async () => {
      if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
      }

      try {
        // Parse incoming data
        const { text, imageBase64 } = req.body;

        // Validate
        if (!text || text.trim().length === 0) {
          return res.status(400).json({ error: "Message text is required" });
        }

        // Create a Nodemailer transporter
        // Example uses Gmail; adapt as needed (service, port, auth, etc.)
        let transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: EMAIL_USER.value(),
            pass: EMAIL_PASS.value(),
          },
        });

        // Build mail options
        const mailOptions = {
          from: EMAIL_USER.value(),           // Sender (your developer email)
          to: "developer@example.com",        // The developer's address
          subject: "New Support Request",     // Email subject
          text: text,                         // Email body in plain text
        };

        // If an image was provided, attach it
        if (imageBase64) {
          // imageBase64 should be something like "data:image/png;base64,iVBORw0KGgoAAAANS..."
          // We can split off the 'base64,' part and use the remainder as raw base64 data
          const base64Data = imageBase64.split("base64,")[1];
          mailOptions.attachments = [
            {
              filename: "screenshot.png", // Or any name you prefer
              content: base64Data,
              encoding: "base64",
            },
          ];
        }

        // Send the email
        await transporter.sendMail(mailOptions);

        // Respond success
        return res.json({ success: true, message: "Email sent successfully" });
      } catch (error) {
        console.error("Error sending support email:", error);
        return res.status(500).json({ error: error.message });
      }
    });
  }
);
// 3) Reverse Lookup Function
exports.reverseLookup = onRequest(
  {
    // This ensures the function can read your UD_JWT secret
    secrets: [udJwt],
    // You can also specify region, e.g. region: "us-central1",
    cors: true,           // Tells Functions v2 to handle OPTIONS automatically
    invoker: "public",    // Let it be publicly callable
  },
  (req, res) => {
    // Use the cors middleware
    cors(req, res, async () => {
      if (req.method !== "GET") {
        return res.status(405).json({ error: "Method Not Allowed" });
      }

      try {
        // 4) Retrieve the secret value (JWT)
        const jwtValue = udJwt.value();
        if (!jwtValue) {
          return res.status(500).json({ error: "UD JWT not configured" });
        }

        // Check query param
        const address = req.query.address;
        if (!address) {
          return res.status(400).json({ error: "Missing address parameter" });
        }

        // Build the UD Partner API URL
        const apiUrl = `https://api.unstoppabledomains.com/partner/v3/owners/${address}/domains`;
        const queryParams = new URLSearchParams({ "$expand": "records" }).toString();
        const fullUrl = `${apiUrl}?${queryParams}`;

        // 5) Make the request
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
    });
  }
);

// 6) Existing Phantom verification endpoint (unchanged)
exports.verifyPhantom = onRequest(
  {
    region: "us-central1",
    cors: true,
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
      console.error("Error in verifyPhantom:", error);
      return res.status(500).json({ error: error.message });
    }
  }
);


