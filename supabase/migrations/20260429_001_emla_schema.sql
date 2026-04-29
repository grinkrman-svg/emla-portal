-- ═══════════════════════════════════════════════════
-- EMLA Portal — Supabase schema migration
-- Created: 2026-04-29
-- Author: Phase 0 of EMLA expansion plan
-- Project: zqfqqwdfndkipnklajdf (TrendDrop main)
-- ═══════════════════════════════════════════════════

-- 1. Schema
CREATE SCHEMA IF NOT EXISTS emla;
COMMENT ON SCHEMA emla IS 'EMLA Portal — clinical reference data (drugs, protocols, calculators) for SOR Chojnice';

-- 2. Drugs (extends data/leki_sor.json with verification metadata)
CREATE TABLE IF NOT EXISTS emla.drugs (
  id text PRIMARY KEY,                    -- e.g. f001, matches leki_sor.json
  inn text NOT NULL,                      -- INN (international nonproprietary name)
  pl_name text NOT NULL,                  -- Polish trade/handlowa nazwa
  pl_aliases jsonb DEFAULT '[]'::jsonb,   -- alternative names array
  category text NOT NULL,                 -- antybiotyki | wazopresory | RSI_sedacja | ...
  form text,                              -- ampułka | flakon | tabl | inhal
  dose_amp text,                          -- e.g. "100mg/2ml"
  routes jsonb DEFAULT '[]'::jsonb,       -- ["IV","IM","PO","SC","INH","SL","PR","TOP"]
  default_route text,
  is_mix_carrier bool DEFAULT false,      -- can be a carrier (NaCl 0.9%, Glu 5%)
  typical_adult_dose text,                -- free-text adult dose
  pediatric_dose text,                    -- mg/kg ranges + age caveats
  renal_adjustment text,                  -- by GFR
  hepatic_adjustment text,                -- Child-Pugh adjustments
  pregnancy_category text,                -- A | B | C | D | X | NA
  contraindications text,
  interactions jsonb DEFAULT '[]'::jsonb, -- [{drug_id, severity, mechanism}]
  source_ref text,                        -- e.g. "URPL CPL 2024-03-15"
  source_url text,                        -- direct link to CPL/SmPC
  verified bool DEFAULT false,
  verified_by text,                       -- who verified (Roman, ...)
  verified_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
COMMENT ON TABLE emla.drugs IS 'Drug reference for SOR — every entry MUST link to URPL CPL or equivalent source';

-- 3. Protocols (clinical guidelines algorithms)
CREATE TABLE IF NOT EXISTS emla.protocols (
  id text PRIMARY KEY,                    -- e.g. ALS-2021
  code text UNIQUE NOT NULL,
  category text NOT NULL,                 -- resuscytacja | kardiologia | sepsa | wstrzas | trauma | ...
  title_pl text NOT NULL,
  short_description text,
  source text NOT NULL,                   -- "ERC" | "ESC" | "ATLS" | "SSC" | "PALS" | "GINA" | "GOLD"
  source_year int,
  source_version text,                    -- e.g. "2021", "10ed", "2023"
  source_url text,
  doi text,                               -- DOI of guideline paper
  valid_from date,
  valid_until date,                       -- when next update expected
  content_md text,                        -- full markdown text
  algorithm_steps jsonb,                  -- structured steps for UI rendering
  related_drugs jsonb DEFAULT '[]'::jsonb,    -- list of drug IDs from emla.drugs
  related_calculators jsonb DEFAULT '[]'::jsonb,  -- e.g. ["WELLS_PE","qSOFA"]
  attachments jsonb DEFAULT '[]'::jsonb,  -- PDFs/images links
  published_pl bool DEFAULT true,         -- has Polish translation
  smoke_test_passed bool DEFAULT false,   -- doses cross-checked
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
COMMENT ON TABLE emla.protocols IS 'Clinical protocols — every entry MUST cite source guideline + version + valid_until';

-- 4. Calculators (formal definitions; UI keeps actual UI state)
CREATE TABLE IF NOT EXISTS emla.calculators (
  id text PRIMARY KEY,
  code text UNIQUE NOT NULL,              -- GCS | WELLS_PE | WELLS_DVT | qSOFA | NEWS2 | ...
  category text,                          -- triage | sepsis | thrombosis | trauma | ...
  title_pl text NOT NULL,
  formula_description text,
  inputs jsonb,                           -- [{name, type, range, unit, label_pl}]
  output_interpretation jsonb,            -- {"0-3":"low","4-7":"intermediate","8+":"high"}
  source_paper text,                      -- e.g. "Wells PS et al, Thromb Haemost 2000"
  source_url text,
  doi text,
  smoke_test_passed bool DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 5. Calculator history (per-doctor, per-patient — bez PESEL)
CREATE TABLE IF NOT EXISTS emla.calculator_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  calc_code text REFERENCES emla.calculators(code) ON DELETE CASCADE,
  patient_number text,                    -- hospital number, NEVER PESEL
  inputs jsonb NOT NULL,
  result_value text,
  result_interpretation text,
  doctor_id uuid,                         -- references auth.users.id
  calculated_at timestamptz DEFAULT now()
);

-- 6. Guidelines version registry (auto-reminder system)
CREATE TABLE IF NOT EXISTS emla.guidelines_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL,                   -- ERC | ESC | ATLS | SSC | PALS | ...
  version text NOT NULL,
  released_date date,
  next_review_due date,                   -- when we should check for updates
  url text,
  notes text,
  is_current bool DEFAULT true,
  last_checked_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- 7. Indexes
CREATE INDEX IF NOT EXISTS idx_emla_drugs_category ON emla.drugs(category);
CREATE INDEX IF NOT EXISTS idx_emla_drugs_verified ON emla.drugs(verified) WHERE verified = true;
CREATE INDEX IF NOT EXISTS idx_emla_drugs_inn_lower ON emla.drugs(LOWER(inn));
CREATE INDEX IF NOT EXISTS idx_emla_drugs_pl_name_lower ON emla.drugs(LOWER(pl_name));
CREATE INDEX IF NOT EXISTS idx_emla_protocols_category ON emla.protocols(category);
CREATE INDEX IF NOT EXISTS idx_emla_protocols_source ON emla.protocols(source, source_year);
CREATE INDEX IF NOT EXISTS idx_emla_protocols_smoke ON emla.protocols(smoke_test_passed);
CREATE INDEX IF NOT EXISTS idx_emla_calc_category ON emla.calculators(category);
CREATE INDEX IF NOT EXISTS idx_emla_calc_history_doctor ON emla.calculator_history(doctor_id, calculated_at DESC);

-- 8. updated_at trigger
CREATE OR REPLACE FUNCTION emla.touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_drugs_touch BEFORE UPDATE ON emla.drugs
  FOR EACH ROW EXECUTE FUNCTION emla.touch_updated_at();
CREATE TRIGGER trg_protocols_touch BEFORE UPDATE ON emla.protocols
  FOR EACH ROW EXECUTE FUNCTION emla.touch_updated_at();
CREATE TRIGGER trg_calculators_touch BEFORE UPDATE ON emla.calculators
  FOR EACH ROW EXECUTE FUNCTION emla.touch_updated_at();

-- 9. RLS — public read on reference data; modifications via service_role only
ALTER TABLE emla.drugs ENABLE ROW LEVEL SECURITY;
ALTER TABLE emla.protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE emla.calculators ENABLE ROW LEVEL SECURITY;
ALTER TABLE emla.calculator_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE emla.guidelines_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_drugs" ON emla.drugs FOR SELECT USING (true);
CREATE POLICY "public_read_protocols" ON emla.protocols FOR SELECT USING (true);
CREATE POLICY "public_read_calculators" ON emla.calculators FOR SELECT USING (true);
CREATE POLICY "public_read_guidelines" ON emla.guidelines_versions FOR SELECT USING (true);

-- Calculator history: only owner can read/write own rows
CREATE POLICY "doctor_owns_calc_history" ON emla.calculator_history
  FOR ALL USING (auth.uid() = doctor_id) WITH CHECK (auth.uid() = doctor_id);

-- 10. Expose schema to PostgREST (Supabase API)
GRANT USAGE ON SCHEMA emla TO anon, authenticated, service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA emla TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA emla TO service_role;
GRANT INSERT, UPDATE ON emla.calculator_history TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA emla GRANT SELECT ON TABLES TO anon, authenticated;

-- 11. Seed guidelines_versions registry (so we know what's current)
INSERT INTO emla.guidelines_versions (source, version, released_date, next_review_due, url, notes, is_current) VALUES
  ('ERC',  '2021', '2021-03-25', '2026-12-31', 'https://www.erc.edu/guidelines',          'European Resuscitation Council — 5-year cycle, next due 2026', true),
  ('ESC',  '2023', '2023-08-25', '2026-08-25', 'https://www.escardio.org/Guidelines',      'ESC ACS guidelines 2023; ESC AF 2024 supersedes earlier', true),
  ('ATLS', '10ed', '2018-01-01', '2026-12-31', 'https://www.facs.org/quality-programs/trauma/atls', '10th edition; 11ed expected ~2026', true),
  ('SSC',  '2021', '2021-10-04', '2026-10-04', 'https://www.sccm.org/SurvivingSepsisCampaign', 'Surviving Sepsis Campaign — 5-year cycle', true),
  ('ESO',  '2022', '2022-05-12', '2027-05-12', 'https://eso-stroke.org/guidelines/',       'European Stroke Organisation — stroke management', true),
  ('PALS', '2020', '2020-10-21', '2026-10-21', 'https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines', 'AHA Pediatric Advanced Life Support', true),
  ('GINA', '2024', '2024-05-01', '2026-05-01', 'https://ginasthma.org/2024-report/',       'Global Initiative for Asthma — annual update', true),
  ('GOLD', '2025', '2024-11-01', '2026-11-01', 'https://goldcopd.org/2025-gold-report/',   'Global Initiative for COPD — annual update', true),
  ('URPL', 'live', NULL, NULL, 'https://rejestrymedyczne.ezdrowie.gov.pl/',                 'Polish Rejestr Produktów Leczniczych — query per drug', true);

-- 12. Verification
DO $$
BEGIN
  RAISE NOTICE 'EMLA schema migration complete. Tables: drugs, protocols, calculators, calculator_history, guidelines_versions.';
END $$;

-- ═══════════════════════════════════════════════════
-- ROLLBACK (run only if needed):
-- DROP SCHEMA emla CASCADE;
-- ═══════════════════════════════════════════════════
