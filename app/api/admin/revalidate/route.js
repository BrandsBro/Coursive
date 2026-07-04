import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST() {
  revalidatePath("/quiz");
  revalidatePath("/admin/quiz");
  return NextResponse.json({ revalidated: true });
}
