import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

/**
 * MSW service worker for STANDALONE dev only. Started from bootstrap.tsx so the
 * standalone page performs real `/api/nova/*` REST (visible in DevTools).
 *
 * Not used when embedded in the host: a service worker can't be registered
 * cross-origin, so the api facade falls back to the in-memory db there.
 */
export const worker = setupWorker(...handlers);
