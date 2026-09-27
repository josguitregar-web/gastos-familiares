export type ExpenseCategory =
  | "Vivienda"
  | "Servicios"
  | "Educación"
  | "Salud"
  | "Tarjetas";

export type BaseExpenseStatus = "Hecho" | "Pendiente";
export type EvaluatedExpenseStatus = "Hecho" | "Pendiente" | "Vencido";

export interface Expense {
  id: string;
  dia: number; // 1 - 31
  fecha?: string; // YYYY-MM-DD
  concepto: string;
  categoria: ExpenseCategory;
  subtitulo?: string;
  metodo: string;
  monto: number;
  estado: BaseExpenseStatus;
  mes_ano: string; // YYYY-MM
  created_at?: string;
  updated_at?: string;
}

/**
 * Lógica de negocio requerida:
 * - Si estado == "Hecho" -> "Hecho"
 * - Si estado == "Pendiente" Y el día de pago < día actual del mes -> "Vencido"
 * - Si estado == "Pendiente" Y el día de pago >= día actual -> "Pendiente"
 */
export function getEvaluatedStatus(
  expense: Pick<Expense, "estado" | "dia" | "mes_ano">,
  referenceDate: Date = new Date()
): EvaluatedExpenseStatus {
  if (expense.estado === "Hecho") {
    return "Hecho";
  }

  const currentYear = referenceDate.getFullYear();
  const currentMonth = referenceDate.getMonth() + 1; // 1-12
  const currentDay = referenceDate.getDate();

  const [expYearStr, expMonthStr] = (expense.mes_ano || "").split("-");
  const expYear = parseInt(expYearStr, 10);
  const expMonth = parseInt(expMonthStr, 10);

  // Si el mes del gasto es anterior al mes actual en curso, está vencido
  if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
    return "Vencido";
  }

  // Si el mes del gasto es posterior al mes actual, aún está pendiente a futuro
  if (expYear > currentYear || (expYear === currentYear && expMonth > currentMonth)) {
    return "Pendiente";
  }

  // Si estamos en el mismo mes y año:
  if (expense.dia < currentDay) {
    return "Vencido";
  }

  return "Pendiente";
}
