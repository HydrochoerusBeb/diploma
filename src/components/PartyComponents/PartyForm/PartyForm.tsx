'use client';

import React from 'react';
import { SessionData, Compain } from '@/actions/party';
import { useRef } from 'react';

interface PartyFormProps {
  formState: SessionData;
  compains: Compain[];
  onCreate: () => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isDisabled: boolean;
  id: string | string[] | undefined;
  onChange: (newFormState: Partial<SessionData>) => void;
}

export default function PartyForm({
  formState,
  // compains,
  onCreate,
  onImport,
  isDisabled,
  id,
  onChange,
}: PartyFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-2">
      <input
        placeholder="Название сессии"
        value={formState.name}
        onChange={(e) => onChange({ name: e.target.value })}
        className="border p-2 w-full text-black"
        // disabled={isDisabled}
      />
      <input
        placeholder="Описание"
        value={formState.scenario}
        onChange={(e) => onChange({ scenario: e.target.value })}
        className="border p-2 w-full text-black"
        // disabled={isDisabled}
      />
      <input
        placeholder="Персонажи (через запятую)"
        value={formState.charactersString}
        onChange={(e) => onChange({ charactersString: e.target.value })}
        className="border p-2 w-full text-black"
        // disabled={isDisabled}
      />
      <input
        type="text"
        value={id}
        className="border p-2 w-full text-black"
        disabled={isDisabled}
      />
      <div className="flex space-x-2">
        <button
          onClick={onCreate}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
          disabled={isDisabled}
        >
          Создать сессию
        </button>
        <input
          type="file"
          accept=".json"
          onChange={onImport}
          ref={fileInputRef}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="bg-purple-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
          disabled={isDisabled}
        >
          Продолжить партию
        </button>
      </div>
    </div>
  );
}