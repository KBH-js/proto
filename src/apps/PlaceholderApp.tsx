interface PlaceholderAppProps {
  title?: string;
}

/**
 * A simple placeholder application component for testing windows.
 * This can be replaced with actual app content later.
 */
export function PlaceholderApp({ title = 'Placeholder' }: PlaceholderAppProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-50 p-4">
      <div className="text-6xl mb-4">📦</div>
      <h2 className="text-xl font-semibold text-gray-700 mb-2">{title}</h2>
      <p className="text-gray-500 text-center text-sm">
        This is a placeholder application.
        <br />
        Replace this with your actual app content.
      </p>
    </div>
  );
}

/**
 * About app - displays system information
 */
export function AboutApp() {
  return (
    <div className="flex flex-col h-full bg-white p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="text-5xl">🖥️</div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Window Manager</h2>
          <p className="text-gray-500">Version 1.0.0</p>
        </div>
      </div>
      
      <div className="space-y-3 text-sm text-gray-600">
        <p>
          A web-based window manager system built with React 19, TypeScript, 
          Tailwind CSS, and Zustand.
        </p>
        
        <div className="pt-4 border-t border-gray-200">
          <h3 className="font-semibold text-gray-700 mb-2">Features</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Draggable windows</li>
            <li>Resizable windows</li>
            <li>Focus management (z-index)</li>
            <li>Minimize / Maximize / Restore</li>
            <li>Taskbar with window list</li>
            <li>Desktop with app launcher</li>
          </ul>
        </div>
        
        <div className="pt-4 border-t border-gray-200">
          <h3 className="font-semibold text-gray-700 mb-2">Tech Stack</h3>
          <div className="flex flex-wrap gap-2">
            {['React 19', 'TypeScript', 'Tailwind CSS', 'Zustand', 'react-rnd'].map((tech) => (
              <span
                key={tech}
                className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Settings app - placeholder for system settings
 */
export function SettingsApp() {
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Settings</h2>
      </div>
      
      <div className="flex-1 p-4 space-y-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-700 mb-2">Display</h3>
          <p className="text-sm text-gray-500">
            Display settings will be available in a future update.
          </p>
        </div>
        
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-700 mb-2">Appearance</h3>
          <p className="text-sm text-gray-500">
            Theme customization coming soon.
          </p>
        </div>
        
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-700 mb-2">About</h3>
          <p className="text-sm text-gray-500">
            Window Manager v1.0.0
          </p>
        </div>
      </div>
    </div>
  );
}
