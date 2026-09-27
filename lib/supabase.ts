import { createClient } from "@supabase/supabase-js";
import { Expense, BaseExpenseStatus } from "@/types/expense";
import { INITIAL_EXPENSES } from "./initialData";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes("placeholder") &&
    !supabaseUrl.includes("your-project")
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ==========================================
// FALLBACK LOCAL STORAGE (MODO LOCAL / PROTOTIPO)
// ==========================================
const LOCAL_STORAGE_KEY = "gastos_familiares_data_v1";

function getLocalData(): Expense[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      const seeded: Expense[] = INITIAL_EXPENSES.map((g, idx) => ({
        ...g,
        id: `local-${idx + 1}-${Date.now()}`,
        created_at: new Date().toISOString(),
      }));
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading localStorage:", err);
    return [];
  }
}

function saveLocalData(data: Expense[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new Event("local_storage_gastos_updated"));
  } catch (err) {
    console.error("Error saving to localStorage:", err);
  }
}

// ==========================================
// API / SERVICIOS DE GASTOS
// ==========================================

export async function getGastos(mes_ano: string): Promise<Expense[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("gastos")
      .select("*")
      .eq("mes_ano", mes_ano)
      .order("dia", { ascending: true });

    if (error) {
      console.error("Error fetching gastos from Supabase:", error);
      throw error;
    }

    if (!data || data.length === 0) {
      return await seedInitialGastos(mes_ano);
    }

    return data as Expense[];
  }

  // Fallback Local Storage
  const all = getLocalData();
  const filtered = all.filter((g) => g.mes_ano === mes_ano);
  if (filtered.length === 0) {
    const newItems: Expense[] = INITIAL_EXPENSES.map((item, idx) => ({
      ...item,
      id: `local-${mes_ano}-${idx + 1}`,
      mes_ano,
      created_at: new Date().toISOString(),
    }));
    saveLocalData([...all, ...newItems]);
    return newItems;
  }
  return filtered.sort((a, b) => a.dia - b.dia);
}

export async function toggleEstadoGasto(
  id: string,
  nuevoEstado: BaseExpenseStatus
): Promise<Expense> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("gastos")
      .update({ estado: nuevoEstado, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error toggling gasto in Supabase:", error);
      throw error;
    }
    return data as Expense;
  }

  // Fallback Local Storage
  const all = getLocalData();
  let updatedItem: Expense | null = null;
  const nextData = all.map((item) => {
    if (item.id === id) {
      updatedItem = {
        ...item,
        estado: nuevoEstado,
        updated_at: new Date().toISOString(),
      };
      return updatedItem;
    }
    return item;
  });

  saveLocalData(nextData);
  if (!updatedItem) throw new Error("Gasto no encontrado");
  return updatedItem;
}

