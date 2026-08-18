-- ============================================================
-- ESQUEMA DEFINITIVO — Sistema de Reservas Centro de Estética
-- Ejecutar en Supabase → SQL Editor (en orden)
-- ============================================================

-- Extensiones útiles
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------
-- PASO 1: Limpiar tablas del prototipo anterior (si existen)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS turnos CASCADE;
DROP TABLE IF EXISTS zonas CASCADE;

-- ------------------------------------------------------------
-- PASO 2: Tablas principales
-- ------------------------------------------------------------

-- Zonas de depilación láser (por género)
CREATE TABLE servicios_laser (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  genero          TEXT NOT NULL CHECK (genero IN ('femenino', 'masculino')),
  nombre_zona     TEXT NOT NULL,
  categoria_zona  TEXT NOT NULL CHECK (categoria_zona IN ('chica', 'media', 'grande')),
  precio_lista    NUMERIC(10, 2) NOT NULL,
  duracion_minutos INTEGER NOT NULL,
  activo          BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Promos/paquetes láser
CREATE TABLE promos_laser (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  genero              TEXT NOT NULL CHECK (genero IN ('femenino', 'masculino')),
  nombre_promo        TEXT NOT NULL,
  zonas_incluidas     UUID[] NOT NULL DEFAULT '{}',
  precio_promo        NUMERIC(10, 2) NOT NULL,
  duracion_total_min  INTEGER NOT NULL,
  permite_swap        BOOLEAN NOT NULL DEFAULT false,
  activo              BOOLEAN NOT NULL DEFAULT true,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Servicios generales (faciales, uñas, masajes)
CREATE TABLE servicios_generales (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  categoria       TEXT NOT NULL CHECK (categoria IN ('faciales', 'manicura', 'masajes')),
  subtipo         TEXT NOT NULL,
  precio          NUMERIC(10, 2) NOT NULL,
  duracion_minutos INTEGER NOT NULL,
  activo          BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Configuración de calendario y horarios
CREATE TABLE configuracion_calendario (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo_servicio             TEXT NOT NULL CHECK (tipo_servicio IN ('laser', 'general')),
  fechas_habilitadas_laser  DATE[] DEFAULT '{}',
  horarios_atencion         JSONB NOT NULL DEFAULT '{
    "dias_semana": [1, 2, 3, 4, 5, 6],
    "bloques": [
      {"inicio": "09:00", "fin": "13:00"},
      {"inicio": "14:00", "fin": "19:00"}
    ],
    "intervalo_minutos": 15
  }'::jsonb,
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Configuración global del local (seña, cancelaciones, WhatsApp)
CREATE TABLE configuracion_sistema (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  porcentaje_sena             NUMERIC(5, 2) NOT NULL DEFAULT 30.00,
  ventana_horas_cancelacion   INTEGER NOT NULL DEFAULT 24,
  whatsapp_numero             TEXT NOT NULL DEFAULT '5491112345678',
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Reservas unificadas (láser + generales)
CREATE TABLE reservas (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo_unico          TEXT NOT NULL UNIQUE,
  cliente_nombre        TEXT NOT NULL,
  cliente_celular       TEXT NOT NULL,
  servicio_tipo         TEXT NOT NULL CHECK (servicio_tipo IN ('laser', 'general')),
  detalle_reserva       JSONB NOT NULL DEFAULT '{}',
  precio_total          NUMERIC(10, 2) NOT NULL,
  duracion_total        INTEGER NOT NULL,
  fecha_hora_inicio     TIMESTAMPTZ NOT NULL,
  estado                TEXT NOT NULL DEFAULT 'pendiente_sena'
                        CHECK (estado IN ('pendiente_sena', 'confirmado', 'cancelado')),
  modificado_por_admin  BOOLEAN NOT NULL DEFAULT false,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para búsquedas del admin y "Mis Turnos"
CREATE INDEX idx_reservas_celular ON reservas (cliente_celular);
CREATE INDEX idx_reservas_codigo ON reservas (codigo_unico);
CREATE INDEX idx_reservas_fecha ON reservas (fecha_hora_inicio);
CREATE INDEX idx_reservas_estado ON reservas (estado);
CREATE INDEX idx_servicios_laser_genero ON servicios_laser (genero);
CREATE INDEX idx_promos_laser_genero ON promos_laser (genero);

-- ------------------------------------------------------------
-- PASO 3: Función para generar código único (#7842)
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION generar_codigo_reserva()
RETURNS TEXT AS $$
DECLARE
  nuevo_codigo TEXT;
  existe BOOLEAN;
BEGIN
  LOOP
    nuevo_codigo := '#' || lpad(floor(random() * 10000)::text, 4, '0');
    SELECT EXISTS(SELECT 1 FROM reservas WHERE codigo_unico = nuevo_codigo) INTO existe;
    EXIT WHEN NOT existe;
  END LOOP;
  RETURN nuevo_codigo;
END;
$$ LANGUAGE plpgsql;

-- Trigger: asignar codigo_unico automáticamente al insertar
CREATE OR REPLACE FUNCTION trigger_codigo_reserva()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.codigo_unico IS NULL OR NEW.codigo_unico = '' THEN
    NEW.codigo_unico := generar_codigo_reserva();
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reservas_codigo_unico
  BEFORE INSERT ON reservas
  FOR EACH ROW
  EXECUTE FUNCTION trigger_codigo_reserva();

CREATE TRIGGER reservas_updated_at
  BEFORE UPDATE ON reservas
  FOR EACH ROW
  EXECUTE FUNCTION trigger_codigo_reserva();

-- ------------------------------------------------------------
-- PASO 4: Row Level Security (RLS)
-- ------------------------------------------------------------
ALTER TABLE servicios_laser ENABLE ROW LEVEL SECURITY;
ALTER TABLE promos_laser ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicios_generales ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion_calendario ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion_sistema ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservas ENABLE ROW LEVEL SECURITY;

-- Lectura pública de catálogos y config
CREATE POLICY "Lectura pública servicios_laser"
  ON servicios_laser FOR SELECT TO anon, authenticated USING (activo = true);

CREATE POLICY "Lectura pública promos_laser"
  ON promos_laser FOR SELECT TO anon, authenticated USING (activo = true);

CREATE POLICY "Lectura pública servicios_generales"
  ON servicios_generales FOR SELECT TO anon, authenticated USING (activo = true);

CREATE POLICY "Lectura pública configuracion_calendario"
  ON configuracion_calendario FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Lectura pública configuracion_sistema"
  ON configuracion_sistema FOR SELECT TO anon, authenticated USING (true);

-- Reservas: crear y consultar (Mis Turnos validará celular+código en la app)
CREATE POLICY "Insertar reservas"
  ON reservas FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Leer reservas"
  ON reservas FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Actualizar reservas"
  ON reservas FOR UPDATE TO anon, authenticated USING (true);

-- ------------------------------------------------------------
-- PASO 5: Datos iniciales de ejemplo
-- ------------------------------------------------------------

-- Configuración del sistema (una sola fila)
INSERT INTO configuracion_sistema (porcentaje_sena, ventana_horas_cancelacion, whatsapp_numero)
VALUES (30.00, 24, '5491112345678');

-- Calendario láser y general
INSERT INTO configuracion_calendario (tipo_servicio, fechas_habilitadas_laser)
VALUES (
  'laser',
  ARRAY['2026-08-20', '2026-08-22', '2026-08-27', '2026-08-29']::date[]
);

INSERT INTO configuracion_calendario (tipo_servicio)
VALUES ('general');

-- Zonas láser femeninas de ejemplo
INSERT INTO servicios_laser (genero, nombre_zona, categoria_zona, precio_lista, duracion_minutos) VALUES
  ('femenino', 'Labio superior', 'chica', 3500, 10),
  ('femenino', 'Axilas', 'chica', 4500, 15),
  ('femenino', 'Media pierna', 'media', 8000, 25),
  ('femenino', 'Pierna completa', 'grande', 12000, 40),
  ('femenino', 'Bikini', 'media', 7000, 20);

-- Zonas láser masculinas de ejemplo
INSERT INTO servicios_laser (genero, nombre_zona, categoria_zona, precio_lista, duracion_minutos) VALUES
  ('masculino', 'Barba', 'media', 6000, 20),
  ('masculino', 'Pecho', 'grande', 10000, 35),
  ('masculino', 'Espalda', 'grande', 12000, 40);

-- Servicios generales de ejemplo
INSERT INTO servicios_generales (categoria, subtipo, precio, duracion_minutos) VALUES
  ('faciales', 'Dermaplaning', 15000, 45),
  ('faciales', 'Limpieza profunda', 12000, 60),
  ('manicura', 'Semipermanente', 8000, 60),
  ('manicura', 'Kapping', 12000, 90),
  ('masajes', 'Descontracturante', 18000, 50),
  ('masajes', 'Relajante', 15000, 45);

-- Promo láser de ejemplo (ajustar zonas_incluidas con IDs reales después del insert)
-- Ejecutar después de insertar servicios_laser:
-- UPDATE promos_laser SET zonas_incluidas = ARRAY[(SELECT id FROM servicios_laser WHERE nombre_zona = 'Axilas' AND genero = 'femenino')] WHERE nombre_promo = 'Pack Axilas + Bikini';

INSERT INTO promos_laser (genero, nombre_promo, zonas_incluidas, precio_promo, duracion_total_min, permite_swap)
VALUES ('femenino', 'Pack Axilas + Bikini', '{}', 9500, 35, true);
