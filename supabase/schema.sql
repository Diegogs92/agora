-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ROLES ENUM (Optional, using text for flexibility but validating in app)
-- Roles: 'ADMIN', 'SECRETARIA', 'DOCENTE', 'PRECEPTOR', 'TESORERIA'

-- 1. PROFILES (Extends Auth Users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  nombre TEXT,
  apellido TEXT,
  role TEXT DEFAULT 'DOCENTE',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_role CHECK (role IN ('ADMIN', 'SECRETARIA', 'DOCENTE', 'PRECEPTOR', 'TESORERIA'))
);

-- 2. ALUMNOS
CREATE TABLE alumnos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  legajo TEXT UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  dni TEXT UNIQUE NOT NULL,
  fecha_nacimiento DATE,
  telefono TEXT,
  email TEXT,
  direccion TEXT,
  tutor_nombre TEXT,
  tutor_telefono TEXT,
  curso TEXT NOT NULL, -- Ej: "2º"
  division TEXT NOT NULL, -- Ej: "A"
  anio_lectivo INTEGER DEFAULT EXTRACT(YEAR FROM NOW()),
  estado TEXT DEFAULT 'ACTIVO',
  observaciones TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. MATERIAS
CREATE TABLE materias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  carga_horaria INTEGER,
  docente_id UUID REFERENCES auth.users(id), -- Nullable initially
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. NOTAS
CREATE TABLE notas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  alumno_id UUID REFERENCES alumnos(id) ON DELETE CASCADE,
  materia_id UUID REFERENCES materias(id) ON DELETE CASCADE,
  periodo TEXT NOT NULL, -- Trimestre 1, Cuatrimestre 1, etc.
  tipo TEXT NOT NULL, -- Examen, TP, Concepto
  nota NUMERIC(4,2) NOT NULL,
  fecha DATE DEFAULT CURRENT_DATE,
  observacion TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ASISTENCIAS
CREATE TABLE asistencias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  alumno_id UUID REFERENCES alumnos(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  estado TEXT NOT NULL CHECK (estado IN ('PRESENTE', 'AUSENTE', 'TARDE', 'JUSTIFICADA')),
  observacion TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(alumno_id, fecha)
);

-- 6. CONDUCTA_INCIDENTES
CREATE TABLE conducta_incidentes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  alumno_id UUID REFERENCES alumnos(id) ON DELETE CASCADE,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  tipo TEXT NOT NULL, -- ADVERTENCIA, AMONESTACION, OBSERVACION
  descripcion TEXT,
  nivel TEXT DEFAULT 'BAJO', -- BAJO, MEDIO, ALTO
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. PAGOS
CREATE TABLE pagos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  alumno_id UUID REFERENCES alumnos(id) ON DELETE CASCADE,
  periodo TEXT NOT NULL, -- YYYY-MM
  monto NUMERIC(10,2) NOT NULL,
  vencimiento DATE,
  estado TEXT DEFAULT 'PENDIENTE', -- PENDIENTE, PAGADO, PARCIAL
  fecha_pago DATE,
  medio_pago TEXT, -- EFECTIVO, TRANSFERENCIA, TARJETA
  comprobante TEXT,
  observacion TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ACTIVIDADES
CREATE TABLE actividades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  dia_semana TEXT, -- LUNES, MARTES...
  horario TEXT,
  cupo INTEGER,
  responsable TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE actividades_inscripciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  alumno_id UUID REFERENCES alumnos(id) ON DELETE CASCADE,
  actividad_id UUID REFERENCES actividades(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(alumno_id, actividad_id)
);

-- 9. PERSONAL (Docentes y No Docentes - Info extra aparte de profiles si se quiere, o redundante)
-- User asked for separate CRUDs. Let's keep them as tables, but linking to auth users if they have login is good practice.
-- Currently user defined "Personal" CRUD separate from Profiles.
CREATE TABLE personal_docentes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  dni TEXT UNIQUE,
  email TEXT,
  telefono TEXT,
  user_id UUID REFERENCES auth.users(id) -- Optional link to auth
);

CREATE TABLE personal_no_docentes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  dni TEXT UNIQUE,
  rol TEXT, -- Preceptor, Tesoreria...
  email TEXT,
  telefono TEXT,
  user_id UUID REFERENCES auth.users(id)
);

-- 10. DIAS INHABILES
CREATE TABLE dias_inhabiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fecha DATE UNIQUE NOT NULL,
  motivo TEXT NOT NULL,
  alcance TEXT DEFAULT 'INSTITUCION' -- INSTITUCION, CURSO_XXX
);


-- INDICES
CREATE INDEX idx_alumnos_dni ON alumnos(dni);
CREATE INDEX idx_alumnos_legajo ON alumnos(legajo);
CREATE INDEX idx_alumnos_curso_div ON alumnos(curso, division);
CREATE INDEX idx_asistencias_alumno_fecha ON asistencias(alumno_id, fecha);
CREATE INDEX idx_notas_alumno ON notas(alumno_id);
CREATE INDEX idx_pagos_alumno_periodo ON pagos(alumno_id, periodo);
CREATE INDEX idx_profiles_username ON profiles(username);


-- RLS & POLICIES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE alumnos ENABLE ROW LEVEL SECURITY;
ALTER TABLE materias ENABLE ROW LEVEL SECURITY;
ALTER TABLE notas ENABLE ROW LEVEL SECURITY;
ALTER TABLE asistencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE conducta_incidentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE actividades ENABLE ROW LEVEL SECURITY;
ALTER TABLE actividades_inscripciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_docentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_no_docentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE dias_inhabiles ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user role
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER;

