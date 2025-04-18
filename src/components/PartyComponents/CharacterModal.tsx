import { useEffect, useState } from "react";
// import { getMainCharacterById, getNPCById } from "@/actions/characterActions";
import { Button } from "@heroui/react";
import {
  getCharacterById,
  getMainCharacterById,
} from "@/actions/companyActions";

type CharacterModalProps = {
  character: any;
  type: "main" | "npc";
  onClose: () => void;
  onChange: (updated: any) => void;
};

export default function CharacterModal({
  character,
  type,
  onClose,
  onChange,
}: CharacterModalProps) {
  if (!character) return <div className="p-4">Персонаж не найден</div>;

  
  const {
    name = "",
    class: className = "",
    race = "",
    description = "",
    level = 1,
    alive = true,
  } = character;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-center items-center">
      <div className="bg-slate-600 p-6 rounded-lg w-[500px] space-y-4">
        <h2 className="text-xl font-bold">{name}</h2>
        <p>
          <strong>Класс:</strong> {className}
        </p>
        <p>
          <strong>Раса:</strong> {race}
        </p>

        <div>
          <label className="block font-semibold">Описание</label>
          <textarea
            className="border p-2 w-full text-black"
            value={description}
            onChange={(e) =>
              onChange({ ...character, description: e.target.value })
            }
          />
        </div>

        <div className="flex gap-4 items-center">
          <label className="font-semibold">Уровень</label>
          <input
            type="number"
            className="border p-1 text-black w-20"
            value={level}
            onChange={(e) =>
              onChange({ ...character, level: parseInt(e.target.value) || 1 })
            }
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="font-semibold">Жив</label>
          <input
            type="checkbox"
            checked={Boolean(character.alive)} 
            onChange={(e) =>
              onChange({ ...character, alive: e.target.checked })
            }
          />
        </div>

        <div className="flex justify-end pt-4 gap-2">
          <Button onPress={onClose}>Закрыть</Button>
        </div>
      </div>
    </div>
  );
}
