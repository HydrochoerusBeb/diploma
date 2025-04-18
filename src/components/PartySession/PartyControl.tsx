import { useEffect, useState } from "react";
import { readSessionData, updateSessionData, SessionData } from "@/actions/party";
import { Button } from "@heroui/react";
import CharacterModal from "../PartyComponents/CharacterModal";

export default function SessionEditor({ sessionId }: { sessionId: string }) {
  const [data, setData] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalData, setModalData] = useState<{ id: string; type: "main" | "npc" } | null>(null);
  const [newLocation, setNewLocation] = useState({ key: "", value: "" });
  const [newLoot, setNewLoot] = useState({ name: "", desc: "" });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const result = await readSessionData(sessionId);
      setData(result);
      setLoading(false);
    };
    fetchData();
  }, [sessionId]);

  const updateField = (key: keyof SessionData, value: any) => {
    if (!data) return;
    setData({ ...data, [key]: value });
  };

  const saveChanges = async () => {
    if (!data) return;
    setSaving(true);
    await updateSessionData(sessionId, data);
    setSaving(false);
    alert("Сохранено");
  };

  const handleCharacterUpdate = (updatedChar: any) => {
    if (!data || !modalData) return;
    const key = modalData.type === "main" ? "mainCharacters" : "npcs";
    updateField(
      key,
      (data[key] || []).map((c: any) =>
        c.id === updatedChar.id ? updatedChar : c
      )
    );
  };

  const addLocation = () => {
    if (!newLocation.key.trim()) return;
    updateField("locations", {
      ...(data?.locations || {}),
      [newLocation.key]: newLocation.value,
    });
    setNewLocation({ key: "", value: "" });
  };

  const addLoot = () => {
    if (!newLoot.name.trim()) return;
    updateField("loot", [...(data?.loot || []), newLoot]);
    setNewLoot({ name: "", desc: "" });
  };

  if (loading) return <div>Загрузка данных...</div>;
  if (!data) return <div>Нет данных для редактирования</div>;

  return (
    <div className="p-4 border rounded bg-white space-y-4">
      <h2 className="text-xl font-bold">Редактирование session.json</h2>

      {/* Название и сценарий */}
      <input value={data.name} onChange={(e) => updateField("name", e.target.value)} className="border p-2 w-full text-black" placeholder="Название" />
      <input value={data.scenario} onChange={(e) => updateField("scenario", e.target.value)} className="border p-2 w-full text-black" placeholder="Сценарий" />

      {/* Персонажи */}
      {/* ... как было, не меняем ... */}

      {/* Локации */}
      <div>
        <label className="font-semibold">Локации</label>
        {Object.entries(data.locations || {}).map(([key, value], i) => (
          <div key={i} className="flex gap-2 mb-1">
            <input value={key} disabled className="border p-1 text-black w-1/3" />
            <input
              value={value}
              onChange={(e) =>
                updateField("locations", {
                  ...(data.locations || {}),
                  [key]: e.target.value,
                })
              }
              className="border p-1 text-black w-2/3"
            />
          </div>
        ))}
        <div className="flex gap-2 mt-2">
          <input
            placeholder="Название"
            value={newLocation.key}
            onChange={(e) => setNewLocation({ ...newLocation, key: e.target.value })}
            className="border p-1 text-black w-1/3"
          />
          <input
            placeholder="Описание"
            value={newLocation.value}
            onChange={(e) => setNewLocation({ ...newLocation, value: e.target.value })}
            className="border p-1 text-black w-2/3"
          />
          <Button onPress={addLocation}>Добавить</Button>
        </div>
      </div>

      {/* Лут */}
      <div>
        <label className="font-semibold">Лут</label>
        {Object.entries(data.loot || []).map(([key, value], i) => (
          <div key={i} className="flex gap-2 mb-1">
            <input value={key} disabled className="border p-1 text-black w-1/3" />
            <input
              value={value}
              onChange={(e) =>
                updateField("locations", {
                  ...(data.loot || {}),
                  [key]: e.target.value,
                })
              }
              className="border p-1 text-black w-2/3"
            />
          </div>
        ))}
        
        <div className="flex gap-2 mt-2">
          <input
            placeholder="Название"
            value={newLoot.name}
            onChange={(e) => setNewLoot({ ...newLoot, name: e.target.value })}
            className="border p-1 text-black w-1/3"
          />
          <input
            placeholder="Описание"
            value={newLoot.desc}
            onChange={(e) => setNewLoot({ ...newLoot, desc: e.target.value })}
            className="border p-1 text-black w-2/3"
          />
          <Button onPress={addLoot}>Добавить</Button>
        </div>
      </div>

      {/* Доп. детали */}
      <textarea
        value={data.details}
        onChange={(e) => updateField("details", e.target.value)}
        className="border p-2 w-full text-black"
        placeholder="Доп. детали"
      />

      <Button onPress={saveChanges} isDisabled={saving}>
        {saving ? "Сохраняю..." : "Сохранить"}
      </Button>
    </div>
  );
}
