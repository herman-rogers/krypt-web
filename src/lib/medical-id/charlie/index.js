import create from "../../factory";
import { arrayBufferToHex } from "../../utilities";
import { CHARLIE, CHARLIE_STATIC_SALT } from "../../constants";

const scrypt = create("scrypt");
const gcm = create("AES-GCM");

export { CHARLIE_STATIC_SALT };
/**
 * @param secret {string}
 * @param salt {string}
 * @returns {ArrayBuffer}
 */
export function hash(secret, salt) {
  try {
    const key = scrypt.generateKey(secret, salt, { dkLen: 64, r: 10 });
    return new Uint8Array(key).buffer;
  } catch (e) {
    throw new Error("HashFailed");
  }
}

/**
 * Given a hashed ArrayBuffer, returns a concatenated string
 * that contains the version of the encryption its being
 * used and the incoming string in hex format
 * @param hashed {ArrayBuffer}
 * @returns {string}
 */
export function fingerprint(hashed) {
  const hexFingerprintSecret = arrayBufferToHex(hashed);
  return `${CHARLIE}:${hexFingerprintSecret}`;
}

/**
 * Takes an array, splits it in half,
 * from the first bit creates an ArrayBuffer
 * from the second bit creates a string that
 * contains a secret but also indicates the version of the algorithm used
 * @param arrayBuffer {ArrayBuffer}
 * @returns {{fingerprintFile: string, key: ArrayBuffer}}
 */
export function splitKeys(arrayBuffer) {
  const key = arrayBuffer.slice(0, arrayBuffer.byteLength / 2);
  const fingerprintFile = fingerprint(
    arrayBuffer.slice(arrayBuffer.byteLength / 2, arrayBuffer.byteLength)
  );

  return {
    key: new Uint8Array(key).buffer,
    fingerprintFile
  };
}

/**
 * @param key {ArrayBuffer}
 * @param iv {ArrayBuffer}
 * @param toEncryptBytes {ArrayBuffer}
 * @returns {Promise<ArrayBuffer>}
 */
export async function encrypt(key, iv, toEncryptBytes) {
  try {
    const cryptoKey = await gcm.importKey(key);
    return await gcm.encrypt(cryptoKey, iv, toEncryptBytes);
  } catch (e) {
    throw new Error("EncryptionFailed");
  }
}

/**
 * @param key {ArrayBuffer}
 * @param iv {ArrayBuffer}
 * @param encryptedBytes {ArrayBuffer}
 * @returns {Promise<ArrayBuffer>}
 */
export async function decrypt(key, iv, encryptedBytes) {
  try {
    const cryptoKey = await gcm.importKey(key);
    return await gcm.decrypt(cryptoKey, iv, encryptedBytes);
  } catch (e) {
    throw new Error("DecryptionFailed");
  }
}
