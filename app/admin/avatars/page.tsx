"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Grid3x3, List } from "lucide-react";

interface Avatar {
  id: string;
  name: string;
  url: string;
  category?: string;
  isActive: boolean;
  isPremium: boolean;
  displayOrder: number;
}

type ViewMode = 'grid' | 'list';

export default function AdminAvatarsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAvatar, setEditingAvatar] = useState<Avatar | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    fetchAvatars();
  }, []);

  async function fetchAvatars() {
    try {
      const response = await fetch("/api/admin/avatars");
      if (response.status === 403) {
        router.push("/");
        return;
      }
      const data = await response.json();
      setAvatars(data.avatars);
    } catch (error) {
      console.error("Error fetching avatars:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(avatar: Avatar) {
    try {
      const url = isCreating ? "/api/admin/avatars" : `/api/admin/avatars/${avatar.id}`;
      const method = isCreating ? "POST" : "PATCH";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(avatar),
      });

      if (response.ok) {
        await fetchAvatars();
        setShowModal(false);
        setEditingAvatar(null);
        setIsCreating(false);
      }
    } catch (error) {
      console.error("Error saving avatar:", error);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this avatar?")) return;

    try {
      const response = await fetch(`/api/admin/avatars/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchAvatars();
      }
    } catch (error) {
      console.error("Error deleting avatar:", error);
    }
  }

  function openCreateModal() {
    setIsCreating(true);
    setEditingAvatar({
      id: "",
      name: "",
      url: "",
      category: "",
      isActive: true,
      isPremium: false,
      displayOrder: 0,
    });
    setShowModal(true);
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Avatars Management</h1>
          <p className="text-gray-600 mt-2">Manage user avatars</p>
        </div>
        <div className="flex gap-3 items-center">
          {/* View Toggle */}
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
          <button
            onClick={openCreateModal}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            + Add Avatar
          </button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
          {avatars.map((avatar) => (
            <div key={avatar.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                {avatar.url ? (
                  <img
                    src={avatar.url}
                    alt={avatar.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-400">No Image</span>
                )}
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-gray-800 mb-2 text-sm truncate">{avatar.name}</h3>
                <div className="flex flex-wrap gap-1 mb-2">
                  {avatar.category && (
                    <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded">
                      {avatar.category}
                    </span>
                  )}
                  {avatar.isPremium && (
                    <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded">
                      Premium
                    </span>
                  )}
                  <span
                    className={`px-2 py-0.5 text-xs rounded ${
                      avatar.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {avatar.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="text-xs text-gray-600 mb-2">
                  Order: {avatar.displayOrder}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      setEditingAvatar(avatar);
                      setIsCreating(false);
                      setShowModal(true);
                    }}
                    className="flex-1 bg-blue-50 text-blue-600 px-2 py-1.5 rounded-md hover:bg-blue-100 text-xs"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(avatar.id)}
                    className="flex-1 bg-red-50 text-red-600 px-2 py-1.5 rounded-md hover:bg-red-100 text-xs"
                  >
                    Delete
                  </button>
                </div>
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
                  Preview
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
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
              {avatars.map((avatar) => (
                <tr key={avatar.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                      {avatar.url ? (
                        <img
                          src={avatar.url}
                          alt={avatar.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-400 text-xs">No Image</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{avatar.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                      {avatar.category || 'Uncategorized'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-1">
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          avatar.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {avatar.isActive ? "Active" : "Inactive"}
                      </span>
                      {avatar.isPremium && (
                        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                          Premium
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">{avatar.displayOrder}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => {
                        setEditingAvatar(avatar);
                        setIsCreating(false);
                        setShowModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(avatar.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit/Create Modal */}
      {showModal && editingAvatar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6">
              {isCreating ? "Add New Avatar" : `Edit Avatar: ${editingAvatar.name}`}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={editingAvatar.name}
                  onChange={(e) =>
                    setEditingAvatar({ ...editingAvatar, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Avatar name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL *
                </label>
                <input
                  type="text"
                  value={editingAvatar.url}
                  onChange={(e) =>
                    setEditingAvatar({ ...editingAvatar, url: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={editingAvatar.category || ""}
                  onChange={(e) =>
                    setEditingAvatar({ ...editingAvatar, category: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="e.g., animals, fantasy, space"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  value={editingAvatar.displayOrder}
                  onChange={(e) =>
                    setEditingAvatar({ ...editingAvatar, displayOrder: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingAvatar.isActive}
                    onChange={(e) =>
                      setEditingAvatar({ ...editingAvatar, isActive: e.target.checked })
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
                    checked={editingAvatar.isPremium}
                    onChange={(e) =>
                      setEditingAvatar({ ...editingAvatar, isPremium: e.target.checked })
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium text-gray-700">Premium</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => handleSave(editingAvatar)}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                disabled={!editingAvatar.name || !editingAvatar.url}
              >
                {isCreating ? "Create Avatar" : "Save Changes"}
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingAvatar(null);
                  setIsCreating(false);
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
