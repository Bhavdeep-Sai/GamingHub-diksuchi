import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ensureInitialized } from "@/lib/init";

// GET active avatars for user selection
export async function GET(request: NextRequest) {
  try {
    // Ensure avatars exist
    await ensureInitialized();
    
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get("includeInactive") === "true";

    const where: any = {};
    
    if (!includeInactive) {
      where.isActive = true;
    }

    const avatars = await prisma.avatar.findMany({
      where,
      orderBy: [
        { isPremium: 'asc' }, // Free avatars first
        { displayOrder: 'asc' }
      ],
      select: {
        id: true,
        name: true,
        url: true,
        category: true,
        isPremium: true,
        displayOrder: true,
      },
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
