import { JSEncrypt } from "JsEncrypt";

export const encryptWithPublicKey = (
  publicKey: string,
  message: string
): string | false => {
  const encryptor = new JSEncrypt();
  encryptor.setPublicKey(publicKey);
  return encryptor.encrypt(message);
};

export const decryptWithPrivateKey = (
  privateKey: string,
  encrypted: string
): string | false => {
  const decryptor = new JSEncrypt();
  decryptor.setPrivateKey(privateKey);
  return decryptor.decrypt(encrypted);
};

export async function generateKeyPair(): Promise<{
  publicKey: string;
  privateKey: string;
}> {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
      hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt"]
  );

  const publicKey = await window.crypto.subtle.exportKey(
    "spki",
    keyPair.publicKey
  );
  const privateKey = await window.crypto.subtle.exportKey(
    "pkcs8",
    keyPair.privateKey
  );

  const publicKeyAsString = convertKeyToString(publicKey, "PUBLIC KEY");
  const privateKeyAsString = convertKeyToString(privateKey, "PRIVATE KEY");

  return {
    publicKey: publicKeyAsString,
    privateKey: privateKeyAsString,
  };
}

function convertKeyToString(key: ArrayBuffer, label: string) {
  const base64String = window.btoa(String.fromCharCode(...new Uint8Array(key)));
  const formatted = base64String.match(/.{1,64}/g)?.join("\n");
  return `-----BEGIN ${label}-----\n${formatted}\n-----END ${label}-----`;
}
