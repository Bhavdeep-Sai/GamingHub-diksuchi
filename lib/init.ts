/**
 * Auto-initialization module
 * Automatically creates required data on first access
 */

import { PrismaClient } from '@prisma/client';
import { GAMES } from './constants';

const prisma = new PrismaClient();

let isInitialized = false;

export async function ensureInitialized() {
  if (isInitialized) return;
  
  try {
    await Promise.all([
      ensureGamesExist(),
      ensureDefaultAvatarsExist(),
    ]);
    isInitialized = true;
    console.log('✅ Auto-initialization completed');
  } catch (error) {
    console.error('❌ Auto-initialization failed:', error);
  }
}

async function ensureGamesExist() {
  const existingGames = await prisma.game.count();
  if (existingGames > 0) return;

  console.log('🎮 Auto-creating games...');
  
  const gamePromises = Object.entries(GAMES).map(([gameType, gameData]) =>
    prisma.game.create({
      data: {
        type: gameType as any,
        name: gameData.name,
        description: gameData.description,
        trainsLogic: gameData.trainsLogic,
        trainsMemory: gameData.trainsMemory,
        trainsStrategy: gameData.trainsStrategy,
        trainsReaction: gameData.trainsReaction,
        rules: JSON.stringify({}),
        minPlayers: gameData.minPlayers,
        maxPlayers: gameData.maxPlayers,
        avgDuration: gameData.avgDuration,
        isActive: true,
        showInDashboard: true,
        displayOrder: 0,
      },
    })
  );

  await Promise.all(gamePromises);
  console.log(`✅ Created ${gamePromises.length} games`);
}

async function ensureDefaultAvatarsExist() {
  const existingAvatars = await prisma.avatar.count();
  if (existingAvatars > 0) return;

  console.log('🎭 Auto-creating default avatars...');
  
  const defaultAvatars = [
    { name: 'Adventurer', category: 'characters', seed: 'adventurer' },
    { name: 'Adventurer Neutral', category: 'characters', seed: 'adventurer-neutral' },
    { name: 'Avataaars', category: 'characters', seed: 'avataaars' },
    { name: 'Avataaars Neutral', category: 'characters', seed: 'avataaars-neutral' },
    { name: 'Big Ears', category: 'characters', seed: 'big-ears' },
    { name: 'Big Ears Neutral', category: 'characters', seed: 'big-ears-neutral' },
    { name: 'Big Smile', category: 'characters', seed: 'big-smile' },
    { name: 'Bottts', category: 'robots', seed: 'bottts' },
    { name: 'Bottts Neutral', category: 'robots', seed: 'bottts-neutral' },
    { name: 'Croodles', category: 'characters', seed: 'croodles' },
    { name: 'Croodles Neutral', category: 'characters', seed: 'croodles-neutral' },
    { name: 'Fun Emoji', category: 'emoji', seed: 'fun-emoji' },
    { name: 'Icons', category: 'abstract', seed: 'icons' },
    { name: 'Identicon', category: 'abstract', seed: 'identicon' },
    { name: 'Initials', category: 'minimalist', seed: 'initials' },
    { name: 'Lorelei', category: 'characters', seed: 'lorelei' },
    { name: 'Lorelei Neutral', category: 'characters', seed: 'lorelei-neutral' },
    { name: 'Micah', category: 'characters', seed: 'micah' },
    { name: 'Miniavs', category: 'characters', seed: 'miniavs' },
    { name: 'Notionists', category: 'characters', seed: 'notionists' },
    { name: 'Notionists Neutral', category: 'characters', seed: 'notionists-neutral' },
    { name: 'Open Peeps', category: 'characters', seed: 'open-peeps' },
    { name: 'Personas', category: 'characters', seed: 'personas' },
    { name: 'Pixel Art', category: 'retro', seed: 'pixel-art' },
    { name: 'Pixel Art Neutral', category: 'retro', seed: 'pixel-art-neutral' },
    { name: 'Rings', category: 'abstract', seed: 'rings' },
    { name: 'Shapes', category: 'abstract', seed: 'shapes' },
    { name: 'Thumbs', category: 'emoji', seed: 'thumbs' },
  ];

  const avatarPromises = defaultAvatars.map((avatar, index) =>
    prisma.avatar.create({
      data: {
        name: avatar.name,
        url: `https://api.dicebear.com/9.x/${avatar.seed}/svg?seed=${avatar.name.toLowerCase().replace(/\s+/g, '-')}`,
        category: avatar.category,
        isActive: true,
        isPremium: false,
        displayOrder: index + 1,
      },
    })
  );

  await Promise.all(avatarPromises);
  console.log(`✅ Created ${avatarPromises.length} default avatars`);
}

// Auto-initialize once when the module loads
if (process.env.NODE_ENV !== 'test') {
  ensureInitialized().catch(console.error);
}