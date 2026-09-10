/**
 * AES encryption for the login/registration form payload. Mirrors amazon-subs-fe
 * and the fahrly frontend: `{ email, password, … }` is AES-encrypted with
 * `VITE_FORM_ENCRYPTION_KEY` before it leaves the browser, and the backend
 * decrypts it with the same key (crypto-js default format → salt + IV embedded
 * in the ciphertext).
 *
 * NOTE: this is obfuscation, not a secret. Vite inlines `VITE_*` values into the
 * public bundle, so this key ships to every browser — real transport
 * confidentiality comes from HTTPS. The layer exists to match the backend
 * contract; never treat the key as private.
 */
import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = import.meta.env.VITE_FORM_ENCRYPTION_KEY ?? '';

export function encryptPayload(data: object): string {
  if (!ENCRYPTION_KEY) {
    throw new Error('VITE_FORM_ENCRYPTION_KEY is not set — restart the dev server');
  }
  return CryptoJS.AES.encrypt(JSON.stringify(data), ENCRYPTION_KEY).toString();
}
