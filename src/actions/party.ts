'use server';

import { exec } from 'child_process';
import { promisify } from 'util';
import net from 'net';
import fs from 'fs/promises';
import path from 'path';
// import { AddressInfo } from 'net';

// Типы данных
export interface SessionData {
  name: string;
  scenario: string;
  characters: string[];
}

export interface LogEntry {
  type: 'combat' | 'loot' | 'event';
  timestamp: string;
  message: string;
}

export interface SessionSummary {
  xpGained: number;
  lootCollected: string[];
  totalEvents: number;
  durationSeconds: number;
}

const execAsync = promisify(exec);
const tempDir = path.join(process.cwd(), 'temp');

// Создаем папку temp
await fs.mkdir(tempDir, { recursive: true, mode: 0o777 });

// Функция для поиска свободного порта
async function getFreePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(0, () => {
      const address = server.address();
      if (address && typeof address !== 'string' && 'port' in address) {
        const port = address.port;
        server.close(() => resolve(port));
      } else {
        server.close(() => reject(new Error('Не удалось получить порт')));
      }
    });
    server.on('error', reject);
  });
}

// Санитизация имени контейнера
function sanitizeContainerName(name: string): string {
  return name.replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase();
}

// Создание сессии
export async function createSession({ name, scenario, characters }: SessionData): Promise<{ sessionId: string; logUrl: string; timerUrl: string }> {
  const sessionId = Date.now().toString();
  const containerName = `dnd-${sanitizeContainerName(sessionId)}`;
  const port = await getFreePort();
  const tempSessionPath = path.join(tempDir, `${sessionId}-session.json`);

  try {
    // Записываем SessionData во временный файл
    const sessionData = { name, scenario, characters };
    await fs.writeFile(tempSessionPath, JSON.stringify(sessionData, null, 2), { mode: 0o666 });

    // Запускаем контейнер
    await execAsync(
      `docker run -d --rm --name ${containerName} -p ${port}:3002 session-tracker`
    );
    console.log(`Контейнер ${containerName} запущен на порту ${port}`);

    // Задержка для инициализации контейнера
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Копируем session.json в контейнер
    await execAsync(
      `docker cp ${tempSessionPath} ${containerName}:/app/logs/session.json`
    );
    console.log(`Скопирован session.json в ${containerName}:/app/logs/session.json`);

    // Отладка: проверяем файлы
    try {
      const { stdout } = await execAsync(
        `docker exec ${containerName} find /app`
      );
      console.log(`Содержимое /app: ${stdout}`);
    } catch (err) {
      console.error('Ошибка проверки /app:', err);
    }

  } catch (err) {
    console.error('Ошибка создания сессии:', err);
    throw new Error(`Не удалось создать сессию: ${err.message}`);
  } finally {
    // Удаляем временный файл
    await fs.unlink(tempSessionPath).catch(() => {});
  }

  const logUrl = `http://localhost:${port}/log`;
  const timerUrl = `http://localhost:${port}/timer`;
  console.log('Создан logUrl:', logUrl, 'timerUrl:', timerUrl);
  return { sessionId, logUrl, timerUrl };
}

// Получение логов
export async function getLogs(sessionId: string): Promise<LogEntry[]> {
  const containerName = `dnd-${sanitizeContainerName(sessionId)}`;
  const logPath = '/app/logs/logs.txt';
  const tempLogPath = path.join(tempDir, `${sessionId}-logs.txt`);

  try {
    // Копируем файл из контейнера
    await execAsync(`docker cp ${containerName}:${logPath} ${tempLogPath}`);
    console.log(`Логи скопированы в ${tempLogPath}`);

    // Читаем файл
    const content = await fs.readFile(tempLogPath, 'utf-8');
    if (!content.trim()) {
      console.log('Файл логов пуст');
      return [];
    }

    // Парсим строки
    return content
      .split('\n')
      .filter(Boolean)
      .map((line, index) => {
        try {
          return JSON.parse(line) as LogEntry;
        } catch {
          console.error(`Ошибка парсинга строки ${index}: ${line}`);
          return null;
        }
      })
      .filter((log): log is LogEntry => log !== null);
  } catch (err) {
    console.error('Ошибка получения логов:', err);
    return [];
  } finally {
    // Удаляем временный файл
    await fs.unlink(tempLogPath).catch(() => {});
  }
}

