'use client';

import { SessionSummary } from '@/actions/party';

interface SummaryDisplayProps {
  summary: SessionSummary | null;
}

export default function SummaryDisplay({ summary }: SummaryDisplayProps) {
  const formatDuration = (seconds: number): string => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  if (!summary) return null;

  return (
    <div className="mt-4 p-2">
      <h2 className="font-semibold">Итог сессии:</h2>
      <p>Длительность: {formatDuration(summary.durationSeconds)}</p>
      <p>Набрано опыта: {summary.xpGained}</p>
      <p>Собранный лут: {summary.lootCollected.join(', ') || 'нет'}</p>
      <p>Всего событий: {summary.totalEvents}</p>
    </div>
  );
}