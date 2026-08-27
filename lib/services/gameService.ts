import { Game, Player, GameConfig, GamePhase } from '@/types/game';

// Clean alphabet avoiding 0/O, 1/I, L to prevent confusion
const ROOM_CODE_CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

export function generateRoomCode(length = 5): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * ROOM_CODE_CHARS.length);
    result += ROOM_CODE_CHARS[randomIndex];
  }
  return result;
}

export function generateSessionToken(): string {
  return 'tok_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

export function generatePlayerId(): string {
  return 'ply_' + Math.random().toString(36).substring(2, 11);
}

export function generateGameId(): string {
  return 'gm_' + Math.random().toString(36).substring(2, 11);
}

export function generateRoundId(): string {
  return 'rnd_' + Math.random().toString(36).substring(2, 11);
}

export function generateAvatarSeed(name: string): string {
  const clean = name.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  return `${clean || 'player'}-${Math.floor(Math.random() * 1000)}`;
}

export function sanitizePlayerName(name: string): string {
  return name.trim().replace(/<[^>]*>?/gm, '').substring(0, 20);
}

export function validatePlayerName(name: string, existingPlayers: Player[] = []): { valid: boolean; error?: string } {
  const sanitized = sanitizePlayerName(name);
  if (!sanitized || sanitized.length < 2) {
    return { valid: false, error: 'Name must be at least 2 characters.' };
  }
  if (sanitized.length > 20) {
    return { valid: false, error: 'Name cannot exceed 20 characters.' };
  }
  const isDuplicate = existingPlayers.some(
    p => p.name.toLowerCase().trim() === sanitized.toLowerCase()
  );
  if (isDuplicate) {
    return { valid: false, error: 'That name is already taken in this room.' };
  }
  return { valid: true };
}

export function getMaxImpostersAllowed(playerCount: number): number {
  if (playerCount < 3) return 0;
  // Ensure at least 2 normal players remain
  // e.g. 3-4 players -> 1 imposter; 5-6 players -> 2 imposters; 7-8 players -> 3 imposters; etc.
  return Math.max(1, Math.floor((playerCount - 2) / 2));
}

export function validateGameConfig(config: Partial<GameConfig>, playerCount = 6): { valid: boolean; error?: string } {
  const maxPlayers = config.maxPlayers ?? 6;
  if (maxPlayers < 3 || maxPlayers > 20) {
    return { valid: false, error: 'Player count must be between 3 and 20.' };
  }

  const imposterCount = config.imposterCount ?? 2;
  const maxImposters = getMaxImpostersAllowed(maxPlayers);
  if (imposterCount < 1 || imposterCount > maxImposters) {
    return { valid: false, error: `Invalid imposter count. Max ${maxImposters} imposters for ${maxPlayers} players.` };
  }

  const rounds = config.totalRounds ?? 5;
  if (![3, 5, 7, 10].includes(rounds)) {
    return { valid: false, error: 'Rounds must be 3, 5, 7, or 10.' };
  }

  return { valid: true };
}
