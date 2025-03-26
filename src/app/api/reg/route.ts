import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    console.log(email, password);
    
    if (!email || !password) {
      return NextResponse.json(
        { error: "Заполните все поля" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "Такой пользователь уже есть" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: { email, password: hashedPassword },
    });
    
    return NextResponse.redirect(new URL("/login", req.url), 302);
  } catch (error) {
    console.error("Ошибка регистрации:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}


// 'use server'

// import prisma from "@/lib/prisma";
// import bcrypt from "bcrypt";
// import { NextResponse } from "next/server";



// export async function register(formData:FormData) {
//   const email = formData.get("email") as string | undefined;
//   const password = formData.get("password") as string | Buffer<ArrayBufferLike>;

//   const existingUser = await prisma.user.findUnique({ where: { email } });

// }