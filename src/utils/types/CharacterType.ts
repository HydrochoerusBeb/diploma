export interface BaseCharacter {
  id: string;
  name: string;
  description: string;
  class?: string;
  race: string;
  level: number;
  alive: boolean;
}

export interface MainCharacter extends BaseCharacter {
  avatar?: Uint8Array | null;
  type: "main";
}

export interface NpcCharacter extends BaseCharacter {
  location: string;
  occupation: string;
  type: "npc";
}


export type Character = MainCharacter | NpcCharacter;