// Получение состояния таймера
export async function getTimer(sessionId: string): Promise<{ isRunning: boolean; elapsedSeconds: number }> {
  const containerName = `dnd-${sanitizeContainerName(sessionId)}`;
  const timerPath = '/app/logs/timer.json';
  const tempTimerPath = path.join(tempDir, `${sessionId}-timer.json`);

  try {
    await execAsync(`docker cp ${containerName}:${timerPath} ${tempTimerPath}`);
    const content = await fs.readFile(tempTimerPath, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error('Ошибка получения таймера:', err);
    return { isRunning: true, elapsedSeconds: 0 };
  } finally {
    await fs.unlink(tempTimerPath).catch(() => {});
  }
}

// Управление таймером
export async function controlTimer(sessionId: string, action: 'pause' | 'resume'): Promise<void> {
  const containerName = `dnd-${sanitizeContainerName(sessionId)}`;
  try {
    await execAsync(
      `docker exec ${containerName} curl -X POST http://localhost:3002/timer/${action}`
    );
  } catch (err) {
    console.error(`Ошибка управления таймером (${action}):`, err);
    throw new Error(`Не удалось ${action === 'pause' ? 'поставить на паузу' : 'возобновить'} таймер`);
  }
}

// Завершение сессии
export async function endSession(sessionId: string): Promise<SessionSummary> {
  const containerName = `dnd-${sanitizeContainerName(sessionId)}`;
  const logPath = '/app/logs/logs.txt';
  const timerPath = '/app/logs/timer.json';
  const tempLogPath = path.join(tempDir, `${sessionId}-logs.txt`);
  const tempTimerPath = path.join(tempDir, `${sessionId}-timer.json`);
  let logLines: LogEntry[] = [];
  let durationSeconds = 0;

  try {
    await execAsync(`docker cp ${containerName}:${logPath} ${tempLogPath}`);
    const logContent = await fs.readFile(tempLogPath, 'utf-8');
    if (logContent.trim()) {
      logLines = logContent
        .split('\n')
        .filter(Boolean)
        .map((line, index) => {
          try {
            return JSON.parse(line) as LogEntry;
          } catch {
            console.error(`Ошибка парсинга строки ${index}: ${line}`);
            return null;
          }
        })
        .filter((log): log is LogEntry => log !== null);
    }
  } catch (err) {
    console.error('Ошибка чтения логов:', err);
  } finally {
    await fs.unlink(tempLogPath).catch(() => {});
  }

  try {
    await execAsync(`docker cp ${containerName}:${timerPath} ${tempTimerPath}`);
    const timerContent = await fs.readFile(tempTimerPath, 'utf-8');
    const timer = JSON.parse(timerContent);
    durationSeconds = timer.elapsedSeconds;
  } catch (err) {
    console.error('Ошибка чтения таймера:', err);
  } finally {
    await fs.unlink(tempTimerPath).catch(() => {});
  }

  const summary = parseLogs(logLines, durationSeconds);

  try {
    await execAsync(`docker stop ${containerName}`);
    console.log(`Контейнер ${containerName} остановлен`);
  } catch (err) {
    console.error('Ошибка остановки контейнера:', err);
  }

  return summary;
}

// Парсинг логов
function parseLogs(logs: LogEntry[], durationSeconds: number): SessionSummary {
  let xpGained = 0;
  const lootCollected: string[] = [];
  logs.forEach(log => {
    if (log.type === 'combat') xpGained += 50;
    if (log.type === 'loot' && log.message) lootCollected.push(log.message);
  });
  return {
    xpGained,
    lootCollected,
    totalEvents: logs.length,
    durationSeconds,
  };
}