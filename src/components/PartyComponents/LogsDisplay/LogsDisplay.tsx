'use client';

import { LogEntry } from '@/actions/party';

interface LogsDisplayProps {
  logs: LogEntry[];
}

export default function LogsDisplay({ logs }: LogsDisplayProps) {
  return (
    <div className="pt-4">
      <h2 className="font-semibold">Логи</h2>
      <ul className="list-disc list-inside">
        {logs.length > 0 ? (
          logs.map((log, idx) => (
            <li key={idx}>
              [{log.timestamp}] {log.type === 'combat' && `Бой: ${log.message}`}
              {log.type === 'loot' && `Лут: ${log.message}`}
              {log.type === 'event' && `Событие: ${log.message}`}
            </li>
          ))
        ) : (
          <li>Логов пока нет</li>
        )}
      </ul>
    </div>
  );
}