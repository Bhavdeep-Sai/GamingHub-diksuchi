import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import prisma from "@/lib/prisma";
import { ensureInitialized } from "@/lib/init";

// GET admin dashboard stats
export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    // Ensure data exists
    await ensureInitialized();
    
    const [
      totalUsers,
      totalGames,
      totalAvatars,
      activeGames,
      recentUsers,
      totalSessions,
      activeSessions,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.game.count(),
      prisma.avatar.count(),
      prisma.game.count({ where: { isActive: true } }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
      }),
      prisma.gameSession.count(),
      prisma.gameSession.count({ where: { status: "IN_PROGRESS" } }),
    ]);

    return NextResponse.json({
      stats: {
        totalUsers,
        totalGames,
        totalAvatars,
        activeGames,
        recentUsers,
        totalSessions,
        activeSessions,
      },
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
