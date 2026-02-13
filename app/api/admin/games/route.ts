import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import prisma from "@/lib/prisma";

// GET all games (admin view)
export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const games = await prisma.game.findMany({
      orderBy: { displayOrder: "asc" },
    });

    return NextResponse.json({ games }, { status: 200 });
  } catch (error) {
    console.error("Error fetching games:", error);
    return NextResponse.json(
      { error: "Failed to fetch games" },
      { status: 500 }
    );
  }
}

// POST - Create a new game
export async function POST(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const body = await request.json();
    const {
      type,
      name,
      description,
      trainsLogic,
      trainsMemory,
      trainsStrategy,
      trainsReaction,
      rules,
      minPlayers,
      maxPlayers,
      avgDuration,
      showInDashboard,
      isFeatured,
      isComingSoon,
      isNewlyLaunched,
      displayOrder,
      thumbnailUrl,
      bannerUrl,
    } = body;

    const game = await prisma.game.create({
      data: {
        type,
        name,
        description,
        trainsLogic: trainsLogic ?? false,
        trainsMemory: trainsMemory ?? false,
        trainsStrategy: trainsStrategy ?? false,
        trainsReaction: trainsReaction ?? false,
        rules: rules ?? "{}",
        minPlayers: minPlayers ?? 1,
        maxPlayers: maxPlayers ?? 1,
        avgDuration: avgDuration ?? 300,
        showInDashboard: showInDashboard ?? true,
        isFeatured: isFeatured ?? false,
        isComingSoon: isComingSoon ?? false,
        isNewlyLaunched: isNewlyLaunched ?? false,
        displayOrder: displayOrder ?? 0,
        thumbnailUrl,
        bannerUrl,
      },
    });

    return NextResponse.json({ game }, { status: 201 });
  } catch (error) {
    console.error("Error creating game:", error);
    return NextResponse.json(
      { error: "Failed to create game" },
      { status: 500 }
    );
  }
}
