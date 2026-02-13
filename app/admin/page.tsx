"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Users, Gamepad2, CheckCircle, User, TrendingUp, Target, Zap } from "lucide-react";

interface DashboardStats {
  totalUsers: number;
  totalGames: number;
  totalAvatars: number;
  activeGames: number;
  recentUsers: number;
  totalSessions: number;
  activeSessions: number;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/api/admin/dashboard");
        if (response.status === 403) {
          router.push("/");
          return;
        }
        const data = await response.json();
        setStats(data.stats);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    }

    if (status === "authenticated") {
      fetchStats();
    }
  }, [status, router]);

  if (loading || status === "loading") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-red-600">Failed to load dashboard</div>
      </div>
    );
  }

  const statCards = [
    { label: "Total Users", value: stats.totalUsers, Icon: Users, color: "bg-blue-500" },
    { label: "Total Games", value: stats.totalGames, Icon: Gamepad2, color: "bg-green-500" },
    { label: "Active Games", value: stats.activeGames, Icon: CheckCircle, color: "bg-emerald-500" },
    { label: "Total Avatars", value: stats.totalAvatars, Icon: User, color: "bg-purple-500" },
    { label: "New Users (7d)", value: stats.recentUsers, Icon: TrendingUp, color: "bg-orange-500" },
    { label: "Total Sessions", value: stats.totalSessions, Icon: Target, color: "bg-pink-500" },
    { label: "Active Sessions", value: stats.activeSessions, Icon: Zap, color: "bg-yellow-500" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-2">Overview of GamingHub statistics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.Icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-800 mt-2">
                    {stat.value.toLocaleString()}
                  </p>
                </div>
                <div className={`${stat.color} w-12 h-12 rounded-full flex items-center justify-center`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button
              onClick={() => router.push("/admin/games")}
              className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <span className="font-medium text-blue-700">Manage Games</span>
            </button>
            <button
              onClick={() => router.push("/admin/avatars")}
              className="w-full text-left px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
            >
              <span className="font-medium text-purple-700">Manage Avatars</span>
            </button>
            <button
              onClick={() => router.push("/admin/users")}
              className="w-full text-left px-4 py-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
            >
              <span className="font-medium text-green-700">Manage Users</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">System Status</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Database</span>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">API Status</span>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                Operational
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Active Sessions</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                {stats.activeSessions}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
