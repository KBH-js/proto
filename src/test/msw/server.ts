import { setupServer } from 'msw/node';
import { handlers } from './handlers';

/** Shared MSW server — lifecycle wired in src/test/setup.ts. */
export const server = setupServer(...handlers);
