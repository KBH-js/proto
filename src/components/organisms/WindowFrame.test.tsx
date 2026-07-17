import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { act, cleanup, render, screen } from '@testing-library/react';
import { WindowFrame } from './WindowFrame';
import { useAppRegistry, type AppRegistryEntry } from '../../registry/appRegistry';
import { usePrefsStore } from '../../store/prefsStore';
import { translate } from '../../i18n';
import type { WindowState } from '../../types/window.types';

// The MF runtime must never be exercised under vitest (no MF plugin, no real
// remote server). `vi.hoisted` gives the mock factory a stable spy reference
// even though vi.mock is hoisted above the imports.
const loadRemoteComponent = vi.hoisted(() => vi.fn());
vi.mock('../../federation/runtime', () => ({
  loadRemoteComponent,
  forceRefreshRemote: vi.fn(),
  registerAppRemotes: vi.fn(),
}));

// react-rnd is a drag/resize wrapper irrelevant here — render its children
// straight through so we can assert on the window content.
vi.mock('react-rnd', () => ({
  Rnd: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

const CALCULATOR_ENTRY: AppRegistryEntry = {
  isRemote: true,
  remote: {
    name: 'remoteCalculator',
    entry: 'http://localhost:5001/mf-manifest.json',
    module: 'CalculatorApp',
    prodEntry: 'https://remote-calculator-sage.vercel.app/mf-manifest.json',
  },
  defaultConfig: {
    componentType: 'calculator',
    title: 'Calculator',
    icon: 'calculator',
    defaultSize: { w: 400, h: 500 },
  },
};

const calculatorWindow: WindowState = {
  id: 'win-calc',
  title: 'Calculator',
  position: { x: 0, y: 0 },
  size: { w: 400, h: 500 },
  zIndex: 100,
  isMinimized: false,
  isMaximized: false,
  componentType: 'calculator',
};

// Registry is a module-level singleton — snapshot its pristine state so each
// test starts from the real boot state (locals only, status 'loading').
const pristineRegistry = useAppRegistry.getState();

const notFoundText = translate('ko', 'window.notFound', { type: 'calculator' });

function resolveCatalog() {
  act(() => {
    useAppRegistry.setState((state) => ({
      entries: { ...state.entries, calculator: CALCULATOR_ENTRY },
      status: 'ready',
    }));
  });
}

describe('WindowFrame remote rehydration', () => {
  beforeEach(() => {
    // The assertions below are Korean literals; pin the locale, since the
    // store default now follows navigator.language (en under happy-dom).
    usePrefsStore.setState({ locale: 'ko' });
    useAppRegistry.setState(pristineRegistry, true);
    loadRemoteComponent.mockReset();
    loadRemoteComponent.mockImplementation(() =>
      Promise.resolve({ default: () => <div>REMOTE_CALCULATOR</div> }),
    );
  });

  afterEach(() => {
    cleanup();
  });

  it('loads a persisted remote window once the catalog resolves after boot', async () => {
    // Boot state: the catalog has not resolved, so the rehydrated calculator
    // window has no registry entry yet.
    expect(useAppRegistry.getState().entries.calculator).toBeUndefined();

    render(<WindowFrame window={calculatorWindow} />);

    // Regression: before the fix the wrapper seeded to null here and never
    // recovered, leaving the "app not found" fallback permanently.
    expect(screen.getByText(notFoundText)).toBeTruthy();
    expect(loadRemoteComponent).not.toHaveBeenCalled();

    resolveCatalog();

    // The window re-seeds its lazy wrapper and the remote renders.
    expect(await screen.findByText('REMOTE_CALCULATOR')).toBeTruthy();
    expect(screen.queryByText(notFoundText)).toBeNull();
    expect(loadRemoteComponent).toHaveBeenCalledWith('remoteCalculator/CalculatorApp');
  });

  it('loads immediately when the entry is already present at mount', async () => {
    // A remote opened after boot (registry already 'ready') must still work —
    // guards against the fix regressing the normal path.
    resolveCatalog();

    render(<WindowFrame window={calculatorWindow} />);

    expect(await screen.findByText('REMOTE_CALCULATOR')).toBeTruthy();
    expect(screen.queryByText(notFoundText)).toBeNull();
  });
});
