"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Grid3x3, List } from "lucide-react";

interface Game {
  id: string;
  type: string;
  name: string;
  description: string;
  showInDashboard: boolean;
  isFeatured: boolean;
  isComingSoon: boolean;
  isNewlyLaunched: boolean;
  isActive: boolean;
  displayOrder: number;
  thumbnailUrl?: string;
  bannerUrl?: string;
}

export default function AdminGamesPage() {
  const { status } = useSession();
  const router = useRouter();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    fetchGames();
  }, []);

  async function fetchGames() {
    try {
      const response = await fetch("/api/admin/games");
      if (response.status === 403) {
        router.push("/");
        return;
      }
      const data = await response.json();
      setGames(data.games);
    } catch (error) {
      console.error("Error fetching games:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(game: Game) {
    try {
      const response = await fetch(`/api/admin/games/${game.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(game),
      });

      if (response.ok) {
        await fetchGames();
        setShowModal(false);
        setEditingGame(null);
      }
    } catch (error) {
      console.error("Error updating game:", error);
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Games Management</h1>
          <p className="text-gray-600 mt-2">Manage game visibility and settings</p>
        </div>
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
              viewMode === 'grid'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Grid3x3 className="h-4 w-4" />
            <span className="text-sm font-medium">Grid</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
              viewMode === 'list'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <List className="h-4 w-4" />
            <span className="text-sm font-medium">List</span>
          </button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {games.map((game) => (
            <div key={game.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="aspect-video bg-gray-100 flex items-center justify-center">
                {game.thumbnailUrl ? (
                  <img
                    src={game.thumbnailUrl}
                    alt={game.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-400 text-sm">No Image</span>
                )}
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-gray-800 mb-1 text-sm truncate">{game.name}</h3>
                <p className="text-xs text-gray-600 mb-2">{game.type}</p>
                <div className="flex flex-wrap gap-1 mb-2">
                  <span
                    className={`px-2 py-0.5 text-xs rounded ${
                      game.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {game.isActive ? "Active" : "Inactive"}
                  </span>
                  {game.showInDashboard && (
                    <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
                      Visible
                    </span>
                  )}
                  {game.isFeatured && (
                    <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded">
                      Featured
                    </span>
                  )}
                  {game.isComingSoon && (
                    <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-800 rounded">
                      Soon
                    </span>
                  )}
                  {game.isNewlyLaunched && (
                    <span className="px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded">
                      New
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-600 mb-2">
                  Order: {game.displayOrder}
                </div>
                <button
                  onClick={() => {
                    setEditingGame(game);
                    setShowModal(true);
                  }}
                  className="w-full bg-blue-50 text-blue-600 px-2 py-1.5 rounded-md hover:bg-blue-100 text-xs"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Game
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dashboard
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tags
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {games.map((game) => (
              <tr key={game.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{game.name}</div>
                  <div className="text-sm text-gray-500">{game.type}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      game.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {game.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      game.showInDashboard
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {game.showInDashboard ? "Visible" : "Hidden"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-wrap gap-1">
                    {game.isFeatured && (
                      <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                        Featured
                      </span>
                    )}
                    {game.isComingSoon && (
                      <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">
                        Coming Soon
                      </span>
                    )}
                    {game.isNewlyLaunched && (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                        New
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {game.displayOrder}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => {
                      setEditingGame(game);
                      setShowModal(true);
                    }}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}

      {/* Edit Modal */}
      {showModal && editingGame && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Edit Game: {editingGame.name}</h2>
            
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingGame.isActive}
                    onChange={(e) =>
                      setEditingGame({ ...editingGame, isActive: e.target.checked })
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium text-gray-700">Active</span>
                </label>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingGame.showInDashboard}
                    onChange={(e) =>
                      setEditingGame({ ...editingGame, showInDashboard: e.target.checked })
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium text-gray-700">Show in Dashboard</span>
                </label>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingGame.isFeatured}
                    onChange={(e) =>
                      setEditingGame({ ...editingGame, isFeatured: e.target.checked })
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium text-gray-700">Featured</span>
                </label>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingGame.isComingSoon}
                    onChange={(e) =>
                      setEditingGame({ ...editingGame, isComingSoon: e.target.checked })
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium text-gray-700">Coming Soon</span>
                </label>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingGame.isNewlyLaunched}
                    onChange={(e) =>
                      setEditingGame({ ...editingGame, isNewlyLaunched: e.target.checked })
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium text-gray-700">Newly Launched</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  value={editingGame.displayOrder}
                  onChange={(e) =>
                    setEditingGame({ ...editingGame, displayOrder: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={editingGame.description}
                  onChange={(e) =>
                    setEditingGame({ ...editingGame, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thumbnail URL
                </label>
                <input
                  type="text"
                  value={editingGame.thumbnailUrl || ""}
                  onChange={(e) =>
                    setEditingGame({ ...editingGame, thumbnailUrl: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Banner URL
                </label>
                <input
                  type="text"
                  value={editingGame.bannerUrl || ""}
                  onChange={(e) =>
                    setEditingGame({ ...editingGame, bannerUrl: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => handleUpdate(editingGame)}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Save Changes
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingGame(null);
                }}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
