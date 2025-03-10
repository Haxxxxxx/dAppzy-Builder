// functions/index.js
const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const nacl = require("tweetnacl");
const { PublicKey } = require("@solana/web3.js");

admin.initializeApp();

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
