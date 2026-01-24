import { 
  Package, 
  Monitor, 
  Settings, 
  Cpu, 
  HardDrive, 
  Wifi,
  Move,
  Maximize2,
  Layers,
  Minimize2,
  LayoutGrid,
  PanelBottom
} from 'lucide-react';

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
      <Package className="w-16 h-16 text-gray-400 mb-4" />
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
    <div className="flex flex-col h-full bg-white p-6 overflow-auto">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
          <Monitor className="w-8 h-8 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">KBH-OS</h2>
          <p className="text-gray-500">Version 1.0.0 (Micro-Frontend)</p>
        </div>
      </div>
      
      {/* System Info Cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="p-3 bg-gray-50 rounded-lg text-center">
          <Cpu className="w-5 h-5 mx-auto mb-1 text-blue-500" />
          <p className="text-xs text-gray-500">React 19</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg text-center">
          <HardDrive className="w-5 h-5 mx-auto mb-1 text-green-500" />
          <p className="text-xs text-gray-500">Zustand</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg text-center">
          <Wifi className="w-5 h-5 mx-auto mb-1 text-purple-500" />
          <p className="text-xs text-gray-500">Federation</p>
        </div>
      </div>
      
      <div className="space-y-3 text-sm text-gray-600">
        <p>
          A web-based window manager demonstrating <strong>Micro-Frontend Architecture</strong> with 
          Module Federation. Built as a portfolio piece to showcase frontend engineering skills.
        </p>
        
        <div className="pt-4 border-t border-gray-200">
          <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-500" />
            Features
          </h3>
          <ul className="space-y-1">
            {[
              { icon: Move, text: 'Draggable windows' },
              { icon: Maximize2, text: 'Resizable windows' },
              { icon: Layers, text: 'Focus management (z-index)' },
              { icon: Minimize2, text: 'Minimize / Maximize / Restore' },
              { icon: PanelBottom, text: 'Taskbar with window list' },
              { icon: LayoutGrid, text: 'Desktop with app launcher' },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-2 text-gray-600">
                <Icon className="w-3 h-3 text-gray-400" />
                {text}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="pt-4 border-t border-gray-200">
          <h3 className="font-semibold text-gray-700 mb-2">Tech Stack</h3>
          <div className="flex flex-wrap gap-2">
            {[
              { name: 'React 19', color: 'bg-cyan-100 text-cyan-700' },
              { name: 'TypeScript', color: 'bg-blue-100 text-blue-700' },
              { name: 'Tailwind CSS', color: 'bg-teal-100 text-teal-700' },
              { name: 'Zustand', color: 'bg-orange-100 text-orange-700' },
              { name: 'Module Federation', color: 'bg-purple-100 text-purple-700' },
              { name: 'react-rnd', color: 'bg-pink-100 text-pink-700' },
            ].map((tech) => (
              <span
                key={tech.name}
                className={`px-2 py-1 rounded text-xs font-medium ${tech.color}`}
              >
                {tech.name}
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
      <div className="p-4 border-b border-gray-200 flex items-center gap-3">
        <Settings className="w-5 h-5 text-gray-600" />
        <h2 className="text-lg font-semibold text-gray-800">Settings</h2>
      </div>
      
      <div className="flex-1 p-4 space-y-4 overflow-auto">
        <div className="p-4 bg-gray-50 rounded-lg flex items-start gap-3">
          <Monitor className="w-5 h-5 text-blue-500 mt-0.5" />
          <div>
            <h3 className="font-medium text-gray-700 mb-1">Display</h3>
            <p className="text-sm text-gray-500">
              Display settings will be available in a future update.
            </p>
          </div>
        </div>
        
        <div className="p-4 bg-gray-50 rounded-lg flex items-start gap-3">
          <Layers className="w-5 h-5 text-purple-500 mt-0.5" />
          <div>
            <h3 className="font-medium text-gray-700 mb-1">Appearance</h3>
            <p className="text-sm text-gray-500">
              Theme customization coming soon.
            </p>
          </div>
        </div>
        
        <div className="p-4 bg-gray-50 rounded-lg flex items-start gap-3">
          <Cpu className="w-5 h-5 text-green-500 mt-0.5" />
          <div>
            <h3 className="font-medium text-gray-700 mb-1">About</h3>
            <p className="text-sm text-gray-500">
              KBH-OS v1.0.0 — Micro-Frontend Portfolio Demo
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
