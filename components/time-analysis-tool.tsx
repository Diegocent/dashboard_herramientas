"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { parseCSV } from "@/lib/csv-parser"
import { calculateWorkingHours, isWeekend, isHoliday } from "@/lib/time-utils"

interface TimeConfig {
  startTime: string
  endTime: string
  maxHours: number
  startTimeColumn: string
  endTimeColumn: string
}

export function TimeAnalysisTool() {
  const [fileData, setFileData] = React.useState<any[]>([])
  const [columns, setColumns] = React.useState<string[]>([])
  const [selectedColumns, setSelectedColumns] = React.useState<string[]>([])
  const [holidays, setHolidays] = React.useState<string[]>([])
  const [config, setConfig] = React.useState<TimeConfig>({
    startTime: "08:00",
    endTime: "17:00",
    maxHours: 8,
    startTimeColumn: "",
    endTimeColumn: "",
  })

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      alert("No se seleccionó ningún archivo.")
      return
    }

    const fileExtension = file.name.split(".").pop()?.toLowerCase()
    if (fileExtension === "csv") {
      const parsedData = parseCSV(file)
      if ((await parsedData)?.length > 0) {
        setFileData(await parsedData)
        const data = await parsedData
        const cols = Object.keys(data[0])
        setColumns(cols)
        setSelectedColumns(cols)
      } else {
        alert("El archivo CSV no contiene datos válidos.")
      }
    } else {
      alert("Por favor, suba un archivo en formato CSV.")
    }
  }

  const handleHolidaysUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const text = await file.text()
    const holidayDates = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && /^\d{2}\/\d{2}\/\d{4}$/.test(line))

    setHolidays(holidayDates)
  }

  const handleColumnToggle = (column: string) => {
    setSelectedColumns((prev) => (prev.includes(column) ? prev.filter((col) => col !== column) : [...prev, column]))
  }

  const processedData = React.useMemo(() => {
    if (!fileData.length || !config.startTimeColumn || !config.endTimeColumn) {
      return fileData
    }

    return fileData.map((row) => {
      const startTime = row[config.startTimeColumn]
      const endTime = row[config.endTimeColumn]

      if (!startTime || !endTime) {
        return {
          ...row,
          "Horas Totales": 0,
          "Días Totales": 0,
        }
      }

      const date = new Date(startTime).toISOString().split("T")[0]
      const dateFormatted = date.split("-").reverse().join("/")

      // Verificar si es fin de semana o feriado
      if (isWeekend(startTime) || isHoliday(dateFormatted, holidays)) {
        return {
          ...row,
          "Horas Totales": 0,
          "Días Totales": 0,
        }
      }

      const hours = calculateWorkingHours(startTime, endTime, config.maxHours)

      return {
        ...row,
        "Horas Totales": Math.max(0, hours),
        "Días Totales": hours > 0 ? 1 : 0,
      }
    })
  }, [fileData, config, holidays])

  const displayColumns = [...selectedColumns, "Horas Totales", "Días Totales"]

  return (
    <div className="space-y-6">
      {/* Configuración */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración</CardTitle>
          <CardDescription>Configure los parámetros para el análisis de horas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start-time">Hora de Entrada</Label>
              <Input
                id="start-time"
                type="time"
                value={config.startTime}
                onChange={(e) => setConfig((prev) => ({ ...prev, startTime: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="end-time">Hora de Salida</Label>
              <Input
                id="end-time"
                type="time"
                value={config.endTime}
                onChange={(e) => setConfig((prev) => ({ ...prev, endTime: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="max-hours">Horas Máximas por Día</Label>
            <Input
              id="max-hours"
              type="number"
              value={config.maxHours}
              onChange={(e) => setConfig((prev) => ({ ...prev, maxHours: Number(e.target.value) }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start-column">Columna Hora Inicio</Label>
              <select
                id="start-column"
                className="w-full p-2 border rounded"
                value={config.startTimeColumn}
                onChange={(e) => setConfig((prev) => ({ ...prev, startTimeColumn: e.target.value }))}
              >
                <option value="">Seleccionar columna</option>
                {columns.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="end-column">Columna Hora Fin</Label>
              <select
                id="end-column"
                className="w-full p-2 border rounded"
                value={config.endTimeColumn}
                onChange={(e) => setConfig((prev) => ({ ...prev, endTimeColumn: e.target.value }))}
              >
                <option value="">Seleccionar columna</option>
                {columns.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Carga de archivos */}
      <Card>
        <CardHeader>
          <CardTitle>Cargar Archivos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="csv-file">Archivo CSV</Label>
            <Input id="csv-file" type="file" accept=".csv" onChange={handleFileUpload} />
          </div>
          <div>
            <Label htmlFor="holidays-file">Archivo de Feriados (TXT)</Label>
            <Input id="holidays-file" type="file" accept=".txt" onChange={handleHolidaysUpload} />
          </div>
        </CardContent>
      </Card>

      {/* Selección de columnas */}
      {columns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Seleccionar Columnas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              {columns.map((column) => (
                <div key={column} className="flex items-center space-x-2">
                  <Checkbox
                    id={column}
                    checked={selectedColumns.includes(column)}
                    onCheckedChange={() => handleColumnToggle(column)}
                  />
                  <Label htmlFor={column} className="text-sm">
                    {column}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabla de datos */}
      {processedData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Datos Procesados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {displayColumns.map((column) => (
                      <TableHead key={column}>{column}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processedData.map((row, index) => (
                    <TableRow key={index}>
                      {displayColumns.map((column) => (
                        <TableCell key={column}>{row[column] || ""}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