export async function addGasto(
  nuevoGasto: Omit<Expense, "id" | "created_at" | "updated_at">
): Promise<Expense> {
  const payload = {
    dia: parseInt(String(nuevoGasto.dia), 10),
    monto: parseFloat(String(nuevoGasto.monto)),
    concepto: String(nuevoGasto.concepto).trim(),
    categoria: nuevoGasto.categoria,
    subtitulo: nuevoGasto.subtitulo ? String(nuevoGasto.subtitulo).trim() : null,
    metodo: String(nuevoGasto.metodo || "Banca Móvil").trim(),
    estado: nuevoGasto.estado || "Pendiente",
    mes_ano: String(nuevoGasto.mes_ano),
    icono: nuevoGasto.icono ? String(nuevoGasto.icono).trim() : null,
  };

  if (isNaN(payload.dia) || payload.dia < 1 || payload.dia > 31) {
    throw new Error("El día de pago debe ser un número entero entre 1 y 31.");
  }
  if (isNaN(payload.monto) || payload.monto <= 0) {
    throw new Error("El monto debe ser un número numérico mayor a cero.");
  }
  if (!payload.concepto) {
    throw new Error("El concepto del gasto es obligatorio.");
  }
  if (!payload.mes_ano) {
    throw new Error("El periodo mes_ano es obligatorio.");
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("gastos")
        .insert([
          {
            ...payload,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Supabase insert error details:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        throw new Error(error.message || "Error al insertar en Supabase.");
      }
      return data as Expense;
    } catch (err: any) {
      console.error("Error executing addGasto:", err);
      throw err;
    }
  }

  // Fallback Local Storage
  const all = getLocalData();
  const created: Expense = {
    ...payload,
    subtitulo: payload.subtitulo || undefined,
    icono: payload.icono || undefined,
    id: `local-gasto-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  saveLocalData([...all, created]);
  return created;
}

export async function updateGasto(
  id: string,
  payloadUpdate: Partial<Omit<Expense, "id" | "created_at" | "updated_at">>
): Promise<Expense> {
  const sanitized: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (payloadUpdate.dia !== undefined) {
    sanitized.dia = parseInt(String(payloadUpdate.dia), 10);
  }
  if (payloadUpdate.monto !== undefined) {
    sanitized.monto = parseFloat(String(payloadUpdate.monto));
  }
  if (payloadUpdate.concepto !== undefined) {
    sanitized.concepto = String(payloadUpdate.concepto).trim();
  }
  if (payloadUpdate.categoria !== undefined) {
    sanitized.categoria = payloadUpdate.categoria;
  }
  if (payloadUpdate.subtitulo !== undefined) {
    sanitized.subtitulo = payloadUpdate.subtitulo ? String(payloadUpdate.subtitulo).trim() : null;
  }
  if (payloadUpdate.metodo !== undefined) {
    sanitized.metodo = String(payloadUpdate.metodo).trim();
  }
  if (payloadUpdate.estado !== undefined) {
    sanitized.estado = payloadUpdate.estado;
  }
  if (payloadUpdate.mes_ano !== undefined) {
    sanitized.mes_ano = String(payloadUpdate.mes_ano);
  }
  if (payloadUpdate.icono !== undefined) {
    sanitized.icono = payloadUpdate.icono ? String(payloadUpdate.icono).trim() : null;
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("gastos")
        .update(sanitized)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Supabase update error details:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        throw new Error(error.message || "Error al actualizar en Supabase.");
      }
      return data as Expense;
    } catch (err: any) {
      console.error("Error executing updateGasto:", err);
      throw err;
    }
  }

  // Fallback Local Storage
  const all = getLocalData();
  let updatedItem: Expense | null = null;
  const nextData = all.map((item) => {
    if (item.id === id) {
      updatedItem = {
        ...item,
        ...sanitized,
        subtitulo: sanitized.subtitulo ?? item.subtitulo,
        icono: sanitized.icono ?? item.icono,
      };
      return updatedItem;
    }
    return item;
  });

  saveLocalData(nextData);
  if (!updatedItem) throw new Error("Gasto no encontrado");
  return updatedItem;
}

export async function deleteGasto(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from("gastos").delete().eq("id", id);
    if (error) {
      console.error("Error deleting gasto from Supabase:", error);
      throw error;
    }
    return true;
  }

  const all = getLocalData();
  saveLocalData(all.filter((g) => g.id !== id));
  return true;
}

export async function seedInitialGastos(
  mes_ano: string = "2026-09"
): Promise<Expense[]> {
  const itemsToInsert = INITIAL_EXPENSES.map((gasto) => ({
    ...gasto,
    mes_ano,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("gastos")
      .insert(itemsToInsert)
      .select()
      .order("dia", { ascending: true });

    if (error) {
      console.error("Error seeding initial data in Supabase:", error);
      throw error;
    }
    return (data || []) as Expense[];
  }

  const currentLocal = getLocalData().filter((g) => g.mes_ano !== mes_ano);
  const seededLocal: Expense[] = itemsToInsert.map((g, idx) => ({
    ...g,
    id: `seeded-${mes_ano}-${idx + 1}`,
  }));
  saveLocalData([...currentLocal, ...seededLocal]);
  return seededLocal;
}
