function obtenerDiaDeLaSemana(fecha: string) {
  const dias = [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
  ];
  const fechaObj = new Date(`${fecha}T00:00:00`);
  const diaNumero = fechaObj.getDay();
  return dias[diaNumero];
}

export function isWeekend(dateString: string): boolean {
  const date = new Date(`${dateString}T00:00:00`);
  const day = date.getDay();
  return day === 0 || day === 6; // Domingo o Sábado
}

export function isHoliday(dateString: string, holidays: string[]): boolean {
  const [year, month, day] = dateString.split("-");
  const formatted = `${day}/${month}/${year}`;
  return holidays.includes(formatted);
}

export function calculateWorkingHours(
  startTime: string,
  endTime: string,
  maxHours: number
): number {
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return 0;
  }

  const diffMs = end.getTime() - start.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  // No permitir horas negativas
  if (diffHours < 0) {
    return 0;
  }

  // Si excede el máximo, retornar 0
  if (diffHours > maxHours) {
    return 0;
  }

  return Math.round(diffHours * 100) / 100; // Redondear a 2 decimales
}

export function calculateWorkingHoursAndDays(
  startStr: string,
  endStr: string,
  workStartHour: string,
  workEndHour: string,
  maxHoursPerDay: number,
  holidays: string[]
): { totalHours: number; totalDays: number } {
  const start = new Date(startStr);
  const end = new Date(endStr);

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
    return { totalHours: 0, totalDays: 0 };
  }

  let totalHours = 0;
  let totalDays = 0;

  const current = new Date(start);

  while (current < end) {
    const dateStr = current.toISOString().split("T")[0];
    if (!isWeekend(dateStr) && !isHoliday(dateStr, holidays)) {
      const workDayStart = new Date(`${dateStr}T${workStartHour}:00`);
      const workDayEnd = new Date(`${dateStr}T${workEndHour}:00`);

      const from = new Date(
        Math.max(current.getTime(), workDayStart.getTime())
      );
      const to = new Date(Math.min(end.getTime(), workDayEnd.getTime()));

      const diff = to.getTime() - from.getTime();

      if (diff > 0) {
        const hours = diff / (1000 * 60 * 60);
        const limitedHours = Math.min(hours, maxHoursPerDay);
        totalHours += limitedHours;
        if (limitedHours > 0) totalDays += 1;
      }
    }

    // avanzar al día siguiente
    current.setDate(current.getDate() + 1);
    current.setHours(0, 0, 0, 0);
  }

  return {
    totalHours: Math.round(totalHours * 100) / 100,
    totalDays,
  };
}

export { obtenerDiaDeLaSemana };
