-- =============================================================================
-- Migration: Add Program Coordinator fields + Program-Laboratory linking
-- Run this in Supabase SQL Editor (safe to re-run — uses IF NOT EXISTS guards)
-- =============================================================================

-- ── 1. Add coordinator fields to programs ────────────────────────────────────
ALTER TABLE programs
  ADD COLUMN IF NOT EXISTS coordinator_name_en TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS coordinator_name_ar TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS coordinator_email   TEXT NOT NULL DEFAULT '';


-- ── 2. laboratories.program_ids already exists as JSONB array ───────────────
-- (defined in original schema) — this lets one lab be associated with
-- multiple programs. No migration needed for this column.


-- ── 3. Seed example coordinator data for existing programs ──────────────────
UPDATE programs SET
  coordinator_name_en = 'Dr. Program Coordinator',
  coordinator_name_ar = 'د. منسق البرنامج',
  coordinator_email   = 'coordinator.' || slug || '@nmu.edu.eg'
WHERE coordinator_name_en = '';


-- ── 4. Seed a few example laboratories linked to programs ───────────────────
-- (Only runs if laboratories table is empty, to avoid duplicating data)
DO $$
DECLARE
  aerospace_id UUID;
  civil_id UUID;
  mech_id UUID;
  lab_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO lab_count FROM laboratories;

  IF lab_count = 0 THEN
    SELECT id INTO aerospace_id FROM programs WHERE slug = 'aerospace' LIMIT 1;
    SELECT id INTO civil_id     FROM programs WHERE slug = 'civil'     LIMIT 1;
    SELECT id INTO mech_id      FROM programs WHERE slug = 'mechatronics' LIMIT 1;

    INSERT INTO laboratories (name_en, name_ar, description_en, description_ar, department_id, program_ids, is_active)
    VALUES
      ('Structures & Materials Lab', 'مختبر الإنشاءات والمواد',
       'Testing facility for structural integrity and material properties.',
       'منشأة لاختبار السلامة الإنشائية وخصائص المواد.',
       'civil', to_jsonb(ARRAY[civil_id::text]), TRUE),

      ('Fluid Dynamics Lab', 'مختبر ديناميكا السوائل',
       'Wind tunnel and CFD simulation facilities.',
       'نفق هوائي ومرافق محاكاة ديناميكا السوائل الحاسوبية.',
       'aerospace', to_jsonb(ARRAY[aerospace_id::text]), TRUE),

      ('CAD/CAM Lab', 'مختبر التصميم والتصنيع بالحاسوب',
       'Computer-aided design and manufacturing workstations.',
       'محطات عمل للتصميم والتصنيع بمساعدة الحاسوب.',
       'mechatronics', to_jsonb(ARRAY[mech_id::text, aerospace_id::text, civil_id::text]), TRUE),

      ('Control Systems Lab', 'مختبر أنظمة التحكم',
       'Robotics and automation control system testing.',
       'اختبار أنظمة التحكم في الروبوتات والأتمتة.',
       'mechatronics', to_jsonb(ARRAY[mech_id::text]), TRUE);
  END IF;
END $$;