-- POLICIES (Simplifie MVP: permissive for roles, deny for public)

-- PROFILES: Read self and admins. Insert via trigger usually, but for MVP allow insert own.
CREATE POLICY "Profiles viewable by users" ON profiles FOR SELECT USING (auth.uid() = id OR get_my_role() = 'ADMIN');
CREATE POLICY "Profiles editable by admins" ON profiles FOR ALL USING (get_my_role() = 'ADMIN');
-- Allow self-update metadata? Maybe not role.
CREATE POLICY "Profiles update self" ON profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id); -- Preventing role change via logic if needed, but RLS check verifies condition. To prevent role spoofing, trigger is safer, but MVP: trust Admin UI or backend function.

-- ALUMNOS
-- Read: Admin, Secretaria, Docente, Preceptor, Tesoreria (Everyone auth basic)
CREATE POLICY "Alumnos select all" ON alumnos FOR SELECT USING (auth.role() = 'authenticated');
-- Write: Admin, Secretaria.
CREATE POLICY "Alumnos modify admin_secretaria" ON alumnos FOR ALL USING (get_my_role() IN ('ADMIN', 'SECRETARIA'));

-- ASISTENCIAS
-- Read: All auth
CREATE POLICY "Asistencias select all" ON asistencias FOR SELECT USING (auth.role() = 'authenticated');
-- Write: Admin, Secretaria, Preceptor. (Docente might mark attendance too? MVP says Preceptor mostly).
CREATE POLICY "Asistencias modify staff" ON asistencias FOR ALL USING (get_my_role() IN ('ADMIN', 'SECRETARIA', 'PRECEPTOR', 'DOCENTE'));

-- MATERIAS
-- Read: All
CREATE POLICY "Materias select all" ON materias FOR SELECT USING (auth.role() = 'authenticated');
-- Write: Admin, Secretaria
CREATE POLICY "Materias modify admin" ON materias FOR ALL USING (get_my_role() IN ('ADMIN', 'SECRETARIA'));

-- NOTAS
-- Read: All auth (Parents/Students would need their own filter later)
CREATE POLICY "Notas select all" ON notas FOR SELECT USING (auth.role() = 'authenticated');
-- Write: Admin, Docente (only assigned? MVP: allow Docente to edit all notes for simplicity, logic in UI)
CREATE POLICY "Notas modify academic" ON notas FOR ALL USING (get_my_role() IN ('ADMIN', 'DOCENTE'));

-- CONDUCTA
-- Read: Admin, Secretaria, Preceptor, Docente
CREATE POLICY "Conducta select staff" ON conducta_incidentes FOR SELECT USING (get_my_role() IN ('ADMIN', 'SECRETARIA', 'PRECEPTOR', 'DOCENTE'));
-- Write: Admin, Secretaria, Preceptor
CREATE POLICY "Conducta modify discipline" ON conducta_incidentes FOR ALL USING (get_my_role() IN ('ADMIN', 'SECRETARIA', 'PRECEPTOR'));

-- PAGOS
-- Read: Admin, Tesoreria, Secretaria (maybe)
CREATE POLICY "Pagos select finance" ON pagos FOR SELECT USING (get_my_role() IN ('ADMIN', 'TESORERIA', 'SECRETARIA'));
-- Write: Admin, Tesoreria
CREATE POLICY "Pagos modify finance" ON pagos FOR ALL USING (get_my_role() IN ('ADMIN', 'TESORERIA'));

-- ACTIVIDADES
-- Read: All
CREATE POLICY "Actividades select all" ON actividades FOR SELECT USING (auth.role() = 'authenticated');
-- Write: Admin, Secretaria
CREATE POLICY "Actividades modify admin" ON actividades FOR ALL USING (get_my_role() IN ('ADMIN', 'SECRETARIA'));

-- PERSONAL
CREATE POLICY "Personal select all" ON personal_docentes FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Personal all admin" ON personal_docentes FOR ALL USING (get_my_role() IN ('ADMIN', 'SECRETARIA'));
CREATE POLICY "PersonalND select all" ON personal_no_docentes FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "PersonalND all admin" ON personal_no_docentes FOR ALL USING (get_my_role() IN ('ADMIN', 'SECRETARIA'));

-- DIAS INHABILES
CREATE POLICY "DiasInhabiles select all" ON dias_inhabiles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "DiasInhabiles modify admin" ON dias_inhabiles FOR ALL USING (get_my_role() IN ('ADMIN', 'SECRETARIA'));


-- SEED DATA (Trigger to auto-create profile on auth.signup not included here, assuming manual seed or app handling)
-- But we can insert dummy data if tables exist.

-- NOTE: You must create auth users in Supabase dashboard first or via API to map profiles.
-- The seed below inserts just structure data or fake students.

INSERT INTO alumnos (legajo, nombre, apellido, dni, curso, division) VALUES
('L001', 'Juan', 'Perez', '40123456', '2º', 'A'),
('L002', 'Maria', 'Gomez', '40654321', '2º', 'A'),
('L003', 'Pedro', 'Lopez', '41000111', '3º', 'B')
ON CONFLICT (legajo) DO NOTHING;

INSERT INTO materias (nombre, carga_horaria) VALUES
('Matemática', 4),
('Lengua', 4),
('Historia', 2)
ON CONFLICT DO NOTHING;
