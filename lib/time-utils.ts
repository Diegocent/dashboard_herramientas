function obtenerDiaDeLaSemana(fecha: string) {
  const dias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]
  const fechaObj = new Date(`${fecha}T00:00:00`)
  const diaNumero = fechaObj.getDay()
  return dias[diaNumero]
}

export function isWeekend(dateString: string): boolean {
  const date = new Date(dateString)
  const day = date.getDay()
  return day === 0 || day === 6 // Domingo o Sábado
}

export function isHoliday(dateString: string, holidays: string[]): boolean {
  return holidays.includes(dateString)
}

export function calculateWorkingHours(startTime: string, endTime: string, maxHours: number): number {
  const start = new Date(startTime)
  const end = new Date(endTime)

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return 0
  }

  const diffMs = end.getTime() - start.getTime()
  const diffHours = diffMs / (1000 * 60 * 60)

  // No permitir horas negativas
  if (diffHours < 0) {
    return 0
  }

  // Si excede el máximo, retornar 0
  if (diffHours > maxHours) {
    return 0
  }

  return Math.round(diffHours * 100) / 100 // Redondear a 2 decimales
}

export { obtenerDiaDeLaSemana }
