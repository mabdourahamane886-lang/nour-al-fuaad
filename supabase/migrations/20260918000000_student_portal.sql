-- Nouroul Foua'ad — Student portal foundation

ALTER TABLE public.inscriptions
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS inscriptions_user_id_idx ON public.inscriptions(user_id);

CREATE TABLE IF NOT EXISTS public.student_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  whatsapp text,
  level text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.student_courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  subject text NOT NULL,
  description text NOT NULL DEFAULT '',
  level text NOT NULL DEFAULT 'Tous niveaux',
  schedule text NOT NULL DEFAULT 'Selon groupe',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.student_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.student_courses(id) ON DELETE CASCADE,
  inscription_id uuid REFERENCES public.inscriptions(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','completed','paused','cancelled')),
  enrolled_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id)
);

CREATE TABLE IF NOT EXISTS public.student_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.student_courses(id) ON DELETE CASCADE,
  progress numeric NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  last_activity_at timestamptz,
  teacher_note text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id)
);

CREATE TABLE IF NOT EXISTS public.quran_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  surah_number integer NOT NULL CHECK (surah_number BETWEEN 1 AND 114),
  surah_name text NOT NULL,
  memorization_percent numeric NOT NULL DEFAULT 0 CHECK (memorization_percent BETWEEN 0 AND 100),
  revision_percent numeric NOT NULL DEFAULT 0 CHECK (revision_percent BETWEEN 0 AND 100),
  teacher_note text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, surah_number)
);

CREATE TABLE IF NOT EXISTS public.student_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject text NOT NULL,
  title text NOT NULL,
  score numeric NOT NULL CHECK (score >= 0),
  max_score numeric NOT NULL CHECK (max_score > 0),
  assessed_at timestamptz NOT NULL DEFAULT now(),
  teacher_note text
);

CREATE TABLE IF NOT EXISTS public.student_attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid REFERENCES public.student_courses(id) ON DELETE SET NULL,
  session_date timestamptz NOT NULL,
  status text NOT NULL CHECK (status IN ('present','late','absent','excused')),
  notes text,
  UNIQUE(user_id, course_id, session_date)
);

CREATE TABLE IF NOT EXISTS public.student_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info' CHECK (type IN ('info','success','warning','course','payment')),
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.student_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES public.student_courses(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  resource_type text NOT NULL DEFAULT 'pdf' CHECK (resource_type IN ('pdf','video','audio','link','exercise')),
  url text NOT NULL,
  is_public boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.inscriptions TO authenticated;

DROP POLICY IF EXISTS "Students read own inscription" ON public.inscriptions;
CREATE POLICY "Students read own inscription" ON public.inscriptions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

GRANT SELECT, INSERT, UPDATE ON public.student_profiles TO authenticated;
GRANT SELECT ON public.student_courses TO authenticated;
GRANT SELECT ON public.student_enrollments TO authenticated;
GRANT SELECT ON public.student_progress TO authenticated;
GRANT SELECT ON public.quran_progress TO authenticated;
GRANT SELECT ON public.student_assessments TO authenticated;
GRANT SELECT ON public.student_attendance TO authenticated;
GRANT SELECT ON public.student_notifications TO authenticated;
GRANT SELECT ON public.student_resources TO authenticated;
GRANT ALL ON public.student_profiles, public.student_courses, public.student_enrollments,
  public.student_progress, public.quran_progress, public.student_assessments,
  public.student_attendance, public.student_notifications, public.student_resources TO service_role;

ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quran_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_resources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students read own profile" ON public.student_profiles;
DROP POLICY IF EXISTS "Students insert own profile" ON public.student_profiles;
DROP POLICY IF EXISTS "Students update own profile" ON public.student_profiles;
CREATE POLICY "Students read own profile" ON public.student_profiles
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Students insert own profile" ON public.student_profiles
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Students update own profile" ON public.student_profiles
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Students read active courses" ON public.student_courses;
CREATE POLICY "Students read active courses" ON public.student_courses
  FOR SELECT TO authenticated USING (active = true OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Students read own enrollments" ON public.student_enrollments;
CREATE POLICY "Students read own enrollments" ON public.student_enrollments
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Students read own progress" ON public.student_progress;
CREATE POLICY "Students read own progress" ON public.student_progress
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Students read own quran progress" ON public.quran_progress;
CREATE POLICY "Students read own quran progress" ON public.quran_progress
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Students read own assessments" ON public.student_assessments;
CREATE POLICY "Students read own assessments" ON public.student_assessments
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Students read own attendance" ON public.student_attendance;
CREATE POLICY "Students read own attendance" ON public.student_attendance
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Students read own notifications" ON public.student_notifications;
CREATE POLICY "Students read own notifications" ON public.student_notifications
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Students read resources" ON public.student_resources;
CREATE POLICY "Students read resources" ON public.student_resources
  FOR SELECT TO authenticated
  USING (
    is_public = true
    OR public.has_role(auth.uid(), 'admin')
    OR EXISTS (
      SELECT 1 FROM public.student_enrollments e
      WHERE e.user_id = auth.uid() AND e.status = 'active' AND e.course_id = student_resources.course_id
    )
  );

INSERT INTO public.student_courses (slug, title, subject, description, level, schedule)
VALUES
  ('memorisation-coran', 'Mémorisation du Coran', 'Coran', 'Mémorisation progressive, révisions et accompagnement personnalisé.', 'Débutant à avancé', 'Lundi · Mercredi · Vendredi — 15h30'),
  ('tajwid', 'Tajwid', 'Tajwid', 'Apprentissage des règles et correction de la récitation.', 'Tous niveaux', 'Selon groupe'),
  ('hadiths', 'Hadiths', 'Hadith', 'Étude et compréhension des hadiths sélectionnés.', 'Tous niveaux', 'Selon groupe'),
  ('fiqh', 'Fiqh', 'Fiqh', 'Sciences de la pratique religieuse et situations du quotidien.', 'Tous niveaux', 'Selon groupe'),
  ('invocations', 'Invocations', 'Adhkar', 'Mémorisation et mise en pratique des invocations authentiques.', 'Tous niveaux', 'Selon groupe'),
  ('langue-arabe', 'Langue arabe', 'Arabe', 'Lecture, vocabulaire, compréhension et expression en arabe.', 'Débutant à avancé', 'Selon groupe')
ON CONFLICT (slug) DO NOTHING;

CREATE OR REPLACE FUNCTION public.touch_student_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS student_profiles_touch_updated_at ON public.student_profiles;
CREATE TRIGGER student_profiles_touch_updated_at BEFORE UPDATE ON public.student_profiles
FOR EACH ROW EXECUTE FUNCTION public.touch_student_updated_at();

DROP TRIGGER IF EXISTS student_progress_touch_updated_at ON public.student_progress;
CREATE TRIGGER student_progress_touch_updated_at BEFORE UPDATE ON public.student_progress
FOR EACH ROW EXECUTE FUNCTION public.touch_student_updated_at();

DROP TRIGGER IF EXISTS student_courses_touch_updated_at ON public.student_courses;
CREATE TRIGGER student_courses_touch_updated_at BEFORE UPDATE ON public.student_courses
FOR EACH ROW EXECUTE FUNCTION public.touch_student_updated_at();
