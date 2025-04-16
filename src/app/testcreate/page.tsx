'use client';

import { useState, useEffect } from 'react';
import { createSession, getLogs, getTimer, controlTimer, endSession, SessionData, LogEntry, SessionSummary } from '@/actions/party';

export default function PartyPage() {
  const [name, setName] = useState('');
  const [scenario, setScenario] = useState('');
  const [characters, setCharacters] = useState('');
  const [logMessage, setLogMessage] = useState('');
  const [logType, setLogType] = useState<'combat' | 'loot' | 'event'>('event');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [logUrl, setLogUrl] = useState<string | null>(null);
  const [timerUrl, setTimerUrl] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [timer, setTimer] = useState<{ isRunning: boolean; elapsedSeconds: number }>({ isRunning: true, elapsedSeconds: 0 });

  // Загрузка логов и таймера в реальном времени
  useEffect(() => {
    if (!sessionId) return;

    const interval = setInterval(async () => {
      const fetchedLogs = await getLogs(sessionId);
      setLogs(fetchedLogs);
      const timerData = await getTimer(sessionId);
      setTimer(timerData);
    }, 2000);

    return () => clearInterval(interval);
  }, [sessionId]);

  const handleCreate = async () => {
    if (!name || !scenario || !characters) {
      alert('Заполните все поля');
      return;
    }
    const sessionData: SessionData = {
      name,
      scenario,
      characters: characters.split(',').map(c => c.trim()),
    };
    try {
      const { sessionId, logUrl, timerUrl } = await createSession(sessionData);
      setSessionId(sessionId);
      setLogUrl(logUrl);
      setTimerUrl(timerUrl);
      setLogs([]);
      setSummary(null);
      setTimer({ isRunning: true, elapsedSeconds: 0 });
    } catch (err) {
      console.error('Ошибка создания сессии:', err);
      alert('Не удалось создать сессию');
    }
  };

  const handleSendLog = async () => {
    if (!logUrl || !logMessage) {
      console.log('logUrl или logMessage отсутствуют:', { logUrl, logMessage });
      return;
    }
    const logEntry: LogEntry = {
      type: logType,
      timestamp: new Date().toISOString(),
      message: logMessage,
    };
    console.log('Отправка лога:', logEntry, 'на URL:', logUrl);
    try {
      const response = await fetch(logUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logEntry),
      });
      if (!response.ok) {
        console.error('Ответ сервера не OK:', response.status, response.statusText);
        throw new Error('Ошибка отправки лога');
      }
      console.log('Лог успешно отправлен');
      setLogMessage('');
    } catch (err) {
      console.error('Ошибка отправки лога:', err);
      alert('Не удалось отправить лог');
    }
  };

  const handleTimerControl = async (action: 'pause' | 'resume') => {
    if (!sessionId || !timerUrl) return;
    try {
      await controlTimer(sessionId, action);
      setTimer(prev => ({ ...prev, isRunning: action === 'resume' }));
    } catch (err) {
      console.error(`Ошибка ${action === 'pause' ? 'паузы' : 'возобновления'} таймера:`, err);
      alert(`Не удалось ${action === 'pause' ? 'поставить на паузу' : 'возобновить'} таймер`);
    }
  };

  const handleEnd = async () => {
    if (!sessionId) return;
    try {
      const result = await endSession(sessionId);
      setSummary(result);
      setSessionId(null);
      setLogUrl(null);
      setTimerUrl(null);
      setLogs([]);
      setTimer({ isRunning: false, elapsedSeconds: 0 });
    } catch (err) {
      console.error('Ошибка завершения сессии:', err);
      alert('Не удалось завершить сессию');
    }
  };

  // Форматирование времени
  const formatDuration = (seconds: number): string => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">D&D Session Tracker</h1>
      <input
        placeholder="Название сессии"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border p-2 w-full text-black"
        disabled={!!sessionId}
      />
      <input
        placeholder="Сценарий"
        value={scenario}
        onChange={(e) => setScenario(e.target.value)}
        className="border p-2 w-full text-black"
        disabled={!!sessionId}
      />
      <input
        placeholder="Персонажи (через запятую)"
        value={characters}
        onChange={(e) => setCharacters(e.target.value)}
        className="border p-2 w-full text-black"
        disabled={!!sessionId}
      />
      <button
        onClick={handleCreate}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
        disabled={!!sessionId}
      >
        Создать сессию
      </button>

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
          onClick={handleSendLog}
          className="bg-green-500 text-white px-4 py-2 mt-2 rounded disabled:bg-gray-400"
          disabled={!sessionId}
        >
          Отправить лог
        </button>
      </div>

      <div className="pt-4">
        <h2 className="font-semibold">Таймер партии: {formatDuration(timer.elapsedSeconds)}</h2>
        <button
          onClick={() => handleTimerControl('pause')}
          className="bg-yellow-500 text-white px-4 py-2 rounded disabled:bg-gray-400 mr-2"
          disabled={!sessionId || !timer.isRunning}
        >
          Пауза
        </button>
        <button
          onClick={() => handleTimerControl('resume')}
          className="bg-yellow-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
          disabled={!sessionId || timer.isRunning}
        >
          Возобновить
        </button>
      </div>

      <div className="pt-4">
        <button
          onClick={handleEnd}
          className="bg-red-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
          disabled={!sessionId}
        >
          Завершить сессию
        </button>
        {summary && (
          <div className="mt-4  p-2">
            <h2 className="font-semibold">Итог сессии:</h2>
            <p>Длительность: {formatDuration(summary.durationSeconds)}</p>
            <p>Набрано опыта: {summary.xpGained}</p>
            <p>Собранный лут: {summary.lootCollected.join(', ') || 'нет'}</p>
            <p>Всего событий: {summary.totalEvents}</p>
          </div>
        )}
      </div>

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
    </div>
  );
}