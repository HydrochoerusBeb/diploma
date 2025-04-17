"use client";

import { useState } from "react";
// import { usePartySession } from "@/hooks/usePartySession";
import { Button } from "@heroui/react";
import { usePartySession } from "@/components/HOOKS/usePartySession";


export default function PartyPage() {
  const [name, setName] = useState("");
  const [scenario, setScenario] = useState("");
  const [logMessage, setLogMessage] = useState("");
  const [logType, setLogType] = useState<"combat" | "loot" | "event">("event");

  const {
    sessionId,
    logs,
    summary,
    timer,
    create,
    sendLog,
    pauseTimer,
    resumeTimer,
    end,
    selectedCharacters,
    setSelectedCharacters,
    allCharacters,
    charModalOpen,
    setCharModalOpen,
  } = usePartySession();

  const handleCreate = async () => {
    if (!name || !scenario || selectedCharacters.length === 0) {
      alert("Заполните все поля и выберите персонажей");
      return;
    }
    await create(name, scenario);
  };

  const handleSendLog = async () => {
    if (!logMessage) return;
    await sendLog({
      type: logType,
      timestamp: new Date().toISOString(),
      message: logMessage,
    });
    setLogMessage("");
  };

  const handleEnd = async () => {
    const base64 = await end();
    if (!base64) return;

    const byteCharacters = atob(base64);
    const byteArray = new Uint8Array(
      Array.from(byteCharacters).map((c) => c.charCodeAt(0))
    );
    const blob = new Blob([byteArray], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `session-${sessionId}-report.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const formatDuration = (seconds: number) => {
    const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
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

      <Button onPress={() => setCharModalOpen(true)} disabled={!!sessionId}>
        Выбрать персонажей
      </Button>
      <div className="text-sm text-gray-600">
        Выбрано:{" "}
        {selectedCharacters.length
          ? selectedCharacters.map((c) => c.name).join(", ")
          : "никого"}
      </div>

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
          onChange={(e) => setLogType(e.target.value as any)}
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
          className="bg-green-500 text-white px-4 py-2 mt-2 rounded"
          disabled={!sessionId}
        >
          Отправить лог
        </button>
      </div>

      <div className="pt-4">
        <h2 className="font-semibold">
          Таймер: {formatDuration(timer.elapsedSeconds)}
        </h2>
        <button
          onClick={pauseTimer}
          className="bg-yellow-500 text-white px-4 py-2 rounded mr-2"
          disabled={!sessionId || !timer.isRunning}
        >
          Пауза
        </button>
        <button
          onClick={resumeTimer}
          className="bg-yellow-500 text-white px-4 py-2 rounded"
          disabled={!sessionId || timer.isRunning}
        >
          Возобновить
        </button>
      </div>

      <div className="pt-4">
        <button
          onClick={handleEnd}
          className="bg-red-500 text-white px-4 py-2 rounded"
          disabled={!sessionId}
        >
          Завершить сессию
        </button>
        {summary && (
          <div className="mt-4">
            <h2 className="font-semibold">Итог:</h2>
            <p>Длительность: {formatDuration(summary.durationSeconds)}</p>
            <p>Опыт: {summary.xpGained}</p>
            <p>
              Лут:{" "}
              {summary.lootCollected.length
                ? summary.lootCollected.join(", ")
                : "нет"}
            </p>
            <p>Событий: {summary.totalEvents}</p>
          </div>
        )}
      </div>

      <div className="pt-4">
        <h2 className="font-semibold">Логи</h2>
        <ul className="list-disc list-inside">
          {logs.length > 0 ? (
            logs.map((log, idx) => (
              <li key={idx}>
                [{log.timestamp}] {log.type}: {log.message}
              </li>
            ))
          ) : (
            <li>Логов нет</li>
          )}
        </ul>
      </div>

      {charModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg max-h-[80vh] overflow-auto w-[500px]">
            <h2 className="text-xl font-bold mb-2">Выбери персонажей</h2>
            <div className="space-y-3">
              {allCharacters.map((char) => {
                const isSelected = selectedCharacters.some(
                  (c) => c.id === char.id
                );
                return (
                  <div
                    key={char.id}
                    onClick={() => {
                      setSelectedCharacters((prev) =>
                        isSelected
                          ? prev.filter((c) => c.id !== char.id)
                          : [...prev, char]
                      );
                    }}
                    className={`cursor-pointer border p-2 rounded ${
                      isSelected
                        ? "bg-green-100 border-green-500"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <div className="font-semibold">{char.name}</div>
                    {char.type === "npc" && (
                      <div className="text-xs text-gray-500">
                        Локация: {char.location}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex justify-end pt-4 space-x-2">
              <Button onPress={() => setCharModalOpen(false)}>Отмена</Button>
              <Button
                onPress={() => setCharModalOpen(false)}
                className="bg-blue-600 text-white"
              >
                Подтвердить
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
