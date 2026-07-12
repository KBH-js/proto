/**
 * Host Entry Point (async boundary)
 *
 * Module Federation shared modules (react/react-dom) cannot be imported
 * eagerly from the entry chunk. This dynamic import creates the async
 * boundary that lets the MF runtime negotiate shared modules first.
 * The real render logic lives in bootstrap.tsx.
 */
import('./bootstrap');
