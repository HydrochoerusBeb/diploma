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
  getCompany,
  getMainCharactersByCompany,
  getNpcCharactersByCompany,
} from "@/actions/companyActions";
import { useParams } from "next/navigation";
import { getSession } from "@/actions/auth";
import { Character } from "@/utils/types/Character";
import { SessionPayload } from "@/utils/types/SessionPayload";
import { log } from "console";

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
      const session = await getSession();
      if (!session) return;
      setUser(session);

      const companyId = Number(params.id);
      const company = await getCompany({ id: companyId, userId: session.id });

      const [mainChars, npcChars] = await Promise.all([
        getMainCharactersByCompany(company?.id, session.id),
        getNpcCharactersByCompany(company?.id, session.id),
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

  const create = async (name: string, scenario: string) => {
    const data: SessionData = {
      name,
      scenario,
      characters: selectedCharacters.map((c) => ({ id: c.id, name: c.name })),
    };
    const { sessionId, logUrl, timerUrl } = await createSession(data);
    setSessionId(sessionId);
    setLogUrl(logUrl);
    setTimerUrl(timerUrl);
    setLogs([]);
    setSummary(null);
    setTimer({ isRunning: true, elapsedSeconds: 0 });
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
