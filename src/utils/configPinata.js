import { PinataSDK } from "pinata";

export const pinata = new PinataSDK({
  pinataJwt : process.env.REACT_PINATA_JWT,
  pinataGateway : process.env.REACT_GATEWAY_URL,
  pinata_api_key: process.env.REACT_PINATA_KEY,
  pinata_secret_api_key: process.env.REACT_PINATA_SECRET
});

// src/pinataConfig.js
export const pinataJwt = process.env.REACT_PINATA_JWT;
export const pinataGateway = process.env.REACT_GATEWAY_URL;
export const pinata_api_key = process.env.REACT_PINATA_KEY;
export const pinata_secret_api_key = process.env.REACT_PINATA_SECRET;
