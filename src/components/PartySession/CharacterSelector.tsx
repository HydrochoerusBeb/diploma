"use client";

import { Character } from "@/utils/types/Character";
import { Button } from "@heroui/react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  allCharacters: Character[];
  selectedCharacters: Character[];
  setSelectedCharacters: (characters: Character[]) => void;
};

export default function CharacterSelector({
  isOpen,
  onClose,
  allCharacters,
  selectedCharacters,
  setSelectedCharacters,
}: Props) {
  if (!isOpen) return null;

  const toggleCharacter = (char: Character) => {
    const exists = selectedCharacters.find((c) => c.id === char.id);
    if (exists) {
      setSelectedCharacters(selectedCharacters.filter((c) => c.id !== char.id));
    } else {
      setSelectedCharacters([...selectedCharacters, char]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg max-h-[80vh] overflow-auto w-[500px]">
        <h2 className="text-xl font-bold mb-2">Выбери персонажей</h2>
        <div className="space-y-3">
          {allCharacters.map((char) => {
            const isSelected = selectedCharacters.some((c) => c.id === char.id);
            return (
              <div
                key={char.id}
                onClick={() => toggleCharacter(char)}
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
          <Button onPress={onClose}>Отмена</Button>
          <Button onPress={onClose} className="bg-blue-600 text-white">
            Подтвердить
          </Button>
        </div>
      </div>
    </div>
  );
}
