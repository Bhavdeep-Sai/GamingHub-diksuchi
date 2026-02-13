import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import prisma from "@/lib/prisma";

// GET all avatars
export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const avatars = await prisma.avatar.findMany({
      orderBy: { displayOrder: "asc" },
    });

    return NextResponse.json({ avatars }, { status: 200 });
  } catch (error) {
    console.error("Error fetching avatars:", error);
    return NextResponse.json(
      { error: "Failed to fetch avatars" },
      { status: 500 }
    );
  }
}

// POST - Create a new avatar
export async function POST(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const body = await request.json();
    const { name, url, category, isActive, isPremium, displayOrder } = body;

    if (!name || !url) {
      return NextResponse.json(
        { error: "Name and URL are required" },
        { status: 400 }
      );
    }

    const avatar = await prisma.avatar.create({
      data: {
        name,
        url,
        category,
        isActive: isActive ?? true,
        isPremium: isPremium ?? false,
        displayOrder: displayOrder ?? 0,
      },
    });

    return NextResponse.json({ avatar }, { status: 201 });
  } catch (error) {
    console.error("Error creating avatar:", error);
    return NextResponse.json(
      { error: "Failed to create avatar" },
      { status: 500 }
    );
  }
}
