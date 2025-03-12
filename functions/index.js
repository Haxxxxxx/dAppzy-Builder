const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const nacl = require("tweetnacl");
const { PublicKey } = require("@solana/web3.js");
const fetch = require("node-fetch");

admin.initializeApp();

// Existing Phantom verification endpoint (unchanged)
exports.verifyPhantom = onRequest(
  { region: "us-central1", cors: true, invoker: "public" },
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

      const signatureBuffer = Buffer.from(signature);
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

// Updated reverseLookup endpoint using the Partner API v3
exports.reverseLookup = onRequest(
  { region: "us-central1", cors: true, invoker: "public" },
  async (req, res) => {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }
    try {
      // Get the Ethereum address from the query parameters.
      const address = req.query.address;
      if (!address) {
        return res.status(400).json({ error: "Missing address parameter" });
      }

      const udJwt = process.env.UD_JWT; // Your UD API key (set as UD_JWT)
      if (!udJwt) {
        return res.status(500).json({ error: "UD JWT not configured" });
      }

      // Use the Partner API endpoint to look up domains owned by this address.
      const apiUrl = `https://api.unstoppabledomains.com/partner/v3/owners/${address}/domains`;
      const queryParams = new URLSearchParams({ "$expand": "records" }).toString();
      const fullUrl = `${apiUrl}?${queryParams}`;

      const response = await fetch(fullUrl, {
        method: "GET",
        headers: {
          "Authorization": `${udJwt}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        // Attempt to get error details from the UD API response.
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
