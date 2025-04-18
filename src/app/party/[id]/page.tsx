"use client";

import { useEffect, useState } from "react";
// import { usePartySession } from "@/hooks/usePartySession";
import { Button } from "@heroui/react";
import { usePartySession } from "@/components/HOOKS/usePartySession";
import SessionControlPanel from "@/components/PartySession/PartyControl";
import { useParams } from "next/navigation";
import { getParty } from "@/actions/companyActions";
import { getSession } from "@/actions/auth";
import { SessionPayload } from "@/utils/types/SessionPayload";

export default function PartyPage() {
  // const [name, setName] = useState("");
  const [scenario, setScenario] = useState("");
  const [user, setUser] = useState<SessionPayload | null>(null);
  const [partyData, setPartyData] = useState<{
    id: string;
    name: string;
    description: string;
  }>({
    id: "",
    name: "",
    description: "",
  });
  // const [logMessage, setLogMessage] = useState("");
  // const [logType, setLogType] = useState<"combat" | "loot" | "event">("event");

  const [loot, setLoot] = useState<Record<string, string>>({});
  const [newLoot, setNewLoot] = useState({ name: "", desc: "" });

  const [locations, setLocations] = useState<Record<string, string>>({});
  const [newLocation, setNewLocation] = useState({ name: "", desc: "" });

  const addLootItem = () => {
    if (!newLoot.name && !newLoot.desc) return;
    setLoot((prev) => ({ ...prev, [newLoot.name || `Loot ${newLoot.name}`]: newLoot.desc }));
    setNewLoot({ name: "", desc: "" });
  };

  const addLocation = () => {
    if (!newLocation.name && !newLocation.desc) return;
    setLocations((prev) => ({
      ...prev,
      [newLocation.name || `Локация ${Date.now()}`]: newLocation.desc,
    }));
    setNewLocation({ name: "", desc: "" });
  };

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

  const params = useParams();

  useEffect(() => {
    async function fetchUser() {
      const session = await getSession();
      console.log("Fetched session:", session);
      if (session) {
        setUser(session as SessionPayload);
      } else {
        setUser(null);
      }
    }
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchParty = async () => {
      if (!user || !params.id) return;

      const partyID = Number(params.id);
      const partyData = await getParty({ id: partyID, userId: user.id });
      setPartyData({
        id: partyData!.id,
        name: partyData!.title,
        description: partyData!.description,
      });

      console.log("partyData:", partyData);
    };

    fetchParty();
  }, [user, params.id]);

  const handleCreate = async () => {
    if (!scenario || selectedCharacters.length === 0) {
      alert("Заполните все поля и выберите персонажей");
      return;
    }
    await create(partyData.name, scenario, {
      loot,
      locations,
    });
  };

  // const handleSendLog = async () => {
  //   if (!logMessage) return;
  //   await sendLog({
  //     type: logType,
  //     timestamp: new Date().toISOString(),
  //     message: logMessage,
  //   });
  //   setLogMessage("");
  // };

  const handleEnd = async () => {
    const base64 = await end();
    if (!base64) return;
    localStorage.removeItem('dnd-session-id')
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
        placeholder="Сценарий"
        value={scenario}
        onChange={(e) => setScenario(e.target.value)}
        className="border p-2 w-full text-black"
        disabled={!!sessionId}
      />
      <div>
        <h2 className="font-semibold">Лут</h2>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            placeholder="Имя предмета"
            value={newLoot.name}
            onChange={(e) => setNewLoot({ ...newLoot, name: e.target.value })}
            className="border p-2 w-1/3 text-black"
          />
          <input
            type="text"
            placeholder="Описание"
            value={newLoot.desc}
            onChange={(e) => setNewLoot({ ...newLoot, desc: e.target.value })}
            className="border p-2 w-2/3 text-black"
          />
          <Button onPress={addLootItem}>Добавить</Button>
        </div>
        <ul className="list-disc pl-5 text-sm text-gray-700">
          {Object.entries(loot).map(([key, value]) => (
            <li key={key}>
              <strong>{key}</strong>: {value}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h2 className="font-semibold">Локации</h2>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            placeholder="Название локации"
            value={newLocation.name}
            onChange={(e) =>
              setNewLocation({ ...newLocation, name: e.target.value })
            }
            className="border p-2 w-1/3 text-black"
          />
          <input
            type="text"
            placeholder="Описание/ссылка"
            value={newLocation.desc}
            onChange={(e) =>
              setNewLocation({ ...newLocation, desc: e.target.value })
            }
            className="border p-2 w-2/3 text-black"
          />
          <Button onPress={addLocation}>Добавить</Button>
        </div>
        <ul className="list-disc pl-5 text-sm text-gray-700">
          {Object.entries(locations).map(([key, value]) => (
            <li key={key}>
              <strong>{key}</strong>: {value}
            </li>
          ))}
        </ul>
      </div>

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
      {sessionId && <SessionControlPanel sessionId={sessionId} />}

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
