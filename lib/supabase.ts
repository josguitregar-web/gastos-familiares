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

    // Si la tabla está vacía para este mes, podemos sembrar los 14 gastos iniciales automáticamente
    if (!data || data.length === 0) {
      return await seedInitialGastos(mes_ano);
    }

    return data as Expense[];
  }

  // Fallback Local Storage
  const all = getLocalData();
  const filtered = all.filter((g) => g.mes_ano === mes_ano);
  if (filtered.length === 0) {
    // Inicializar para este mes
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
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("gastos")
      .insert([
        {
          ...nuevoGasto,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error adding gasto to Supabase:", error);
      throw error;
    }
    return data as Expense;
  }

  // Fallback Local Storage
  const all = getLocalData();
  const created: Expense = {
    ...nuevoGasto,
    id: `local-gasto-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  saveLocalData([...all, created]);
  return created;
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
