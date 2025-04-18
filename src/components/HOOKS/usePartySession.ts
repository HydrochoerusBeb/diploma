import { useEffect, useState } from "react";
import {
  createSession,
  getLogs,
  getTimer,
  controlTimer,
  endSession,
  SessionData,
  LogEntry,
  SessionSummary,
} from "@/actions/party";
import {
  getCharacterById,
  getCompany,
  getMainCharacterById,
  getMainCharactersByCompany,
  getNpcCharactersByCompany,
} from "@/actions/companyActions";
import { useParams } from "next/navigation";
import { getSession } from "@/actions/auth";
import { Character } from "@/utils/types/CharacterType";
import { SessionPayload } from "@/utils/types/SessionPayload";

export function usePartySession() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [logUrl, setLogUrl] = useState<string | null>(null);
  const [timerUrl, setTimerUrl] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [timer, setTimer] = useState({ isRunning: true, elapsedSeconds: 0 });

  const [selectedCharacters, setSelectedCharacters] = useState<Character[]>([]);
  const [allCharacters, setAllCharacters] = useState<Character[]>([]);
  const [charModalOpen, setCharModalOpen] = useState(false);

  const [user, setUser] = useState<SessionPayload | null>(null);
  const params = useParams();

  useEffect(() => {
    const fetchInitial = async () => {
      const session = (await getSession()) as SessionPayload;
      if (!session) return;
      setUser(session);

      const companyId = Number(localStorage.getItem("dnd-company-self"));
      console.log("[usePartySession] companyId из LS:", companyId);

      const company = await getCompany({ id: companyId, userId: session.id });

      if (!company || !company.userId) return;

      const [mainChars, npcChars] = await Promise.all([
        getMainCharactersByCompany(company.id, session.id),
        getNpcCharactersByCompany(company.id, session.id),
      ]);
      console.log([mainChars, npcChars]);

      const combined = [
        ...mainChars.map((c: any) => ({ ...c, type: "main" })),
        ...npcChars.map((c: any) => ({ ...c, type: "npc" })),
      ];
      setAllCharacters(combined);
    };

    fetchInitial();
  }, []);

  useEffect(() => {
    if (!sessionId) return;
    const interval = setInterval(async () => {
      const [fetchedLogs, timerData] = await Promise.all([
        getLogs(sessionId),
        getTimer(sessionId),
      ]);
      setLogs(fetchedLogs);
      setTimer(timerData);
    }, 2000);
    return () => clearInterval(interval);
  }, [sessionId]);

  useEffect(() => {
    const restoreSession = async () => {
      const savedId = localStorage.getItem("dnd-session-id");
      if (!savedId) return;

      const [fetchedLogs, timerData] = await Promise.all([
        getLogs(savedId),
        getTimer(savedId),
      ]);

      setSessionId(savedId);
      setLogUrl(`http://localhost:????/log`);
      setTimerUrl(`http://localhost:????/timer`);
      setLogs(fetchedLogs);
      setTimer(timerData);
    };

    restoreSession();
  }, []);
  const create = async (
    name: string,
    scenario: string,
    extras?: { loot?: Record<string, string>; locations?: Record<string, string> }
  ) => {
    const mainCharactersIds = selectedCharacters
      .filter((c) => c.type === "main")
      .map((c) => c.id);
  
    const npcIds = selectedCharacters
      .filter((c) => c.type === "npc")
      .map((c) => c.id);
  
    const [mainChars, npcChars] = await Promise.all([
      Promise.all(mainCharactersIds.map(id => getMainCharacterById(id))),
      Promise.all(npcIds.map(id => getCharacterById(id))),
    ]);
  
    const mainCharacters = mainChars.map((c: any) => ({
      id: c.id,
      name: c.name,
      class: c.class,
      race: c.race,
      description: c.description || "",
      alive: c.alive !== undefined ? c.alive : true,
      level: c.level,
    }));
  
    const npcs = npcChars.map((c: any) => ({
      id: c.id,
      name: c.name,
      class: c.class,
      race: c.race,
      description: c.description || "",
      alive: c.alive !== undefined ? c.alive : true,
      level: c.level,
      location: c.location || "",
      occupation: c.occupation || "",
    }));
  
    const data: SessionData = {
      name,
      scenario,
      partyID: params.id,
      mainCharacters,
      npcs,
      loot: extras?.loot ?? {},
      locations: extras?.locations ?? {},
    };
  
    const { sessionId, logUrl, timerUrl } = await createSession(data);
    setSessionId(sessionId);
    setLogUrl(logUrl);
    setTimerUrl(timerUrl);
    setLogs([]);
    setSummary(null);
    setTimer({ isRunning: true, elapsedSeconds: 0 });
  
    localStorage.setItem("dnd-session-id", sessionId);
  };
  
  const sendLog = async (log: LogEntry) => {
    if (!logUrl) return;
    await fetch(logUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(log),
    });
    const updatedLogs = await getLogs(sessionId!);
    setLogs(updatedLogs);
  };

  const pauseTimer = () => handleTimer("pause");
  const resumeTimer = () => handleTimer("resume");

  const handleTimer = async (action: "pause" | "resume") => {
    if (!sessionId || !timerUrl) return;
    await controlTimer(sessionId, action);
    setTimer((prev) => ({ ...prev, isRunning: action === "resume" }));
  };

  const end = async () => {
    if (!sessionId) return;
    const { summary, reportBase64 } = await endSession(sessionId);
    setSummary(summary);
    setSessionId(null);
    setLogUrl(null);
    setTimerUrl(null);
    setLogs([]);
    setTimer({ isRunning: false, elapsedSeconds: 0 });

    return reportBase64;
  };

  return {
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
  };
}
