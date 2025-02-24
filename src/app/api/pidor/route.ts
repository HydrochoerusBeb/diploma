import { NextResponse } from "next/server";
import { PidorRequest } from "@/utils/types/PidorResonseType";
export async function POST(req: Request) {
  try {
    const body: PidorRequest = await req.json();

    if (!Array.isArray(body.numbers) || body.numbers.some(n => typeof n !== "number")) {
      return NextResponse.json({ error: "Invalid input, expected an array of numbers" }, { status: 400 });
    }

    const sum = body.numbers.reduce((acc, num) => acc + num, 0);

    return NextResponse.json({ sum });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
