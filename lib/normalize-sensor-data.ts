import { SensorRecord } from "@/types/sensor";

const HEADER_MAP: Record<keyof SensorRecord, string[]> = {
  waktu: ["waktu", "time", "timestamp", "jam", "tanggal"],
  adc: ["adc", "adc value", "nilai adc", "sensor"],
  kelembaban: ["kelembaban", "moisture", "humidity", "kadar air"],
  status: ["status", "kondisi", "state"]
};

function cleanKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function pickField(source: Record<string, unknown>, aliases: string[]): unknown {
  const normalizedEntries = Object.entries(source).map(([key, value]) => [cleanKey(key), value] as const);

  for (const alias of aliases) {
    const target = cleanKey(alias);
    const match = normalizedEntries.find(([key]) => key === target);
    if (match) {
      return match[1];
    }
  }

  return undefined;
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value.replace(/[^0-9.-]/g, ""));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function toText(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return "";
}

function looksLikeHeaderRow(row: unknown[]): boolean {
  const firstFour = row.slice(0, 4).map((value) => cleanKey(toText(value)));
  const headerWords = Object.values(HEADER_MAP).flat().map(cleanKey);
  return firstFour.some((value) => headerWords.includes(value));
}

function objectToRecord(row: Record<string, unknown>): SensorRecord | null {
  const waktu = toText(pickField(row, HEADER_MAP.waktu));
  const adc = toNumber(pickField(row, HEADER_MAP.adc));
  const kelembaban = toNumber(pickField(row, HEADER_MAP.kelembaban));
  const status = toText(pickField(row, HEADER_MAP.status));

  if (adc === null || kelembaban === null) return null;

  return {
    waktu: waktu || "-",
    adc,
    kelembaban,
    status: status || "Unknown"
  };
}

function arrayToRecord(row: unknown[], headerIndex?: Record<keyof SensorRecord, number>): SensorRecord | null {
  const getByIndex = (key: keyof SensorRecord, fallback: number): unknown => {
    const index = headerIndex?.[key] ?? fallback;
    return index >= 0 ? row[index] : undefined;
  };

  const waktu = toText(getByIndex("waktu", 0));
  const adc = toNumber(getByIndex("adc", 1));
  const kelembaban = toNumber(getByIndex("kelembaban", 2));
  const status = toText(getByIndex("status", 3));

  if (adc === null || kelembaban === null) return null;

  return {
    waktu: waktu || "-",
    adc,
    kelembaban,
    status: status || "Unknown"
  };
}

function parseUnknownString(raw: string): unknown {
  const trimmed = raw.trim();
  if (!trimmed) return [];

  try {
    return JSON.parse(trimmed);
  } catch {
    const lines = trimmed
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length === 0) return [];

    return lines.map((line) => line.split(",").map((cell) => cell.trim()));
  }
}

function extractCandidateArray(input: unknown): unknown[] {
  if (Array.isArray(input)) return input;
  if (input && typeof input === "object") {
    const obj = input as Record<string, unknown>;
    const keys = ["data", "values", "rows", "result"];

    for (const key of keys) {
      if (Array.isArray(obj[key])) return obj[key] as unknown[];
    }
  }
  return [];
}

export function normalizeSensorData(raw: unknown): SensorRecord[] {
  const parsed = typeof raw === "string" ? parseUnknownString(raw) : raw;
  const data = extractCandidateArray(parsed);
  if (!Array.isArray(data) || data.length === 0) return [];

  const firstRow = data[0];
  if (Array.isArray(firstRow)) {
    const hasHeader = looksLikeHeaderRow(firstRow);
    const headerIndex: Record<keyof SensorRecord, number> = {
      waktu: -1,
      adc: -1,
      kelembaban: -1,
      status: -1
    };

    if (hasHeader) {
      firstRow.forEach((value, index) => {
        const key = cleanKey(toText(value));
        (Object.keys(HEADER_MAP) as (keyof SensorRecord)[]).forEach((field) => {
          const aliases = HEADER_MAP[field].map(cleanKey);
          if (aliases.includes(key)) headerIndex[field] = index;
        });
      });
    }

    const rows = hasHeader ? data.slice(1) : data;
    return rows
      .filter(Array.isArray)
      .map((row) => arrayToRecord(row as unknown[], headerIndex))
      .filter((row): row is SensorRecord => row !== null);
  }

  if (firstRow && typeof firstRow === "object") {
    return data
      .filter((row): row is Record<string, unknown> => Boolean(row) && typeof row === "object" && !Array.isArray(row))
      .map((row) => objectToRecord(row))
      .filter((row): row is SensorRecord => row !== null);
  }

  return [];
}
