-- Little Bee — D1 schema
-- Run with: wrangler d1 execute little-bee --file=./schema.sql

CREATE TABLE IF NOT EXISTS players (
  id          TEXT PRIMARY KEY,
  nickname    TEXT NOT NULL,
  created_at  INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_players_nick ON players(nickname);

-- One row per (player, game) — store best score
CREATE TABLE IF NOT EXISTS scores (
  player_id   TEXT NOT NULL,
  game        TEXT NOT NULL,
  score       INTEGER NOT NULL,
  updated_at  INTEGER NOT NULL,
  PRIMARY KEY (player_id, game),
  FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_scores_game ON scores(game, score DESC);

CREATE TABLE IF NOT EXISTS predictions (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id   TEXT NOT NULL,
  prompt_key  TEXT NOT NULL,
  value       TEXT NOT NULL,
  created_at  INTEGER NOT NULL,
  FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_pred_prompt ON predictions(prompt_key, created_at DESC);

CREATE TABLE IF NOT EXISTS advice (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id   TEXT NOT NULL,
  message     TEXT NOT NULL,
  created_at  INTEGER NOT NULL,
  FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_advice_at ON advice(created_at DESC);

CREATE TABLE IF NOT EXISTS due_date_guesses (
  player_id   TEXT PRIMARY KEY,
  guess_date  TEXT NOT NULL,   -- ISO YYYY-MM-DD
  updated_at  INTEGER NOT NULL,
  FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS name_suggestions (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id   TEXT NOT NULL,
  name        TEXT NOT NULL,
  votes       INTEGER NOT NULL DEFAULT 0,
  created_at  INTEGER NOT NULL,
  FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_names_votes ON name_suggestions(votes DESC);

CREATE TABLE IF NOT EXISTS onesies (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id   TEXT NOT NULL,
  image_b64   TEXT NOT NULL,   -- data URL of PNG (kept small, <= 400x500)
  likes       INTEGER NOT NULL DEFAULT 0,
  created_at  INTEGER NOT NULL,
  FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_onesies_likes ON onesies(likes DESC);

-- Voice messages for baby (≤30s audio kept as base64 webm/mp4 in D1)
CREATE TABLE IF NOT EXISTS voices (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id   TEXT NOT NULL,
  audio_b64   TEXT NOT NULL,
  mime        TEXT NOT NULL DEFAULT 'audio/webm',
  duration    REAL NOT NULL,
  created_at  INTEGER NOT NULL,
  FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_voices_at ON voices(created_at DESC);

-- Music requests — guests submit, you/host curate
CREATE TABLE IF NOT EXISTS songs (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id   TEXT NOT NULL,
  song        TEXT NOT NULL,
  artist      TEXT,
  played      INTEGER NOT NULL DEFAULT 0,
  created_at  INTEGER NOT NULL,
  FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_songs_at ON songs(created_at DESC);

-- Bee-simple per-IP rate limiter for likes / posts
CREATE TABLE IF NOT EXISTS rate_limits (
  ip          TEXT NOT NULL,
  bucket      TEXT NOT NULL,
  count       INTEGER NOT NULL,
  window_start INTEGER NOT NULL,
  PRIMARY KEY (ip, bucket)
);
