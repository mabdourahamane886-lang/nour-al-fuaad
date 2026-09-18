-- Tables de l'espace étudiant
CREATE TABLE public.student_profiles (
  user_id uuid PRIMARY KEY,
  full_name text,
  whatsapp text,
  level text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.student_courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  subject text,
  description text,
  level text,
  schedule text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.student_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  course_id uuid NOT NULL REFERENCES public.student_courses(id) ON DELETE CASCADE,
  inscription_id uuid REFERENCES public.inscriptions(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'active',
  enrolled_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX student_enrollments_user_course_idx ON public.student_enrollments (user_id, course_id);

CREATE TABLE public.student_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  course_id uuid NOT NULL REFERENCES public.student_courses(id) ON DELETE CASCADE,
  progress integer NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  last_activity_at timestamptz,
  teacher_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.quran_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  surah_number integer NOT NULL,
  surah_name text,
  memorization_percent integer NOT NULL DEFAULT 0 CHECK (memorization_percent BETWEEN 0 AND 100),
  revision_percent integer NOT NULL DEFAULT 0 CHECK (revision_percent BETWEEN 0 AND 100),
  teacher_note text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.student_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  subject text,
  title text NOT NULL,
  score integer,
  max_score integer,
  assessed_at timestamptz NOT NULL DEFAULT now(),
  teacher_note text
);

CREATE TABLE public.student_attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  course_id uuid REFERENCES public.student_courses(id) ON DELETE SET NULL,
  session_date date NOT NULL,
  status text NOT NULL DEFAULT 'present',
  notes text
);

CREATE TABLE public.student_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  message text,
  type text NOT NULL DEFAULT 'info',
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.student_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  resource_type text NOT NULL DEFAULT 'link',
  url text NOT NULL,
  course_id uuid REFERENCES public.student_courses(id) ON DELETE SET NULL,
  is_public boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Liaison dossier d'inscription <-> compte étudiant
ALTER TABLE public.inscriptions ADD COLUMN IF NOT EXISTS user_id uuid;

-- Accès : lecture/écriture uniquement via le backend (service_role) ; les clients passent par des fonctions serveur
GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_profiles TO service_role;
GRANT SELECT ON public.student_courses TO authenticated;
GRANT ALL ON public.student_courses TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_enrollments TO authenticated;
GRANT ALL ON public.student_enrollments TO service_role;
GRANT SELECT ON public.student_progress TO authenticated;
GRANT ALL ON public.student_progress TO service_role;
GRANT SELECT ON public.quran_progress TO authenticated;
GRANT ALL ON public.quran_progress TO service_role;
GRANT SELECT ON public.student_assessments TO authenticated;
GRANT ALL ON public.student_assessments TO service_role;
GRANT SELECT ON public.student_attendance TO authenticated;
GRANT ALL ON public.student_attendance TO service_role;
GRANT SELECT, UPDATE ON public.student_notifications TO authenticated;
GRANT ALL ON public.student_notifications TO service_role;
GRANT SELECT ON public.student_resources TO authenticated;
GRANT ALL ON public.student_resources TO service_role;

ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quran_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own profile" ON public.student_profiles FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Authenticated read courses" ON public.student_courses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users manage own enrollments" ON public.student_enrollments FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users read own progress" ON public.student_progress FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users read own quran progress" ON public.quran_progress FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users read own assessments" ON public.student_assessments FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users read own attendance" ON public.student_attendance FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users read own notifications" ON public.student_notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users update own notifications" ON public.student_notifications FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Authenticated read resources" ON public.student_resources FOR SELECT TO authenticated USING (is_public = true OR course_id IS NULL OR EXISTS (SELECT 1 FROM public.student_enrollments e WHERE e.course_id = student_resources.course_id AND e.user_id = auth.uid()));

-- Triggers updated_at
CREATE TRIGGER student_profiles_touch_updated_at BEFORE UPDATE ON public.student_profiles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER student_progress_touch_updated_at BEFORE UPDATE ON public.student_progress FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER quran_progress_touch_updated_at BEFORE UPDATE ON public.quran_progress FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Cours par défaut (programmes du site)
INSERT INTO public.student_courses (slug, title, subject, description, level, schedule) VALUES
  ('memorisation-coran', 'Mémorisation du Coran', 'Coran', 'Programme de mémorisation guidée avec révision hebdomadaire.', 'Débutant', 'Lundi, mercredi, vendredi à 15h30'),
  ('tajwid', 'Tajwid', 'Coran', 'Règles de récitation du Coran.', 'Tous niveaux', 'Lundi, mercredi, vendredi à 15h30'),
  ('hadiths', 'Hadiths', 'Hadith', 'Étude des hadiths du Prophète (paix sur lui).', 'Tous niveaux', 'Lundi, mercredi, vendredi à 15h30'),
  ('fiqh', 'Fiqh', 'Fiqh', 'Bases de la jurisprudence islamique.', 'Tous niveaux', 'Lundi, mercredi, vendredi à 15h30'),
  ('invocations', 'Invocations', 'Adhkar', 'Invocations quotidiennes et leur sens.', 'Débutant', 'Lundi, mercredi, vendredi à 15h30'),
  ('langue-arabe', 'Langue arabe', 'Arabe', 'Apprentissage de la langue arabe (lecture, écriture, grammaire).', 'Débutant', 'Lundi, mercredi, vendredi à 15h30')
ON CONFLICT (slug) DO NOTHING;