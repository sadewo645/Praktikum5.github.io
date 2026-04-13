import { SensorRecord } from "@/types/sensor";

const now = Date.now();

export const mockSensorData: SensorRecord[] = Array.from({ length: 10 }).map((_, index) => {
  const sampleIndex = 9 - index;
  const date = new Date(now - sampleIndex * 15 * 60 * 1000);
  const adc = 420 + index * 12;
  const kelembaban = Math.max(30, Math.min(85, 82 - index * 4));

  return {
    waktu: date.toLocaleString("id-ID", { hour12: false }),
    adc,
    kelembaban,
    status: kelembaban >= 70 ? "Basah" : kelembaban >= 45 ? "Lembap" : "Kering"
  };
});
