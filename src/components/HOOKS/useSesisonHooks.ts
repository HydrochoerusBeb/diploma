import { useEffect, useState } from "react";
import { SessionData } from "@/actions/party";
import { NpcCharacter } from "@/utils/types/CharacterType";

export function useSessionEditor(sessionId: string | null) {
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/session-data/${sessionId}`);
        const json = await res.json();
        setSessionData(json);
      } catch (e) {
        setError("Ошибка загрузки данных сессии");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [sessionId]);

  const updateCharacterLocation = (characterId: string, location: string) => {
    if (!sessionData) return;
    const updated = {
      ...sessionData,
      characters: sessionData.npcs.map((char) =>
        char.id === characterId ? { ...char, location } : char
      ),
    };
    setSessionData(updated);
  };

  const updateLoot = (loot: Record<string, string>) => {
    if (!sessionData) return;
    setSessionData({ ...sessionData, loot });
  };

  const updateNPCs = (npcIds: string[]) => {
    if (!sessionData) return;
    setSessionData({ ...sessionData, npcs: npcIds as any });
  };

  const updateCompanyDetails = (details: string) => {
    if (!sessionData) return;
    setSessionData({ ...sessionData, details });
  };

  const saveSession = async () => {
    if (!sessionId || !sessionData) return;
    await fetch(`/api/session-data/${sessionId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sessionData),
    });
  };

  return {
    sessionData,
    loading,
    error,
    updateCharacterLocation,
    updateLoot,
    updateNPCs,
    updateCompanyDetails,
    saveSession,
  };
}
