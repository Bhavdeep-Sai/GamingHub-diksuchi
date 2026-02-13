import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET a specific avatar by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const avatar = await prisma.avatar.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        url: true,
        category: true,
        isPremium: true,
      },
    });

    if (!avatar) {
      return NextResponse.json({ error: "Avatar not found" }, { status: 404 });
    }

    return NextResponse.json({ avatar }, { status: 200 });
  } catch (error) {
    console.error("Error fetching avatar:", error);
    return NextResponse.json(
      { error: "Failed to fetch avatar" },
      { status: 500 }
    );
  }
}
