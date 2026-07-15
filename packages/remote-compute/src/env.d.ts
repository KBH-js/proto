/// <reference types="@rsbuild/core/types" />

interface Window {
  /** Set by the standalone bootstrap once the MSW worker is running, so the
   *  api facade uses real `fetch`+MSW. Undefined when embedded in the host
   *  (no service worker cross-origin) → the facade falls back to in-memory. */
  __PROTO_COMPUTE_MSW__?: boolean;
  /** Seeded + updated by the host federation bridge (see src/federation/hostBridge.ts). */
  __PROTO_LOCALE__?: 'ko' | 'en';
}
