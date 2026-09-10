/// <reference types="vite/client" />

/** The `VITE_*` values this app reads. Both are optional at the type level —
 * `.env.local` is not committed, so a fresh clone has neither, and the code
 * that reads them handles absence explicitly. */
interface ImportMetaEnv {
  /** Base URL of the NestJS backend, including the `/api` prefix. */
  readonly VITE_API_URL?: string;
  /** AES key for the login/registration form body; must match the backend's
   * FORM_ENCRYPTION_KEY. Inlined into the public bundle — not a secret. */
  readonly VITE_FORM_ENCRYPTION_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
