"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Activity, AlertTriangle, Droplets, Gauge, RefreshCcw } from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { fetchSensorData } from "@/lib/fetch-sensor-data";
import { SensorRecord } from "@/types/sensor";

function statusClass(status: string): string {
  const text = status.toLowerCase();
  if (text.includes("kering")) return "bg-rose-100 text-rose-700";
  if (text.includes("basah")) return "bg-emerald-100 text-emerald-700";
  if (text.includes("lembap") || text.includes("lembab")) return "bg-amber-100 text-amber-700";
  return "bg-slate-200 text-slate-700";
}

function formatTimeLabel(waktu: string): string {
  if (!waktu || waktu === "-") return "-";
  const parsed = new Date(waktu);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false });
  }
  return waktu;
}

export default function Dashboard() {
  const [records, setRecords] = useState<SensorRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const result = await fetchSensorData();
    setRecords(result.data);
    setError(result.error);
    setUsingFallback(result.usedFallback);
    setLoading(false);
  };

  useEffect(() => {
    loadData();

    const interval = window.setInterval(() => {
      loadData();
    }, 60_000);

    return () => window.clearInterval(interval);
  }, []);

  const latest = useMemo(() => records[records.length - 1], [records]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 p-4 md:p-8">
      <motion.header initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Soil Moisture Dashboard</h1>
            <p className="mt-1 text-sm text-slate-600">Monitoring kelembaban tanah dari Google Sheets API</p>
          </div>
          <button
            onClick={loadData}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50"
            type="button"
          >
            <RefreshCcw className="h-4 w-4" /> Refresh
          </button>
        </div>
      </motion.header>

      {loading ? (
        <section className="rounded-2xl bg-white p-8 text-center text-slate-600 shadow-sm">Loading sensor data...</section>
      ) : (
        <>
          {error && (
            <section className="flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-900">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <p className="font-medium">Data warning</p>
                <p className="text-sm">{error}</p>
              </div>
            </section>
          )}

          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <motion.article initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-sm text-slate-500">Latest Moisture</p>
              <div className="mt-2 flex items-center gap-2">
                <Droplets className="h-4 w-4 text-blue-600" />
                <p className="text-2xl font-semibold">{latest?.kelembaban ?? 0}%</p>
              </div>
            </motion.article>

            <motion.article initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }} className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-sm text-slate-500">Latest ADC</p>
              <div className="mt-2 flex items-center gap-2">
                <Gauge className="h-4 w-4 text-indigo-600" />
                <p className="text-2xl font-semibold">{latest?.adc ?? 0}</p>
              </div>
            </motion.article>

            <motion.article initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-sm text-slate-500">Latest Status</p>
              <div className="mt-3">
                <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${statusClass(latest?.status ?? "unknown")}`}>
                  {latest?.status ?? "Unknown"}
                </span>
              </div>
            </motion.article>

            <motion.article initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-sm text-slate-500">Data Source</p>
              <div className="mt-2 flex items-center gap-2">
                <Activity className="h-4 w-4 text-emerald-600" />
                <p className="text-sm font-medium">{usingFallback ? "Fallback Mock" : "Live API"}</p>
              </div>
            </motion.article>
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <article className="rounded-2xl bg-white p-4 shadow-sm">
              <h2 className="mb-3 text-lg font-semibold">Moisture Chart</h2>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={records}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="waktu" tickFormatter={formatTimeLabel} minTickGap={20} />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="kelembaban" stroke="#2563eb" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="rounded-2xl bg-white p-4 shadow-sm">
              <h2 className="mb-3 text-lg font-semibold">ADC Chart</h2>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={records}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="waktu" tickFormatter={formatTimeLabel} minTickGap={20} />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="adc" stroke="#7c3aed" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </article>
          </section>

          <section className="rounded-2xl bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold">Recent History</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead>
                  <tr className="text-left text-slate-500">
                    <th className="py-2 pr-4">Waktu</th>
                    <th className="py-2 pr-4">ADC</th>
                    <th className="py-2 pr-4">Kelembaban</th>
                    <th className="py-2 pr-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {records.slice(-12).reverse().map((row, index) => (
                    <tr key={`${row.waktu}-${index}`}>
                      <td className="py-2 pr-4">{row.waktu}</td>
                      <td className="py-2 pr-4">{row.adc}</td>
                      <td className="py-2 pr-4">{row.kelembaban}%</td>
                      <td className="py-2 pr-4">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClass(row.status)}`}>{row.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </main>
  );
}
