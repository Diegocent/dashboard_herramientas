import Papa from "papaparse";
import { parse, format, isValid } from "date-fns";
import { es } from "date-fns/locale";

const extractCsvRowValues = (row: string, maxColumns: number): string[] => {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    if (char === '"' && (i === 0 || row[i - 1] !== "\\")) {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  if (current) {
    values.push(current.trim());
  }

  return values.slice(0, maxColumns).map((value) => {
    if (value.startsWith('"') && value.endsWith('"')) {
      return value.slice(1, -1).replace(/""/g, '"');
    }
    return value === '""' ? "" : value;
  });
};

const dateFormatRegex =
  /(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})|(\d{2}\/[a-zA-Z]{3}\/\d{2} \d{1,2}:\d{2} (AM|PM))|(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}.\d{2,3})/;

const isDate = (value: string): boolean => {
  return dateFormatRegex.test(value);
};

const formatDate = (value: string): string => {
  if (isDate(value)) {
    try {
      if (/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}.\d{2,3}/.test(value)) {
        const parsedDate = new Date(value);
        if (isValid(parsedDate)) {
          return format(parsedDate, "yyyy-MM-dd HH:mm:ss");
        } else {
          console.error("Fecha no válida:", value);
          return value;
        }
      }

      const parsedDate = parse(value, "dd/MMM/yy hh:mm a", new Date(), {
        locale: es,
      });
      if (isValid(parsedDate)) {
        return format(parsedDate, "yyyy-MM-dd HH:mm:ss");
      } else {
        console.error("Fecha no válida:", value);
        return value;
      }
    } catch (error) {
      console.error("Error al parsear la fecha:", error);
      return value;
    }
  }

  return value;
};

const alignColumns = (
  headers: string[],
  row: string[]
): Record<string, string> => {
  const alignedRow: Record<string, string> = {};
  const headerCount: Record<string, number> = {};
  let rowCorrected;

  if (row.length <= 1) {
    rowCorrected = extractCsvRowValues(row[0], headers.length);
  } else {
    rowCorrected = row;
  }

  headers.forEach((header, index) => {
    let cellValue = rowCorrected[index] || "";
    cellValue = formatDate(cellValue);

    if (headerCount[header]) {
      headerCount[header]++;
      alignedRow[`${header}_${headerCount[header]}`] = cellValue;
    } else {
      headerCount[header] = 1;
      alignedRow[header] = cellValue;
    }
  });

  return alignedRow;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const parseCSV = async (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data as string[][];
        const headers = rows[0] || [];
        rows.shift();
        const alignedData = rows.map((row) => alignColumns(headers, row));
        resolve(alignedData);
      },
      error: (error) => reject(error),
    });
  });
};

export { parseCSV };
