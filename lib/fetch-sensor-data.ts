import { mockSensorData } from "@/lib/mock-data";
import { normalizeSensorData } from "@/lib/normalize-sensor-data";
import { SensorRecord } from "@/types/sensor";

const API_URL = process.env.NEXT_PUBLIC_SHEET_API_URL;

export async function fetchSensorData(): Promise<{ data: SensorRecord[]; error: string | null; usedFallback: boolean }> {
  if (!API_URL) {
    return {
      data: mockSensorData,
      error: "Environment variable NEXT_PUBLIC_SHEET_API_URL is not set.",
      usedFallback: true
    };
  }

  try {
    const response = await fetch(API_URL, {
      method: "GET",
      headers: { Accept: "application/json,text/plain,*/*" },
      cache: "no-store"
    });

    const rawText = await response.text();
    const normalizedData = normalizeSensorData(rawText);

    if (!response.ok || normalizedData.length === 0) {
      return {
        data: mockSensorData,
        error: response.ok
          ? "API response could not be normalized. Showing fallback data."
          : `API request failed (${response.status}). Showing fallback data.`,
        usedFallback: true
      };
    }

    return { data: normalizedData, error: null, usedFallback: false };
  } catch {
    return {
      data: mockSensorData,
      error: "Unable to reach API endpoint. Showing fallback data.",
      usedFallback: true
    };
  }
}
