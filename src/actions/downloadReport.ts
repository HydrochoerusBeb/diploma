'use server';

import path from 'path';
import fs from 'fs/promises';

const tempDir = path.join('C:', 'dnd-temp');

export async function downloadReport(sessionId: string): Promise<string | null> {
  const reportPath = path.join(tempDir, sessionId, 'report.json');

  try {
    const file = await fs.readFile(reportPath);
    return file.toString('base64'); // 🔥 кодируем в base64
  } catch (err) {
    console.error(`Не удалось прочитать report.json для sessionId=${sessionId}`, err);
    return null;
  }
}
