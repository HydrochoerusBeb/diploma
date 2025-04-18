"use server";

import prisma from "@/lib/prisma";

export async function createCompany({
  title,
  description,
  userId,
}: {
  title: string;
  description: string;
  userId: string;
}) {
  await prisma.compain.create({
    data: { title, description, userId },
  });
}

export async function getCompanies(userId: string) {
  const compains = await prisma.compain.findMany({
    where: { userId },
  });
  return compains;
}

export async function getCompany({
  id,
  userId,
}: {
  id: number;
  userId: string;
}) {
  const compain = await prisma.compain.findUnique({
    where: { self: id, userId: userId },
  });

  return compain;
}

export async function createParty({
  title,
  description,
  userId,
  compainId,
}: {
  title: string;
  description: string;
  userId: string;
  compainId: string;
}) {
  await prisma.party.create({
    data: { title, description, userId, compainId },
  });
}

export async function getParties(userId: string, compainId: string) {
  const compains = await prisma.party.findMany({
    where: { userId, compainId },
  });
  return compains;
}


export async function getParty({
  id,
  userId,
}: {
  id: number;
  userId: string;
})  {
  const party = await prisma.party.findUnique({
    where: { self: id, userId: userId },
  });
  return party;
}

export async function createMainCharacter({
  name,
  className,
  race,
  description,
  avatar,
  level,
  alive = true,
  userId,
  compainId,
}: {
  name: string;
  className: string;
  race: string;
  description: string;
  avatar?:  Uint8Array | null;
  level: number;
  alive?: boolean;
  userId: string;
  compainId: string;
}) {
  return await prisma.mainCharacter.create({
    data: {
      name,
      class: className,
      race,
      description,
      level,
      avatar,
      alive,
      userId,
      compainId,
    },
  });
}


export async function createNpcCharacter({
  name,
  className,
  race,
  description,
  avatar,
  level,
  location,
  occupation,
  alive = true,
  userId,
  compainId,
}: {
  name: string;
  className?: string;
  race?: string;
  description: string;
  avatar?:  Uint8Array | null;
  level: number;
  location: string;
  occupation?: string;
  alive?: boolean;
  userId: string;
  compainId: string;
}) {
  return await prisma.character.create({
    data: {
      name,
      class: className,
      race: race ?? "Unknown",
      description,
      avatar,
      level,
      alive,
      location,
      occupation: occupation ?? "Unknown",
      userId,
      compainId,
    },
  });
}


// Получить всех основных персонажей кампании
export async function getMainCharactersByCompany(compainId: string, userId: string) {
  return await prisma.mainCharacter.findMany({
    where: {
      compainId,
      userId,
    },
    select: {
      id: true,
      name: true,
      race: true,
      class: true,
      level: true,
    },
  });
}

// Получить всех NPC персонажей кампании
export async function getNpcCharactersByCompany(compainId: string, userId: string) {
  return await prisma.character.findMany({
    where: {
      compainId,
      userId,
    },
    select: {
      id: true,
      name: true,
      race: true,
      occupation: true,
      location: true,
      level: true,
    },
  });
}



export async function getCharactersByCompany(companyId: string) {
  const [mainCharacters, npcs] = await Promise.all([
    prisma.mainCharacter.findMany({
      where: { compainId: companyId },
      select: { id: true, name: true },
    }),
    prisma.character.findMany({
      where: { compainId: companyId },
      select: { id: true, name: true, location: true },
    }),
  ]);

  return [
    mainCharacters,
    npcs,
  ];
}


export async function getMainCharacterById(id: string) {
  return await prisma.mainCharacter.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      class: true,
      race: true,
      description: true,
      avatar: true,
      level: true,
      alive: true,
    },
  });
}


export async function getCharacterById(id: string) {
  return await prisma.character.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      class: true,
      race: true,
      description: true,
      avatar: true,
      level: true,
      alive: true,
      location: true,
      occupation: true,
    },
  });
}
