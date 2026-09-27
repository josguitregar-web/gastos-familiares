-- ==========================================================
-- Esquema Supabase: Control de Gastos Familiares
-- ==========================================================

-- 1. Crear tabla de gastos
CREATE TABLE IF NOT EXISTS public.gastos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dia INTEGER NOT NULL CHECK (dia >= 1 AND dia <= 31),
    fecha DATE,
    concepto VARCHAR(255) NOT NULL,
    categoria VARCHAR(50) NOT NULL CHECK (categoria IN ('Vivienda', 'Servicios', 'Educación', 'Salud', 'Tarjetas')),
    subtitulo VARCHAR(255),
    metodo VARCHAR(100) NOT NULL DEFAULT 'Banca Móvil',
    monto NUMERIC(12, 2) NOT NULL CHECK (monto >= 0),
    estado VARCHAR(20) NOT NULL DEFAULT 'Pendiente' CHECK (estado IN ('Hecho', 'Pendiente')),
    mes_ano VARCHAR(7) NOT NULL DEFAULT '2026-09', -- Formato YYYY-MM
    icono VARCHAR(50) DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Si la tabla ya existe, agregar la columna icono de manera segura:
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'gastos' 
        AND column_name = 'icono'
    ) THEN
        ALTER TABLE public.gastos ADD COLUMN icono VARCHAR(50) DEFAULT NULL;
    END IF;
END $$;

-- 2. Índices de rendimiento para consultas por mes y día
CREATE INDEX IF NOT EXISTS idx_gastos_mes_ano ON public.gastos (mes_ano);
CREATE INDEX IF NOT EXISTS idx_gastos_dia ON public.gastos (dia);
CREATE INDEX IF NOT EXISTS idx_gastos_categoria ON public.gastos (categoria);

-- 3. Habilitar Seguridad a Nivel de Fila (Row Level Security - RLS)
ALTER TABLE public.gastos ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de acceso (lectura y escritura compartida para el hogar familiar)
DROP POLICY IF EXISTS "Permitir lectura para todos los miembros" ON public.gastos;
CREATE POLICY "Permitir lectura para todos los miembros" 
ON public.gastos FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Permitir inserción de gastos" ON public.gastos;
CREATE POLICY "Permitir inserción de gastos" 
ON public.gastos FOR INSERT 
WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir actualización de gastos" ON public.gastos;
CREATE POLICY "Permitir actualización de gastos" 
ON public.gastos FOR UPDATE 
USING (true);

DROP POLICY IF EXISTS "Permitir eliminación de gastos" ON public.gastos;
CREATE POLICY "Permitir eliminación de gastos" 
ON public.gastos FOR DELETE 
USING (true);

-- 5. Habilitar Supabase Realtime para la tabla gastos
ALTER PUBLICATION supabase_realtime ADD TABLE public.gastos;
