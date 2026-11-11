// Database schema — one DDL per dialect.
//
// `SCHEMA_SQL` resolves to whichever backend this process is using:
// Postgres DDL below when DATABASE_URL is set, SQLite DDL otherwise.
// Applied once at startup by `seed.mjs` (`ensureSchema`).
import { usePostgres } from "./dialect.mjs";
import { SQLITE_SCHEMA_SQL } from "./schema.sqlite.mjs";

export const PG_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT);

CREATE TABLE IF NOT EXISTS orgs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS assessments (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL DEFAULT 'mock',
  base_path TEXT NOT NULL DEFAULT '',
  duration_min INTEGER NOT NULL DEFAULT 60,
  total_marks REAL NOT NULL DEFAULT 0,
  start_at TEXT,
  end_at TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  show_feedback INTEGER NOT NULL DEFAULT 1,
  use_default_feedback INTEGER NOT NULL DEFAULT 1,
  store_response INTEGER NOT NULL DEFAULT 0,
  require_fullscreen INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 1,
  open_to_all INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS assessment_languages (
  assessment_id TEXT NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  lang_id INTEGER NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  seq INTEGER NOT NULL DEFAULT 0,
  is_primary INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (assessment_id, lang_id)
);

CREATE TABLE IF NOT EXISTS groups (
  id SERIAL PRIMARY KEY,
  assessment_id TEXT NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  seq INTEGER NOT NULL,
  ext_id TEXT NOT NULL DEFAULT '',
  name TEXT NOT NULL DEFAULT '',
  instruction TEXT NOT NULL DEFAULT '',
  instruction_time_sec INTEGER NOT NULL DEFAULT 0,
  max_duration_sec INTEGER NOT NULL DEFAULT 0,
  total_marks REAL NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS sections (
  id SERIAL PRIMARY KEY,
  group_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  seq INTEGER NOT NULL,
  ext_id TEXT NOT NULL DEFAULT '',
  name TEXT NOT NULL DEFAULT '',
  instruction TEXT NOT NULL DEFAULT '',
  section_type TEXT NOT NULL DEFAULT 'ONLINE',
  total_marks REAL NOT NULL DEFAULT 0,
  max_questions INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS questions (
  id SERIAL PRIMARY KEY,
  assessment_id TEXT NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  group_id INTEGER REFERENCES groups(id) ON DELETE CASCADE,
  section_id INTEGER REFERENCES sections(id) ON DELETE CASCADE,
  seq INTEGER NOT NULL DEFAULT 0,
  ext_id TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL DEFAULT 'MCQ',
  comprehension_id TEXT NOT NULL DEFAULT '',
  laq_id TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  hint TEXT NOT NULL DEFAULT '',
  marks REAL NOT NULL DEFAULT 1,
  negative_marks REAL NOT NULL DEFAULT 0,
  mandatory INTEGER NOT NULL DEFAULT 0,
  max_time INTEGER NOT NULL DEFAULT 0,
  replays INTEGER NOT NULL DEFAULT 0,
  meta TEXT NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS question_languages (
  id SERIAL PRIMARY KEY,
  question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  lang_id INTEGER NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  hint TEXT NOT NULL DEFAULT '',
  UNIQUE (question_id, lang_id)
);

CREATE TABLE IF NOT EXISTS options (
  id SERIAL PRIMARY KEY,
  question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  ext_id TEXT NOT NULL DEFAULT '',
  seq INTEGER NOT NULL DEFAULT 0,
  body TEXT NOT NULL DEFAULT '',
  correct INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS option_languages (
  id SERIAL PRIMARY KEY,
  option_id INTEGER NOT NULL REFERENCES options(id) ON DELETE CASCADE,
  lang_id INTEGER NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  UNIQUE (option_id, lang_id)
);

CREATE TABLE IF NOT EXISTS comprehensions (
  id SERIAL PRIMARY KEY,
  assessment_id TEXT NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  ext_id TEXT NOT NULL DEFAULT '',
  kind TEXT NOT NULL DEFAULT 'comprehension',
  body TEXT NOT NULL DEFAULT '',
  meta TEXT NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS candidates (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL DEFAULT '',
  login TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL DEFAULT '',
  name TEXT NOT NULL DEFAULT '',
  system_name TEXT NOT NULL DEFAULT '',
  group_id TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  photo TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL,
  last_login_at TEXT
);

CREATE TABLE IF NOT EXISTS candidate_groups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS candidate_group_members (
  candidate_id TEXT NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  group_id TEXT NOT NULL REFERENCES candidate_groups(id) ON DELETE CASCADE,
  PRIMARY KEY (candidate_id, group_id)
);

CREATE TABLE IF NOT EXISTS assessment_candidate_groups (
  assessment_id TEXT NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  group_id TEXT NOT NULL,
  PRIMARY KEY (assessment_id, group_id)
);

CREATE TABLE IF NOT EXISTS attempts (
  id SERIAL PRIMARY KEY,
  assessment_id TEXT NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  candidate_id TEXT NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  attempt_no INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'in_progress',
  started_at TEXT NOT NULL,
  last_seen_at TEXT,
  submitted_at TEXT,
  current_group INTEGER NOT NULL DEFAULT 0,
  current_section INTEGER NOT NULL DEFAULT 0,
  current_question INTEGER NOT NULL DEFAULT 0,
  answered INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 0,
  score REAL NOT NULL DEFAULT 0,
  max_score REAL NOT NULL DEFAULT 0,
  percentage REAL NOT NULL DEFAULT 0,
  client_score REAL,
  fullscreen_seconds INTEGER NOT NULL DEFAULT 0,
  fullscreen_toggle_count INTEGER NOT NULL DEFAULT 0,
  state_json TEXT,
  ip TEXT NOT NULL DEFAULT '',
  user_agent TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS responses (
  id SERIAL PRIMARY KEY,
  attempt_id INTEGER NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  ext_id TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'notanswered',
  selected TEXT NOT NULL DEFAULT '',
  answer TEXT NOT NULL DEFAULT '',
  marks REAL,
  time_spent INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL,
  UNIQUE (attempt_id, question_id)
);

CREATE TABLE IF NOT EXISTS audit_log (
  id SERIAL PRIMARY KEY,
  attempt_id INTEGER,
  candidate_id TEXT,
  event TEXT NOT NULL DEFAULT '',
  detail TEXT NOT NULL DEFAULT '',
  ip TEXT NOT NULL DEFAULT '',
  at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS feedback (
  id SERIAL PRIMARY KEY,
  attempt_id INTEGER REFERENCES attempts(id) ON DELETE CASCADE,
  candidate_id TEXT,
  payload TEXT NOT NULL DEFAULT '{}',
  rating REAL,
  submitted_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  kind TEXT NOT NULL,
  subject_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_questions_assessment ON questions(assessment_id);
CREATE INDEX IF NOT EXISTS idx_questions_section ON questions(section_id);
CREATE INDEX IF NOT EXISTS idx_question_languages_question ON question_languages(question_id);
CREATE INDEX IF NOT EXISTS idx_option_languages_option ON option_languages(option_id);
CREATE INDEX IF NOT EXISTS idx_assessment_languages_assessment ON assessment_languages(assessment_id);
CREATE INDEX IF NOT EXISTS idx_candidate_group_members_group ON candidate_group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_responses_attempt ON responses(attempt_id);
CREATE INDEX IF NOT EXISTS idx_attempts_assessment ON attempts(assessment_id);
CREATE INDEX IF NOT EXISTS idx_attempts_candidate ON attempts(candidate_id);
CREATE INDEX IF NOT EXISTS idx_audit_attempt ON audit_log(attempt_id);
CREATE INDEX IF NOT EXISTS idx_feedback_attempt ON feedback(attempt_id);
`;

/** Resolved for the active backend; callers only ever import `SCHEMA_SQL`. */
export const SCHEMA_SQL = usePostgres ? PG_SCHEMA_SQL : SQLITE_SCHEMA_SQL;
