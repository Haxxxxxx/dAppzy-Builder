// functions/index.js
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors");
const nacl = require("tweetnacl");  // <-- import tweetnacl
const { PublicKey } = require("@solana/web3.js");

admin.initializeApp();
const corsHandler = cors({ origin: true });

exports.verifyPhantom = functions.https.onRequest(async (req, res) => {
  return corsHandler(req, res, async () => {
    try {
      if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
      }

      const { publicKey, signature } = req.body;
      if (!publicKey || !signature) {
        return res.status(400).json({ error: "Missing parameters" });
      }

      // Convert data to Buffers
      const signatureBuffer = Buffer.from(signature);
      const messageBuffer = Buffer.from("Please sign this message to confirm your identity.");

      // Create a Solana PublicKey object
      const pubKey = new PublicKey(publicKey);

      // Convert the public key to bytes so tweetnacl can use it
      const pubKeyBytes = pubKey.toBytes();

      // Use nacl.sign.detached.verify
      const isVerified = nacl.sign.detached.verify(
        messageBuffer,
        signatureBuffer,
        pubKeyBytes
      );

      if (!isVerified) {
        return res.status(401).json({ error: "Signature verification failed" });
      }

      // If the signature is valid, create a custom token
      const customToken = await admin.auth().createCustomToken(publicKey, {
        walletType: "Phantom",
      });

      return res.json({ customToken });
    } catch (error) {
      console.error("Error in verifyPhantom:", error);
      return res.status(500).json({ error: error.message });
    }
  });
});
