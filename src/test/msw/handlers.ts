import { http, HttpResponse } from 'msw';
import type { AppCatalog } from '../../federation/catalog';

/**
 * A valid catalog fixture mirroring public/remotes.manifest.json — the
 * happy-path response for the manifest endpoint.
 */
export const validCatalog: AppCatalog = {
  version: 1,
  apps: [
    {
      id: 'calculator',
      title: 'Calculator',
      icon: 'calculator',
      type: 'remote',
      defaultSize: { w: 320, h: 480 },
      remote: {
        name: 'remoteCalculator',
        module: 'CalculatorApp',
        entryUrl: 'https://remote-calculator-sage.vercel.app/mf-manifest.json',
        devEntryUrl: 'http://localhost:5001/mf-manifest.json',
      },
    },
    {
      id: 'notes',
      title: 'Notes',
      icon: 'sticky-note',
      type: 'remote',
      defaultSize: { w: 380, h: 420 },
      remote: {
        name: 'remoteNotes',
        module: 'NotesApp',
        entryUrl: 'https://remote-notes.vercel.app/mf-manifest.json',
        devEntryUrl: 'http://localhost:5002/mf-manifest.json',
      },
    },
    {
      id: 'network',
      title: 'Network',
      icon: 'network',
      type: 'remote',
      defaultSize: { w: 860, h: 620 },
      remote: {
        name: 'remoteNetwork',
        module: 'NetworkApp',
        entryUrl: 'https://remote-network.vercel.app/mf-manifest.json',
        devEntryUrl: 'http://localhost:5003/mf-manifest.json',
      },
    },
  ],
};

/** Matches the manifest fetch on any host (happy-dom resolves the relative URL). */
export const MANIFEST_PATTERN = '*/remotes.manifest.json';

export const handlers = [
  http.get(MANIFEST_PATTERN, () => HttpResponse.json(validCatalog)),
];
