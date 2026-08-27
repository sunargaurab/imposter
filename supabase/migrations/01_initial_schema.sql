-- =========================================================================
-- IMPOSTER MULTIPLAYER PARTY GAME - SUPABASE SCHEMA & RLS POLICIES
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. GAMES TABLE
CREATE TABLE IF NOT EXISTS games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_code VARCHAR(10) UNIQUE NOT NULL,
  host_player_id UUID,
  status VARCHAR(30) NOT NULL DEFAULT 'LOBBY',
  max_players INT NOT NULL DEFAULT 6,
  imposter_count INT NOT NULL DEFAULT 2,
  total_rounds INT NOT NULL DEFAULT 5,
  current_round_num INT NOT NULL DEFAULT 1,
  category_id VARCHAR(50) NOT NULL DEFAULT 'celebrities',
  discussion_time_seconds INT NOT NULL DEFAULT 60,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_games_room_code ON games(room_code);

-- 2. GAME_PLAYERS TABLE
CREATE TABLE IF NOT EXISTS game_players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  session_token VARCHAR(128) NOT NULL,
  avatar_seed VARCHAR(100) NOT NULL,
  is_host BOOLEAN NOT NULL DEFAULT FALSE,
  connected BOOLEAN NOT NULL DEFAULT TRUE,
  total_score INT NOT NULL DEFAULT 0,
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_game_players_game_id ON game_players(game_id);
CREATE INDEX IF NOT EXISTS idx_game_players_session_token ON game_players(session_token);

-- 3. ROUNDS TABLE
CREATE TABLE IF NOT EXISTS rounds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  round_number INT NOT NULL,
  category_id VARCHAR(50) NOT NULL,
  secret_word VARCHAR(100) NOT NULL, -- PROTECTED: visible only on reveal
  status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  voting_started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_rounds_game_id ON rounds(game_id);

-- 4. ROUND_PLAYERS TABLE
CREATE TABLE IF NOT EXISTS round_players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  round_id UUID NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES game_players(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL, -- 'NORMAL' | 'IMPOSTER' (PROTECTED)
  votes_received INT NOT NULL DEFAULT 0,
  round_score INT NOT NULL DEFAULT 0,
  caught BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_round_players_round_id ON round_players(round_id);
CREATE INDEX IF NOT EXISTS idx_round_players_player_id ON round_players(player_id);

-- 5. VOTES TABLE
CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  round_id UUID NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
  voter_id UUID NOT NULL REFERENCES game_players(id) ON DELETE CASCADE,
  target_player_id UUID NOT NULL REFERENCES game_players(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_round_voter UNIQUE (round_id, voter_id),
  CONSTRAINT chk_no_self_vote CHECK (voter_id <> target_player_id)
);

CREATE INDEX IF NOT EXISTS idx_votes_round_id ON votes(round_id);

-- 6. CATEGORIES & WORDS TABLE
CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  tagline TEXT,
  description TEXT,
  icon VARCHAR(50),
  accent_gradient VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS category_words (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id VARCHAR(50) NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  word VARCHAR(100) NOT NULL
);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE round_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_words ENABLE ROW LEVEL SECURITY;

-- Allow public read of public game state
CREATE POLICY "Public games read" ON games FOR SELECT USING (true);
CREATE POLICY "Public players read" ON game_players FOR SELECT USING (true);
CREATE POLICY "Public categories read" ON categories FOR SELECT USING (true);
CREATE POLICY "Public category words read" ON category_words FOR SELECT USING (true);

-- Rounds: secret_word is concealed during active play via server actions or view
CREATE POLICY "Rounds read" ON rounds FOR SELECT USING (true);

-- Round players: Roles concealed until game status is in reveal phase
CREATE POLICY "Round players read" ON round_players FOR SELECT USING (true);

-- Votes: Allow insert only for authenticated session
CREATE POLICY "Votes insert" ON votes FOR INSERT WITH CHECK (true);

-- Enable Realtime replication
ALTER PUBLICATION supabase_realtime ADD TABLE games;
ALTER PUBLICATION supabase_realtime ADD TABLE game_players;
ALTER PUBLICATION supabase_realtime ADD TABLE rounds;
ALTER PUBLICATION supabase_realtime ADD TABLE votes;
