import CalculatorApp from './CalculatorApp';

// Standalone entry for `pnpm dev`. When loaded via Module Federation,
// only CalculatorApp is exposed and this wrapper is not used.
export default function App() {
  return (
    <div className="min-h-screen bg-background-primary flex items-center justify-center p-4">
      <div className="w-full max-w-xs h-[31.25rem] rounded-xl overflow-hidden shadow-window border border-chrome-border">
        <CalculatorApp />
      </div>
    </div>
  );
}
