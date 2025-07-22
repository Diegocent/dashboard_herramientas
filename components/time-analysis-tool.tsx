"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { parseCSV } from "@/lib/csv-parser";
import { calculateWorkingHours, isWeekend, isHoliday } from "@/lib/time-utils";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, X, Calendar } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TimeConfig {
  startTime: string;
  endTime: string;
  maxHours: number;
  startTimeColumn: string;
  endTimeColumn: string;
}

interface Filter {
  id: string;
  column: string;
  value: string;
  type: "text" | "dateRange";
  startDate?: string;
  endDate?: string;
}

export function TimeAnalysisTool() {
  const [fileData, setFileData] = React.useState<any[]>([]);
  const [columns, setColumns] = React.useState<string[]>([]);
  const [selectedColumns, setSelectedColumns] = React.useState<string[]>([]);
  const [holidays, setHolidays] = React.useState<string[]>([]);
  const [config, setConfig] = React.useState<TimeConfig>({
    startTime: "08:00",
    endTime: "17:00",
    maxHours: 8,
    startTimeColumn: "",
    endTimeColumn: "",
  });

  const [filters, setFilters] = React.useState<Filter[]>([]);
  const [filterColumn, setFilterColumn] = React.useState("");
  const [filterValue, setFilterValue] = React.useState("");
  const [filterType, setFilterType] = React.useState<"text" | "dateRange">(
    "text"
  );
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  // Detectar si una columna es de fecha
  const isDateColumn = (columnName: string, sampleData: any[]) => {
    // Verificar por nombre de columna
    const dateKeywords = [
      "date",
      "fecha",
      "time",
      "tiempo",
      "hora",
      "timestamp",
    ];
    const hasDateKeyword = dateKeywords.some((keyword) =>
      columnName.toLowerCase().includes(keyword)
    );

    if (hasDateKeyword) return true;

    // Verificar por formato de datos
    if (sampleData.length > 0) {
      const sampleValues = sampleData
        .slice(0, 5)
        .map((row) => row[columnName])
        .filter((val) => val);
      const dateFormatRegex = /^\d{4}-\d{2}-\d{2}(\s\d{2}:\d{2}:\d{2})?$/;

      const dateMatches = sampleValues.filter(
        (val) => typeof val === "string" && dateFormatRegex.test(val)
      );

      return dateMatches.length > sampleValues.length * 0.5; // Si más del 50% son fechas
    }

    return false;
  };

  const downloadExcel = () => {
    if (!processedData.length) {
      alert("No hay datos para descargar");
      return;
    }

    // Preparar datos con formato de números usando coma
    const excelData = processedData.map((row) => {
      const formattedRow: any = {};
      displayColumns.forEach((column) => {
        let value = row[column] || "";
        // Convertir números con punto a coma
        if (
          typeof value === "number" ||
          (typeof value === "string" && !isNaN(Number(value)))
        ) {
          value = value.toString().replace(".", ",");
        }
        formattedRow[column] = value;
      });
      return formattedRow;
    });

    // Calcular totales
    const totalHours = processedData.reduce(
      (sum, row) => sum + (Number(row["Horas Totales"]) || 0),
      0
    );
    const totalDays = processedData.reduce(
      (sum, row) => sum + (Number(row["Días Totales"]) || 0),
      0
    );

    // Agregar fila de totales
    const totalsRow: any = {};
    displayColumns.forEach((column) => {
      if (column === "Horas Totales") {
        totalsRow[column] = totalHours.toString().replace(".", ",");
      } else if (column === "Días Totales") {
        totalsRow[column] = totalDays.toString().replace(".", ",");
      } else {
        totalsRow[column] = column === displayColumns[0] ? "TOTALES" : "";
      }
    });

    excelData.push(totalsRow);

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Análisis de Horas");
    XLSX.writeFile(
      wb,
      `analisis_horas_${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      alert("No se seleccionó ningún archivo.");
      return;
    }

    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    if (fileExtension === "csv") {
      const parsedData = parseCSV(file);
      if ((await parsedData)?.length > 0) {
        setFileData(await parsedData);
        const data = await parsedData;
        const cols = Object.keys(data[0]);
        setColumns(cols);
        setSelectedColumns(cols);
      } else {
        alert("El archivo CSV no contiene datos válidos.");
      }
    } else {
      alert("Por favor, suba un archivo en formato CSV.");
    }
  };

  const handleHolidaysUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const holidayDates = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && /^\d{2}\/\d{2}\/\d{4}$/.test(line));

    setHolidays(holidayDates);
  };

  const handleColumnToggle = (column: string) => {
    setSelectedColumns((prev) =>
      prev.includes(column)
        ? prev.filter((col) => col !== column)
        : [...prev, column]
    );
  };

  const handleFilterColumnChange = (column: string) => {
    setFilterColumn(column);
    const isDate = isDateColumn(column, fileData);
    setFilterType(isDate ? "dateRange" : "text");
    setFilterValue("");
    setStartDate("");
    setEndDate("");
  };

  const addFilter = () => {
    if (!filterColumn) {
      alert("Por favor selecciona una columna");
      return;
    }

    if (filterType === "text" && !filterValue.trim()) {
      alert("Por favor escribe un valor para filtrar");
      return;
    }

    if (filterType === "dateRange" && (!startDate || !endDate)) {
      alert("Por favor selecciona un rango de fechas");
      return;
    }

    const newFilter: Filter = {
      id: Date.now().toString(),
      column: filterColumn,
      type: filterType,
      value:
        filterType === "text"
          ? filterValue.trim()
          : `${startDate} - ${endDate}`,
      startDate: filterType === "dateRange" ? startDate : undefined,
      endDate: filterType === "dateRange" ? endDate : undefined,
    };

    setFilters((prev) => [...prev, newFilter]);
    setFilterColumn("");
    setFilterValue("");
    setStartDate("");
    setEndDate("");
  };

  const removeFilter = (filterId: string) => {
    setFilters((prev) => prev.filter((f) => f.id !== filterId));
  };

  const processedData = React.useMemo(() => {
    let data = fileData;

    if (fileData.length && config.startTimeColumn && config.endTimeColumn) {
      data = fileData.map((row) => {
        const startTime = row[config.startTimeColumn];
        const endTime = row[config.endTimeColumn];

        if (!startTime || !endTime) {
          return {
            ...row,
            "Horas Totales": 0,
            "Días Totales": 0,
          };
        }

        const date = new Date(startTime).toISOString().split("T")[0];
        const dateFormatted = date.split("-").reverse().join("/");

        if (isWeekend(startTime) || isHoliday(dateFormatted, holidays)) {
          return {
            ...row,
            "Horas Totales": 0,
            "Días Totales": 0,
          };
        }

        const hours = calculateWorkingHours(
          startTime,
          endTime,
          config.maxHours
        );

        return {
          ...row,
          "Horas Totales": Math.max(0, hours),
          "Días Totales": hours > 0 ? 1 : 0,
        };
      });
    }

    // Aplicar filtros
    if (filters.length > 0) {
      data = data.filter((row) => {
        return filters.every((filter) => {
          const cellValue = row[filter.column];

          if (
            filter.type === "dateRange" &&
            filter.startDate &&
            filter.endDate
          ) {
            if (!cellValue) return false;

            const cellDate = new Date(cellValue.toString().split(" ")[0]); // Tomar solo la parte de fecha
            const start = new Date(filter.startDate);
            const end = new Date(filter.endDate);

            return cellDate >= start && cellDate <= end;
          } else {
            const cellValueStr = cellValue?.toString().toLowerCase() || "";
            return cellValueStr.includes(filter.value.toLowerCase());
          }
        });
      });
    }

    return data;
  }, [fileData, config, holidays, filters]);

  const displayColumns = [...selectedColumns, "Horas Totales", "Días Totales"];

  return (
    <div className="space-y-6">
      {/* Configuración */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración</CardTitle>
          <CardDescription>
            Configure los parámetros para el análisis de horas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start-time">Hora de Entrada</Label>
              <Input
                id="start-time"
                type="time"
                value={config.startTime}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, startTime: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="end-time">Hora de Salida</Label>
              <Input
                id="end-time"
                type="time"
                value={config.endTime}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, endTime: e.target.value }))
                }
              />
            </div>
          </div>
          <div>
            <Label htmlFor="max-hours">Horas Máximas por Día</Label>
            <Input
              id="max-hours"
              type="number"
              value={config.maxHours}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  maxHours: Number(e.target.value),
                }))
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start-column">Columna Hora Inicio</Label>
              <select
                id="start-column"
                className="w-full p-2 border rounded"
                value={config.startTimeColumn}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    startTimeColumn: e.target.value,
                  }))
                }
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
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    endTimeColumn: e.target.value,
                  }))
                }
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
            <Input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
            />
          </div>
          <div>
            <Label htmlFor="holidays-file">Archivo de Feriados (TXT)</Label>
            <Input
              id="holidays-file"
              type="file"
              accept=".txt"
              onChange={handleHolidaysUpload}
            />
          </div>
        </CardContent>
      </Card>

      {/* Selección de columnas y filtros */}
      {columns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Configuración de Vista</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Selector de columnas */}
            <div>
              <Label>Seleccionar Columnas</Label>
              <div className="mt-2">
                <DropdownMenu
                  open={dropdownOpen}
                  onOpenChange={setDropdownOpen}
                >
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full max-w-xs bg-transparent"
                    >
                      Columnas ({selectedColumns.length}){" "}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="max-h-64 overflow-y-auto w-56"
                    onCloseAutoFocus={(e) => e.preventDefault()}
                  >
                    {columns.map((column) => (
                      <DropdownMenuCheckboxItem
                        key={column}
                        className="capitalize"
                        checked={selectedColumns.includes(column)}
                        onCheckedChange={() => handleColumnToggle(column)}
                        onSelect={(e) => e.preventDefault()}
                      >
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="truncate max-w-[180px] block">
                                {column}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{column}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Filtros */}
            <div>
              <Label>Filtros</Label>
              <div className="mt-2 space-y-3">
                <div className="flex gap-2 flex-wrap">
                  <select
                    className="flex-1 min-w-[150px] p-2 border rounded"
                    value={filterColumn}
                    onChange={(e) => handleFilterColumnChange(e.target.value)}
                  >
                    <option value="">Seleccionar columna</option>
                    {displayColumns.map((col) => (
                      <option key={col} value={col}>
                        {col}{" "}
                        {isDateColumn(col, fileData) && (
                          <Calendar className="inline h-3 w-3" />
                        )}
                      </option>
                    ))}
                  </select>

                  {filterType === "text" ? (
                    <Input
                      placeholder="Valor a buscar..."
                      value={filterValue}
                      onChange={(e) => setFilterValue(e.target.value)}
                      className="flex-1 min-w-[150px]"
                      onKeyPress={(e) => e.key === "Enter" && addFilter()}
                    />
                  ) : (
                    <>
                      <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="flex-1 min-w-[130px]"
                        placeholder="Fecha inicio"
                      />
                      <Input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="flex-1 min-w-[130px]"
                        placeholder="Fecha fin"
                      />
                    </>
                  )}

                  <Button onClick={addFilter} variant="outline">
                    Agregar
                  </Button>
                </div>

                {/* Cards de filtros activos */}
                {filters.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {filters.map((filter) => (
                      <div
                        key={filter.id}
                        className="flex items-center gap-2 bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm"
                      >
                        {filter.type === "dateRange" && (
                          <Calendar className="h-3 w-3" />
                        )}
                        <span className="font-medium">{filter.column}:</span>
                        <span>{filter.value}</span>
                        <button
                          onClick={() => removeFilter(filter.id)}
                          className="hover:bg-secondary-foreground/20 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabla de datos */}
      {processedData.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              Datos Procesados ({processedData.length} registros)
            </CardTitle>
            <Button onClick={downloadExcel} variant="outline">
              Descargar Excel
            </Button>
          </CardHeader>
          <CardContent>
            <div className="w-full">
              <div className="relative border rounded-md max-w-[85vw]">
                <div className="overflow-auto max-h-[60vh]">
                  <Table className="min-w-full">
                    <TableHeader className="sticky top-0 z-20 bg-background">
                      <TableRow>
                        {displayColumns.map((column) => (
                          <TableHead
                            key={column}
                            className="whitespace-nowrap min-w-[100px] px-2"
                          >
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="truncate max-w-[150px] block">
                                    {column}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{column}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {processedData.map((row, index) => (
                        <TableRow key={index}>
                          {displayColumns.map((column) => (
                            <TableCell
                              key={column}
                              className="whitespace-nowrap px-2 max-w-[200px]"
                            >
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="truncate block">
                                      {typeof row[column] === "number"
                                        ? row[column]
                                            .toString()
                                            .replace(".", ",")
                                        : row[column] || ""}
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>
                                      {typeof row[column] === "number"
                                        ? row[column]
                                            .toString()
                                            .replace(".", ",")
                                        : row[column] || ""}
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}

                      {/* Fila de totales sticky al fondo */}
                      <TableRow className="sticky bottom-0 bg-background z-30 border-t border-muted font-semibold">
                        {displayColumns.map((column, index) => (
                          <TableCell
                            key={column}
                            className="whitespace-nowrap px-2"
                          >
                            {index === 0
                              ? "TOTALES"
                              : column === "Horas Totales"
                              ? processedData
                                  .reduce(
                                    (sum, row) =>
                                      sum + (Number(row["Horas Totales"]) || 0),
                                    0
                                  )
                                  .toString()
                                  .replace(".", ",")
                              : column === "Días Totales"
                              ? processedData
                                  .reduce(
                                    (sum, row) =>
                                      sum + (Number(row["Días Totales"]) || 0),
                                    0
                                  )
                                  .toString()
                                  .replace(".", ",")
                              : ""}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
