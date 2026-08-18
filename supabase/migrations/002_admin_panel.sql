-- Migración: Panel Admin — campos nuevos y cierres de jornada
-- Ejecutar en Supabase → SQL Editor

-- Nuevos campos en reservas
ALTER TABLE reservas ADD COLUMN IF NOT EXISTS medio_pago TEXT;
ALTER TABLE reservas ADD COLUMN IF NOT EXISTS estado_asistencia TEXT NOT NULL DEFAULT 'pendiente'
  CHECK (estado_asistencia IN ('pendiente', 'asistio', 'no_asistio', 'cancelado'));
ALTER TABLE reservas ADD COLUMN IF NOT EXISTS fue_modificado BOOLEAN NOT NULL DEFAULT false;

-- Migrar datos existentes de modificado_por_admin → fue_modificado
UPDATE reservas SET fue_modificado = true WHERE modificado_por_admin = true AND fue_modificado = false;

-- Tabla de cierres de jornada
CREATE TABLE IF NOT EXISTS cierres_jornada (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha                 DATE NOT NULL,
  tipo_jornada          TEXT NOT NULL CHECK (tipo_jornada IN ('laser', 'general')),
  total_recaudado       NUMERIC(10, 2) NOT NULL DEFAULT 0,
  desglose_medios_pago  JSONB NOT NULL DEFAULT '{}',
  cerrado_por           TEXT,
  fecha_cierre          TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (fecha, tipo_jornada)
);

CREATE INDEX IF NOT EXISTS idx_cierres_jornada_fecha ON cierres_jornada (fecha);

ALTER TABLE cierres_jornada ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura cierres authenticated"
  ON cierres_jornada FOR SELECT TO authenticated USING (true);

CREATE POLICY "Insertar cierres authenticated"
  ON cierres_jornada FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Eliminar cierres authenticated"
  ON cierres_jornada FOR DELETE TO authenticated USING (true);

-- Políticas admin para catálogos (usuario autenticado)
CREATE POLICY "Admin CRUD servicios_laser"
  ON servicios_laser FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin CRUD promos_laser"
  ON promos_laser FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin CRUD servicios_generales"
  ON servicios_generales FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin update configuracion_calendario"
  ON configuracion_calendario FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin update configuracion_sistema"
  ON configuracion_sistema FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
