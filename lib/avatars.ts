/**
 * Avatar Utilities
 * Helper functions for working with avatars
 */

import prisma from '@/lib/prisma';

/**
 * Get avatar URL from database by avatar ID
 * Falls back to DiceBear if not found
 */
export async function getAvatarUrlById(avatarId: string): Promise<string> {
  // If it's already a URL, return it
  if (avatarId.startsWith('http')) {
    return avatarId;
  }

  // If it's 'initials', return that
  if (avatarId === 'initials') {
    return 'initials';
  }

  try {
    // Try to fetch from database
    const avatar = await prisma.avatar.findUnique({
      where: { id: avatarId },
      select: { url: true },
    });

    if (avatar) {
      return avatar.url;
    }
  } catch (error) {
    console.error('Error fetching avatar URL:', error);
  }

  // Fallback to DiceBear with the ID as seed
  return `https://api.dicebear.com/7.x/adventurer/svg?seed=${avatarId}`;
}

/**
 * Get avatar data from database by ID
 */
export async function getAvatarById(avatarId: string) {
  try {
    return await prisma.avatar.findUnique({
      where: { id: avatarId },
    });
  } catch (error) {
    console.error('Error fetching avatar:', error);
    return null;
  }
}
