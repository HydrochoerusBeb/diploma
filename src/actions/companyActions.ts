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
