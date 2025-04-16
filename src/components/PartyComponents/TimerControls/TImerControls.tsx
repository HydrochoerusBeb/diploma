'use client';

import { Timer } from '@/actions/party';

interface TimerControlsProps {
  sessionId: string | null;
  timerUrl: string | null;
  timer: Timer;
  controlTimer: (action: 'pause' | 'resume') => Promise<void>;
}

export default function TimerControls({
  sessionId,
  timerUrl,
  timer,
  controlTimer,
}: TimerControlsProps) {
  const formatDuration = (seconds: number): string => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  return (
    <div className="pt-4">
      <h2 className="font-semibold">
        Таймер партии: {formatDuration(timer.elapsedSeconds)}
      </h2>
      <button
        onClick={() => controlTimer('pause')}
        className="bg-yellow-500 text-white px-4 py-2 rounded disabled:bg-gray-400 mr-2"
        disabled={!sessionId || !timerUrl || !timer.isRunning}
      >
        Пауза
      </button>
      <button
        onClick={() => controlTimer('resume')}
        className="bg-yellow-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
        disabled={!sessionId || !timerUrl || timer.isRunning}
      >
        Возобновить
      </button>
    </div>
  );
}