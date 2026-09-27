-- ==========================================================
-- Script de Siembra (Seed Data): 14 Gastos Reales de la Familia
-- Periodo: Septiembre 2026 (2026-09)
-- ==========================================================

INSERT INTO public.gastos (dia, concepto, categoria, subtitulo, metodo, monto, estado, mes_ano)
VALUES
  (1, 'Tarjeta de Crédito Banamex / Bancomer', 'Tarjetas', 'Pago mínimo / saldo', 'Banca Móvil', 1200.00, 'Hecho', '2026-09'),
  (1, 'Seguro de Auto', 'Salud', 'Póliza semestral (Cuota familiar)', 'Tarjeta Banorte', 1500.00, 'Hecho', '2026-09'),
  (1, 'Amazon Prime', 'Servicios', 'Suscripción mensual y streaming', 'Tarjeta Débito', 130.00, 'Hecho', '2026-09'),
  (5, 'Izzi', 'Servicios', 'Internet, telefonía y televisión', 'Banca Móvil', 1000.00, 'Hecho', '2026-09'),
  (5, 'Mantenimiento', 'Vivienda', 'Cuota de mantenimiento edificio/fracc', 'Transferencia SPEI', 400.00, 'Hecho', '2026-09'),
  (5, 'Agua', 'Servicios', 'Servicio de agua potable y drenaje', 'Banca Móvil', 500.00, 'Hecho', '2026-09'),
  (5, 'Luz / Gas del mes', 'Servicios', 'Consumo mensual luz CFE y gas LP', 'App CFE / Efectivo', 800.00, 'Hecho', '2026-09'),
  (15, 'Telmex', 'Servicios', 'Internet Infinitum fibra óptica', 'Domiciliado', 500.00, 'Hecho', '2026-09'),
  (15, 'Agua', 'Servicios', 'Segunda cuota / servicio auxiliar agua', 'Banca Móvil', 400.00, 'Hecho', '2026-09'),
  (17, 'Mercado', 'Vivienda', 'Despensa quincenal de alimentos', 'Efectivo / Tarjeta', 1000.00, 'Pendiente', '2026-09'),
  (20, 'Coppel', 'Tarjetas', 'Abono a cuenta departamental', 'Banca Móvil', 1000.00, 'Pendiente', '2026-09'),
  (24, 'Tarjeta de Crédito Banamex / Bancomer', 'Tarjetas', 'Pago para no generar intereses', 'Banca Móvil', 1300.00, 'Pendiente', '2026-09'),
  (30, 'Tarjeta de Crédito Santander', 'Tarjetas', 'Pago mensual tarjeta Santander', 'Banca Móvil', 1100.00, 'Pendiente', '2026-09'),
  (7, 'Banco Azteca (Semanal)', 'Tarjetas', 'Abono semanal Domingo', 'App Banco Azteca / Efectivo', 500.00, 'Pendiente', '2026-09')
ON CONFLICT DO NOTHING;
