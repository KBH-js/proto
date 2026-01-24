import { MockHostProvider } from './MockHostProvider';
import CalculatorApp from './CalculatorApp';

/**
 * Standalone App Wrapper
 * 
 * This component wraps the CalculatorApp with the MockHostProvider
 * for standalone development mode. It provides:
 * 
 * 1. Mock host context (theme, locale)
 * 2. Full-page layout with centered calculator
 * 3. Dark background matching the OS theme
 * 
 * When running via `pnpm dev`, this is the root component rendered.
 * When loaded via Module Federation, only CalculatorApp is exposed.
 */
export default function App() {
  return (
    <MockHostProvider>
      <div className="min-h-screen bg-background-primary flex items-center justify-center p-4">
        {/* Calculator container with max dimensions */}
        <div className="w-full max-w-xs h-[500px] rounded-xl overflow-hidden shadow-window border border-chrome-border">
          <CalculatorApp />
        </div>
      </div>
    </MockHostProvider>
  );
}
