'use server';

import { exec } from 'child_process';
import { promisify } from 'util';
import net from 'net';
import fs from 'fs/promises';
import path from 'path';
import prisma from '@/lib/prisma';

export interface SessionData {
  name: string;
  scenario: string;
  mainCharacters: Array<any>; // full character data
  npcs: Array<any>; // full character data
  partyID: string | string[] | undefined;
  locations?: Record<string, string>;
  loot?: Record<string, string>;
  details?: string;
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

await fs.mkdir(tempDir, { recursive: true, mode: 0o777 });

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

function sanitizeContainerName(name: string): string {
  return name.replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase();
}

export async function createSession({
  name,
  scenario,
  mainCharacters,
  partyID,
  locations = {},
  loot = {},
  npcs = [],
  details = "",
}: SessionData): Promise<{
  sessionId: string;
  logUrl: string;
  timerUrl: string;
}> {
  const sessionId = Date.now().toString();
  const containerName = `dnd-${sanitizeContainerName(sessionId)}`;
  const port = await getFreePort();

  const sessionPath = path.join(tempDir, sessionId);
  await fs.mkdir(sessionPath, { recursive: true });

  console.log('[CreateSession] Создание сессии:', {
    name,
    scenario,
    partyID,
    mainCharacters,
    npcs,
    locations,
    loot,
    details,
  });

  const extendedMainCharacters = mainCharacters.map((c: any) => ({
    ...c,
    description: c.description || '',
    alive: c.alive !== undefined ? c.alive : true,
  }));

  const extendedNpcs = npcs.map((c: any) => ({
    ...c,
    description: c.description || '',
    alive: c.alive !== undefined ? c.alive : true,
  }));

  const sessionJsonPath = path.join(sessionPath, "session.json");
  await fs.writeFile(sessionJsonPath, JSON.stringify({
    name,
    scenario,
    mainCharacters: extendedMainCharacters,
    npcs: extendedNpcs,
    partyID,
    locations,
    loot,
    details,
  }, null, 2));

  const volumePath = sessionPath.replace(/\\/g, '/').replace(/^([A-Za-z]):/, (_, d) => `/${d.toLowerCase()}`);

  try {
    const cmd = `docker run -d --rm --name ${containerName} -p ${port}:3002 -v "${volumePath}:/app/logs" session-tracker`;
    await execAsync(cmd);
    console.log(`Контейнер ${containerName} запущен на порту ${port}`);
  } catch (err: any) {
    console.error('Ошибка запуска контейнера:', err);
    throw new Error(`Не удалось создать сессию: ${err.message}`);
  }

  const logUrl = `http://localhost:${port}/log`;
  const timerUrl = `http://localhost:${port}/timer`;
  return { sessionId, logUrl, timerUrl };
}


export async function getLogs(sessionId: string): Promise<LogEntry[]> {
  const sessionPath = path.join(tempDir, sessionId);
  const logsPath = path.join(sessionPath, 'logs.txt');

  try {
    const content = await fs.readFile(logsPath, 'utf-8');
    if (!content.trim()) return [];

    return content
      .split('\n')
      .filter(Boolean)
      .map((line, index) => {
        try {
          return JSON.parse(line) as LogEntry;
        } catch (err) {
          console.warn(`Ошибка парсинга строки [${index}]:`, line);
          return null;
        }
      })
      .filter((log): log is LogEntry => log !== null);
  } catch (err) {
    console.error('Ошибка чтения логов:', err);
    return [];
  }
}

export async function getTimer(sessionId: string): Promise<{ isRunning: boolean; elapsedSeconds: number }> {
  const timerPath = path.join(tempDir, sessionId, 'timer.json');

  try {
    const content = await fs.readFile(timerPath, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error('Ошибка чтения timer.json:', err);
    return { isRunning: true, elapsedSeconds: 0 };
  }
}

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

export async function endSession(sessionId: string): Promise<{ summary: SessionSummary; reportBase64: string }> {
  const sessionDir = path.join(tempDir, sessionId);
  const logsPath = path.join(sessionDir, 'logs.txt');
  const timerPath = path.join(sessionDir, 'timer.json');
  const sessionPath = path.join(sessionDir, 'session.json');
  const reportPath = path.join(sessionDir, 'report.json');

  let logs: LogEntry[] = [];
  let durationSeconds = 0;
  let sessionMeta: any = {};

  try {
    const content = await fs.readFile(logsPath, 'utf-8');
    logs = content
      .split('\n')
      .filter(Boolean)
      .map((line, i) => {
        try {
          return JSON.parse(line) as LogEntry;
        } catch {
          return null;
        }
      })
      .filter((entry): entry is LogEntry => entry !== null);
  } catch (err) {
    console.error('Ошибка чтения logs.txt:', err);
  }

  try {
    const content = await fs.readFile(timerPath, 'utf-8');
    const timer = JSON.parse(content);
    durationSeconds = timer.elapsedSeconds || 0;
  } catch (err) {
    console.error('Ошибка чтения timer.json:', err);
  }

  try {
    const content = await fs.readFile(sessionPath, 'utf-8');
    sessionMeta = JSON.parse(content);
  } catch (err) {
    console.error('Ошибка чтения session.json:', err);
  }

  const summary = parseLogs(logs, durationSeconds);

  const report = {
    session: sessionMeta,
    summary,
    logs,
    closedAt: new Date().toISOString(),
  };

  try {
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    console.log('Сформирован report.json');
  } catch (err) {
    console.error('Ошибка записи report.json:', err);
  }

  try {
    const containerName = `dnd-${sessionId}`;
    await execAsync(`docker stop ${containerName}`);
  } catch {}

  const reportBase64 = Buffer.from(JSON.stringify(report, null, 2)).toString('base64');

  return { summary, reportBase64 };
}

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


export async function updateSessionData(
  sessionId: string,
  patch: Partial<SessionData>
): Promise<void> {
  const sessionPath = path.join(tempDir, sessionId, "session.json");

  try {
    const content = await fs.readFile(sessionPath, "utf-8");
    const currentData = JSON.parse(content) as SessionData;

    const updated = {
      ...currentData,
      ...patch,
      locations: {
        ...(currentData.locations || {}),
        ...(patch.locations || {}),
      },
      loot: patch.loot ?? currentData.loot ?? [],
      npcs: patch.npcs ?? currentData.npcs ?? [],
      details: patch.details ?? currentData.details ?? "",
    };

    await fs.writeFile(sessionPath, JSON.stringify(updated, null, 2));
    console.log(`[Session Update] session.json обновлён (${sessionId})`);
  } catch (err) {
    console.error(`[Session Update] Ошибка при обновлении session.json`, err);
    throw new Error("Не удалось обновить session.json");
  }
}


export async function readSessionData(sessionId: string): Promise<SessionData | null> {
  const sessionPath = path.join(tempDir, sessionId, "session.json");

  try {
    const content = await fs.readFile(sessionPath, "utf-8");
    return JSON.parse(content) as SessionData;
  } catch (err) {
    console.error("Ошибка чтения session.json:", err);
    return null;
  }
}

