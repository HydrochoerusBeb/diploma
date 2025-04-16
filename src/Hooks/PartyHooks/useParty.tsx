// 'use client';

// import { useState, useEffect } from 'react';
// import {
//   getLogs,
//   getTimer,
//   controlTimer,
//   exportSession,
//   endSession,
//   SessionData,
//   LogEntry,
//   SessionSummary,
//   Timer,
//   SessionConfig,
//   createSessionFromConfig,
// } from '@/actions/party';

// export function useParty() {
//   const [sessionId, setSessionId] = useState<string | null>(null);
//   const [logUrl, setLogUrl] = useState<string | null>(null);
//   const [timerUrl, setTimerUrl] = useState<string | null>(null);
//   const [logs, setLogs] = useState<LogEntry[]>([]);
//   const [summary, setSummary] = useState<SessionSummary | null>(null);
//   const [timer, setTimer] = useState<Timer>({ isRunning: true, elapsedSeconds: 0 });

//   useEffect(() => {
//     if (!sessionId) return;

//     const interval = setInterval(async () => {
//       const fetchedLogs = await getLogs(sessionId);
//       setLogs(fetchedLogs);
//       const timerData = await getTimer(sessionId);
//       setTimer(timerData);
//     }, 2000);

//     return () => clearInterval(interval);
//   }, [sessionId]);

//   const sendLog = async (log: LogEntry) => {
//     if (!logUrl) return;
//     try {
//       const response = await fetch(logUrl, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(log),
//       });
//       if (!response.ok) {
//         throw new Error('Ошибка отправки лога');
//       }
//     } catch (err) {
//       console.error('Ошибка отправки лога:', err);
//       alert('Не удалось отправить лог');
//     }
//   };

//   const controlTimerHandler = async (action: 'pause' | 'resume') => {
//     if (!sessionId || !timerUrl) return;
//     try {
//       await controlTimer(sessionId, action);
//       setTimer(prev => ({ ...prev, isRunning: action === 'resume' }));
//     } catch (err) {
//       console.error(`Ошибка ${action === 'pause' ? 'паузы' : 'возобновления'} таймера:`, err);
//       alert(`Не удалось ${action === 'pause' ? 'поставить на паузу' : 'возобновить'} таймер`);
//     }
//   };

//   const exportSessionHandler = async (sessionData: SessionData) => {
//     if (!sessionId) return;
//     try {
//       const { config, logFilePath } = await exportSession(sessionId, sessionData);

//       // Скачивание конфигурации
//       const configBlob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
//       const configUrl = URL.createObjectURL(configBlob);
//       const configLink = document.createElement('a');
//       configLink.href = configUrl;
//       configLink.download = `session-${sessionId}.json`;
//       configLink.click();
//       URL.revokeObjectURL(configUrl);

//       // Скачивание логов через API
//       const logResponse = await fetch(`/api/download-logs?filePath=${encodeURIComponent(logFilePath)}`);
//       if (!logResponse.ok) throw new Error('Ошибка загрузки логов');
//       const logBlob = await logResponse.blob();
//       const logUrl = URL.createObjectURL(logBlob);
//       const logLink = document.createElement('a');
//       logLink.href = logUrl;
//       logLink.download = `session-${sessionId}-logs.txt`;
//       logLink.click();
//       URL.revokeObjectURL(logUrl);
//     } catch (err) {
//       console.error('Ошибка экспорта:', err);
//       alert('Не удалось экспортировать сессию');
//     }
//   };

//   const endSessionHandler = async (sessionData: SessionData) => {
//     if (!sessionId) return;
//     try {
//       const { summary, config } = await endSession(sessionId, sessionData);
//       setSummary(summary);
//       setSessionId(null);
//       setLogUrl(null);
//       setTimerUrl(null);
//       setLogs([]);
//       setTimer({ isRunning: false, elapsedSeconds: 0 });

//       const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
//       const url = URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.href = url;
//       a.download = `session-${sessionId}-end.json`;
//       a.click();
//       URL.revokeObjectURL(url);
//     } catch (err) {
//       console.error('Ошибка завершения сессии:', err);
//       alert('Не удалось завершить сессию');
//     }
//   };

//   const createSessionFromConfigHandler = async (config: SessionConfig) => {
//     try {
//       const { sessionId, logUrl, timerUrl } = await createSessionFromConfig(config);
//       setSessionId(sessionId);
//       setLogUrl(logUrl);
//       setTimerUrl(timerUrl);
//       setLogs(config.logs);
//       setSummary(null);
//       setTimer(config.timer);
//     } catch (err) {
//       console.error('Ошибка импорта:', err);
//       alert('Не удалось загрузить конфиг');
//     }
//   };

//   return {
//     sessionId,
//     logUrl,
//     timerUrl,
//     logs,
//     summary,
//     timer,
//     sendLog,
//     controlTimer: controlTimerHandler,
//     exportSession: exportSessionHandler,
//     endSession: endSessionHandler,
//     createSessionFromConfig: createSessionFromConfigHandler,
//     setSessionId,
//     setLogUrl,
//     setTimerUrl,
//   };
// }