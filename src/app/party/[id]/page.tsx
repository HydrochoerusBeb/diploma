// // app/page.js
// 'use client';

// import { useState, useEffect } from 'react';
// import {
//   sendLog,
//   fetchLogs,
//   fetchTimer,
//   pauseTimer,
//   resumeTimer,
//   downloadLogsAsJson,
//   createLogContainer,
// } from '@/actions/party';

// export default function LogPage() {
//   const [logs, setLogs] = useState([]);
//   const [logInput, setLogInput] = useState('');
//   const [timer, setTimer] = useState({ elapsedSeconds: 0, isRunning: false });
//   const [config, setConfig] = useState({
//     title: '',
//     description: '',
//     compainId: '',
//     userId: '',
//   });
//   const [partyId, setPartyId] = useState('');
//   const [isLoading, setIsLoading] = useState(false);

//   useEffect(() => {
//     const interval = setInterval(async () => {
//       const t = await fetchTimer();
//       setTimer(t);
//     }, 1000);

//     fetchLogs().then(setLogs);

//     return () => clearInterval(interval);
//   }, []);

//   const handleSendLog = async () => {
//     const log = { message: logInput, time: new Date().toISOString() };
//     await sendLog(log);
//     const updated = await fetchLogs();
//     setLogs(updated);
//     setLogInput('');
//   };

//   const handleDownloadLogs = async () => {
//     if (!partyId) return alert('Укажи partyId');
//     const updatedLogs = await fetchLogs();
//     const url = await downloadLogsAsJson(partyId, updatedLogs);
//     window.open(url, '_blank');
//   };

//   const handleCreateContainer = async () => {
//     setIsLoading(true);
//     try {
//       await createLogContainer({
//         timer: { isRunning: true, elapsedSeconds: 0 },
//         logs: [],
//         ...config,
//       });
//       alert('Контейнер создан!');
//     } catch (err) {
//       alert('Ошибка создания контейнера');
//       console.error(err);
//     }
//     setIsLoading(false);
//   };

//   return (
//     <main className="max-w-2xl mx-auto p-4 space-y-4">
//       <h1 className="text-2xl font-bold">Логирование сессии</h1>

//       <div className="space-y-2">
//         <input
//           type="text"
//           placeholder="Название партии"
//           className="w-full p-2 border rounded text-black"
//           value={config.title}
//           onChange={(e) => setConfig({ ...config, title: e.target.value })}
//         />
//         <textarea
//           placeholder="Описание"
//           className="w-full p-2 border rounded text-black"
//           value={config.description}
//           onChange={(e) => setConfig({ ...config, description: e.target.value })}
//         />
//         <input
//           type="text"
//           placeholder="ID кампании"
//           className="w-full p-2 border rounded text-black"
//           value={config.compainId}
//           onChange={(e) => setConfig({ ...config, compainId: e.target.value })}
//         />
//         <input
//           type="text"
//           placeholder="ID пользователя"
//           className="w-full p-2 border rounded text-black"
//           value={config.userId}
//           onChange={(e) => setConfig({ ...config, userId: e.target.value })}
//         />
//         <button
//           onClick={handleCreateContainer}
//           disabled={isLoading}
//           className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//         >
//           {isLoading ? 'Создание...' : 'Создать контейнер'}
//         </button>
//       </div>

//       <div className="space-y-2">
//         <h2 className="text-lg font-semibold">Таймер: {timer.elapsedSeconds} сек ({timer.isRunning ? 'идет' : 'пауза'})</h2>
//         <button onClick={pauseTimer} className="bg-yellow-400 px-3 py-1 rounded text-black">Пауза</button>
//         <button onClick={resumeTimer} className="bg-green-500 text-white px-3 py-1 rounded ml-2 text-black">Продолжить</button>
//       </div>

//       <div className="space-y-2">
//         <input
//           type="text"
//           placeholder="Лог-сообщение"
//           className="w-full p-2 border rounded text-black"
//           value={logInput}
//           onChange={(e) => setLogInput(e.target.value)}
//         />
//         <button
//           onClick={handleSendLog}
//           className="bg-gray-800 text-white px-4 py-2 rounded "
//         >
//           Отправить лог
//         </button>
//       </div>

//       <div className="space-y-2">
//         <input
//           type="text"
//           placeholder="Party ID для скачивания логов"
//           className="w-full p-2 border rounded text-black"
//           value={partyId}
//           onChange={(e) => setPartyId(e.target.value)}
//         />
//         <button
//           onClick={handleDownloadLogs}
//           className="bg-purple-700 text-white px-4 py-2 rounded"
//         >
//           Скачать логи
//         </button>
//       </div>

//       <div className="space-y-1">
//         <h2 className="font-semibold">Логи:</h2>
//         <ul className="max-h-64 overflow-auto border p-2 rounded">
//           {logs.map((log, i) => (
//             <li key={i} className="text-sm border-b py-1">
//               {JSON.stringify(log)}
//             </li>
//           ))}
//         </ul>
//       </div>
//     </main>
//   );
// }
