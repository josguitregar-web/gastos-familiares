# 💳 Control de Gastos Familiares

Aplicación web progresiva desarrollada con **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS** y sincronización en tiempo real con **Supabase** para la administración colaborativa de gastos del hogar familiar.

---

## 🚀 Características Principales

1. **Diseño Pixel-Perfect (Stitch)**:
   - Paleta de diseño basada en tokens oscuros con acentos Material 3 (`surface`, `primary`, `secondary`, `tertiary`, `surface-container`, etc.).
   - Tipografías oficiales Google Fonts: *Plus Jakarta Sans* (encabezados) e *Inter* (métricas y cuerpos de texto).
   - Íconos nativos con *Google Material Symbols Outlined*.

2. **Lógica de Estados Dinámicos en Tiempo Real**:
   - **Hecho (Liquidado)**: Badge verde (`bg-secondary/15 text-secondary`).
   - **Vencido**: Si el gasto sigue "Pendiente" y el día de corte ya pasó respecto a la fecha actual, se marca dinámicamente como vencido en rojo (`bg-tertiary-container/25 text-tertiary`) con alerta visual pulsante.
   - **Pendiente**: Para pagos con fecha futura dentro del periodo mensual (`bg-primary-container/20 text-primary-fixed`).
   - **Alternar Estado con 1 Clic**: El botón de check cambia instantáneamente entre *Hecho* y *Pendiente*.

3. **Integración con Google Calendar**:
   - Cada gasto cuenta con un botón directo para agendar recordatorios en Google Calendar con un solo clic.
   - Parámetros dinámicos: Concepto, Monto en MXN, Categoría, Método de pago y fecha exacta del vencimiento.

4. **Sincronización en Tiempo Real (Supabase Realtime)**:
   - Si tú o tu papá marcan un pago como liquidado o agregan un nuevo recibo, la pantalla de ambos se actualiza al instante sin recargar la página.
   - **Modo Local Resiliente**: Si no has configurado las credenciales de Supabase en `.env.local`, la app funciona automáticamente en modo almacenamiento local con los 14 gastos reales precargados.

5. **Visualización Dual**:
   - Vista en **Tabla Contable** completa para escritorio.
   - Vista en **Tarjetas (Grid)** optimizada para dispositivos móviles.

---

## 📁 Estructura Modular del Proyecto

```text
gastos-familiares/
├── app/
│   ├── globals.css         # Importación de fuentes y configuración de capas base
│   ├── layout.tsx          # Configuración del documento raíz HTML/Dark theme
│   └── page.tsx            # Dashboard interactivo con suscripciones Realtime
├── components/
│   ├── Header.tsx          # Barra superior, selector de periodo y estado familiar
│   ├── KpiCards.tsx        # 4 tarjetas de métricas en vivo (Presupuesto, Pagado, Pendiente, Vencidos)
│   ├── HealthBanner.tsx    # Barra de salud financiera segmentada
│   ├── FilterControls.tsx  # Barra de búsqueda, píldoras de categorías y selector de estado
│   ├── ExpenseTable.tsx    # Tabla interactiva con botones de estado y Google Calendar
│   ├── ExpenseGrid.tsx     # Vista en tarjetas para pantallas móviles
│   ├── BottomDock.tsx      # Barra flotante fija con balance rápido y acceso directo
│   ├── AddExpenseModal.tsx # Modal de captura rápida de gastos familiares
│   └── Toast.tsx           # Notificaciones contextuales animadas
├── lib/
│   ├── initialData.ts      # Los 14 gastos reales de la familia precargados
│   └── supabase.ts         # Cliente Supabase, operaciones CRUD y fallback
├── supabase/
│   ├── schema.sql          # Creación de tabla, índices, RLS y publicación Realtime
│   └── seed.sql            # Script SQL de siembra con los 14 gastos reales
├── types/
│   └── expense.ts          # Definición de tipos TypeScript y evaluador de estado
├── tailwind.config.ts      # Paleta y tokens exactos de Stitch
└── .env.example            # Plantilla de variables de entorno
```

---

## 📋 Los 14 Gastos Reales de la Familia

1. **Día 01**: Tarjeta de Crédito Banamex / Bancomer ($1,200.00) - *Tarjetas*
2. **Día 01**: Seguro de Auto ($1,500.00) - *Salud*
3. **Día 01**: Amazon Prime ($130.00) - *Servicios*
4. **Día 05**: Izzi ($1,000.00) - *Servicios*
5. **Día 05**: Mantenimiento ($400.00) - *Vivienda*
6. **Día 05**: Agua ($500.00) - *Servicios*
7. **Día 05**: Luz / Gas del mes ($800.00) - *Servicios*
8. **Día 15**: Telmex ($500.00) - *Servicios*
9. **Día 15**: Agua ($400.00) - *Servicios*
10. **Día 17**: Mercado ($1,000.00) - *Vivienda*
11. **Día 20**: Coppel ($1,000.00) - *Tarjetas*
12. **Día 24**: Tarjeta de Crédito Banamex / Bancomer ($1,300.00) - *Tarjetas*
13. **Día 30**: Tarjeta de Crédito Santander ($1,100.00) - *Tarjetas*
14. **Día Domingo (Semanal)**: Banco Azteca ($500.00) - *Tarjetas*

---

## ⚙️ Configuración y Conexión con Supabase

### 1. Crear Proyecto en Supabase
1. Ingresa a [supabase.com](https://supabase.com) y crea un nuevo proyecto.
2. Abre el **SQL Editor** en el panel de Supabase.
3. Copia y ejecuta el contenido de `supabase/schema.sql`.
4. Copia y ejecuta el contenido de `supabase/seed.sql` para cargar los 14 gastos.

### 2. Configurar Variables de Entorno
Crea o edita el archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anonima-publica
```

### 3. Ejecutar el Servidor de Desarrollo
```bash
npm run dev
```

Abre en tu navegador: [http://localhost:3000](http://localhost:3000)
