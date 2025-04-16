'use client';

import { useState } from 'react';
import { LogEntry } from '@/actions/party';

interface LogFormProps {
  sessionId: string | null;
  logUrl: string | null;
  sendLog: (log: LogEntry) => Promise<void>;
 
}

export default function LogForm({ sessionId, logUrl, sendLog }: LogFormProps) {
  const [logMessage, setLogMessage] = useState('');
  const [logType, setLogType] = useState<'combat' | 'loot' | 'event'>('event');

  const handleSend = async () => {
    if (!logMessage) {
      alert('Введите сообщение');
      return;
    }
    await sendLog({
      type: logType,
      timestamp: new Date().toISOString(),
      message: logMessage,
    });
    setLogMessage('');
  };

  return (
    <div className="pt-4">
      <select
        value={logType}
        onChange={(e) => setLogType(e.target.value as 'combat' | 'loot' | 'event')}
        className="border p-2 mr-2"
        disabled={!sessionId}
      >
        <option value="combat">Бой</option>
        <option value="loot">Лут</option>
        <option value="event">Событие</option>
      </select>
      <input
        placeholder="Сообщение"
        value={logMessage}
        onChange={(e) => setLogMessage(e.target.value)}
        className="border p-2 w-1/2"
        disabled={!sessionId}
      />
      <button
        onClick={handleSend}
        className="bg-green-500 text-white px-4 py-2 mt-2 rounded disabled:bg-gray-400"
        disabled={!sessionId || !logUrl}
      >
        Отправить лог
      </button>
    </div>
  );
}