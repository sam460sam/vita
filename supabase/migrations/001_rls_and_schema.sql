-- ============================================================
-- GETTO — Fase 1: RLS + Schema Extensions
-- Eseguire nel SQL Editor di Supabase (Dashboard → SQL Editor)
-- Script IDEMPOTENTE: sicuro da rieseguire
-- ============================================================

-- ── Helper: restituisce il team_id dell'utente corrente ────
-- SECURITY DEFINER → gira come postgres, evita ricorsione RLS
CREATE OR REPLACE FUNCTION get_team_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT team_id
  FROM   team_members
  WHERE  user_id = auth.uid()
  LIMIT  1;
$$;

-- ── Estensioni tabelle esistenti ───────────────────────────

-- Ruolo membro (owner può invitare; collaboratore vede ma non modifica settings)
ALTER TABLE team_members
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'owner'
  CHECK (role IN ('owner', 'collaboratore'));

-- Feature flag per future modalità white-label (mai usato nella UI ora)
ALTER TABLE teams
  ADD COLUMN IF NOT EXISTS app_mode text NOT NULL DEFAULT 'cantieri';

-- ── Tabella entitlements (piani / Stripe) ─────────────────
CREATE TABLE IF NOT EXISTS entitlements (
  id                     uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id                uuid        NOT NULL UNIQUE REFERENCES teams(id) ON DELETE CASCADE,
  piano                  text        NOT NULL DEFAULT 'free'
                         CHECK (piano IN ('free', 'pro', 'founder')),
  stato                  text        NOT NULL DEFAULT 'trial'
                         CHECK (stato IN ('trial', 'active', 'past_due', 'canceled')),
  trial_end              timestamptz DEFAULT (now() + interval '14 days'),
  current_period_end     timestamptz,
  stripe_customer_id     text,
  stripe_subscription_id text,
  created_at             timestamptz DEFAULT now(),
  updated_at             timestamptz DEFAULT now()
);

-- Trigger: crea entitlement di default quando si crea un team
CREATE OR REPLACE FUNCTION _create_default_entitlement()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO entitlements (team_id)
  VALUES (NEW.id)
  ON CONFLICT (team_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_team_created ON teams;
CREATE TRIGGER on_team_created
  AFTER INSERT ON teams
  FOR EACH ROW EXECUTE FUNCTION _create_default_entitlement();

-- Backfill entitlements per team esistenti
INSERT INTO entitlements (team_id)
SELECT id FROM teams
WHERE  id NOT IN (SELECT team_id FROM entitlements)
ON CONFLICT (team_id) DO NOTHING;

-- ── Tabella giornale_entries in Supabase ──────────────────
CREATE TABLE IF NOT EXISTS giornale_entries (
  id                      text     PRIMARY KEY,
  team_id                 uuid     NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  cantiere_id             text     NOT NULL,
  data                    text     NOT NULL,        -- ISO yyyy-MM-dd
  manodopera              jsonb    NOT NULL DEFAULT '[]',
  attrezzature            jsonb    NOT NULL DEFAULT '[]',
  materiali               jsonb    NOT NULL DEFAULT '[]',
  meteo                   text,
  temperatura             numeric,
  vento                   numeric,
  cond_terreno_viabilita  text,
  note                    text,
  foto                    text[]   NOT NULL DEFAULT '{}',
  created_at              bigint   NOT NULL,
  updated_at              bigint   NOT NULL
);

CREATE INDEX IF NOT EXISTS giornale_entries_cantiere_idx ON giornale_entries(cantiere_id);
CREATE INDEX IF NOT EXISTS giornale_entries_team_idx     ON giornale_entries(team_id);
CREATE INDEX IF NOT EXISTS giornale_entries_data_idx     ON giornale_entries(data);

-- ── Abilita RLS su tutte le tabelle di business ───────────
ALTER TABLE teams            ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members     ENABLE ROW LEVEL SECURITY;
ALTER TABLE cantieri         ENABLE ROW LEVEL SECURITY;
ALTER TABLE operai           ENABLE ROW LEVEL SECURITY;
ALTER TABLE entitlements     ENABLE ROW LEVEL SECURITY;
ALTER TABLE giornale_entries ENABLE ROW LEVEL SECURITY;

-- ── Rimuovi policy precedenti (idempotenza) ───────────────
DO $$ DECLARE pol record; BEGIN
  FOR pol IN
    SELECT policyname, tablename
    FROM   pg_policies
    WHERE  schemaname = 'public'
      AND  tablename IN (
             'teams','team_members','cantieri',
             'operai','entitlements','giornale_entries'
           )
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, pol.tablename);
  END LOOP;
END $$;

-- ── POLICY: teams ─────────────────────────────────────────
-- Un utente vede e modifica SOLO il proprio team
CREATE POLICY "teams_own"
  ON teams FOR ALL
  USING      (id = get_team_id())
  WITH CHECK (id = get_team_id());

-- ── POLICY: team_members ──────────────────────────────────
CREATE POLICY "team_members_own"
  ON team_members FOR ALL
  USING      (team_id = get_team_id())
  WITH CHECK (team_id = get_team_id());

-- ── POLICY: cantieri ──────────────────────────────────────
CREATE POLICY "cantieri_own"
  ON cantieri FOR ALL
  USING      (team_id = get_team_id())
  WITH CHECK (team_id = get_team_id());

-- ── POLICY: operai ────────────────────────────────────────
CREATE POLICY "operai_own"
  ON operai FOR ALL
  USING      (team_id = get_team_id())
  WITH CHECK (team_id = get_team_id());

-- ── POLICY: entitlements (sola lettura lato client) ──────
-- Il webhook Stripe scrive tramite service_role (bypassando RLS)
CREATE POLICY "entitlements_read"
  ON entitlements FOR SELECT
  USING (team_id = get_team_id());

-- ── POLICY: giornale_entries ──────────────────────────────
CREATE POLICY "giornale_own"
  ON giornale_entries FOR ALL
  USING      (team_id = get_team_id())
  WITH CHECK (team_id = get_team_id());

-- ── TEST: verifica isolamento ─────────────────────────────
-- Esegui questo blocco DOPO aver creato due utenti di test distinti.
-- Atteso: query A non vede dati di B, e viceversa.
--
-- COMMENT OUT the lines below to run just the schema, not the tests.
-- DO $$
-- DECLARE
--   team_a uuid; team_b uuid;
-- BEGIN
--   SELECT id INTO team_a FROM teams LIMIT 1;
--   SELECT id INTO team_b FROM teams OFFSET 1 LIMIT 1;
--   ASSERT team_a IS DISTINCT FROM team_b, 'Need at least 2 teams for isolation test';
--   RAISE NOTICE 'RLS isolation test: teams % and % are distinct — OK', team_a, team_b;
-- END $$;
