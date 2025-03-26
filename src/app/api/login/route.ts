"use server";

import prisma from "@/lib/prisma";
import { encrypt } from "@/lib/session";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const SECRET = process.env.JWT_SECRET || "supersecret";
export async function handleSubmit(formData: FormData) {
  const email = formData.get("email") as string | undefined;
  const password = formData.get("password") as string | Buffer<ArrayBufferLike>;

  const user = await prisma.user.findUnique({ where: { email } });
  await prisma.user.findUnique({ where: { email } });
  await bcrypt.compare(password, user!.password);
  const token = jwt.sign({ id: user!.id, email: user!.email }, SECRET, {
    expiresIn: "7d",
  });
  const session = await encrypt({ id: user!.id, email: user!.email });
  const cookieStore = await cookies();
  cookieStore.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60,
    path: "/",
  });
  cookieStore.set("session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60,
    sameSite: "lax",
    path: "/",
  });
  revalidatePath("/login");
  redirect("/companies");
}
