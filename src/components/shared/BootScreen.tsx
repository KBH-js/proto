import { useState, useEffect } from 'react';
import { Terminal, Wifi, CheckCircle2, Loader2 } from 'lucide-react';
import { useTranslation } from '../../i18n';

interface BootScreenProps {
  onBootComplete: () => void;
  duration?: number;
}

const bootMessages = [
  { key: 'boot.init', icon: Terminal, delay: 0 },
  { key: 'boot.loadingRemotes', icon: Wifi, delay: 250 },
  { key: 'boot.startingWm', icon: Loader2, delay: 500 },
  { key: 'boot.ready', icon: CheckCircle2, delay: 750 },
];

/** Terminal-style boot animation shown before the desktop appears */
export function BootScreen({ onBootComplete, duration = 1000 }: BootScreenProps) {
  const [visibleMessages, setVisibleMessages] = useState<number>(0);
  const [fadeOut, setFadeOut] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const messageTimers = bootMessages.map((msg, index) => {
      return setTimeout(() => {
        setVisibleMessages(index + 1);
      }, msg.delay);
    });

    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, duration - 200);

    const completeTimer = setTimeout(() => {
      onBootComplete();
    }, duration);

    return () => {
      messageTimers.forEach(clearTimeout);
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onBootComplete, duration]);

  return (
    <div
      className={`
        fixed inset-0 z-[99999] bg-black
        flex flex-col items-center justify-center
        font-mono text-sm
        transition-opacity duration-200
        ${fadeOut ? 'opacity-0' : 'opacity-100'}
      `}
    >
      {/* Logo/Title */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Terminal className="w-10 h-10 text-green-400" />
          <h1 className="text-3xl font-bold text-green-400 tracking-wider">KBH-Desktop</h1>
        </div>
        <p className="text-green-600 text-xs">{t('boot.subtitle')}</p>
      </div>

      {/* Boot messages */}
      <div className="w-full max-w-lg px-8 space-y-1">
        {bootMessages.slice(0, visibleMessages).map((msg, index) => {
          const Icon = msg.icon;
          const isLast = index === visibleMessages - 1;
          const isComplete = index < visibleMessages - 1 || msg.icon === CheckCircle2;
          
          return (
            <div
              key={index}
              className={`
                flex items-center gap-3 text-xs
                ${isComplete ? 'text-green-400' : 'text-green-600'}
                ${isLast && msg.icon !== CheckCircle2 ? 'animate-pulse' : ''}
              `}
            >
              <Icon className={`w-4 h-4 ${isLast && msg.icon === Loader2 ? 'animate-spin' : ''}`} />
              <span>{t(msg.key)}</span>
              {isComplete && msg.icon !== CheckCircle2 && (
                <span className="text-green-500 ml-auto">[OK]</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Loading bar */}
      <div className="mt-8 w-full max-w-lg px-8">
        <div className="h-1 bg-green-900 rounded-full overflow-hidden">
          <div 
            className="h-full bg-green-400 transition-all duration-200 ease-out"
            style={{ width: `${(visibleMessages / bootMessages.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Blinking cursor effect */}
      <div className="mt-4 flex items-center gap-1 text-green-400">
        <span className="text-xs">root@kbh-desktop:~$</span>
        <span className="w-2 h-4 bg-green-400 animate-pulse" />
      </div>
    </div>
  );
}
