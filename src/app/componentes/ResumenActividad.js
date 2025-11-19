"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase/client";
import { Clock, LogIn, LogOut, RefreshCw } from "lucide-react";

export default function ResumenActividades({ userId }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("attendance")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);

    if (!error) {
      const events = [];
      data.forEach((act) => {
        if (act.clock_out) events.push({ id: `out-${act.id}`, type: "Salida", time: act.clock_out, date: act.date });
        if (act.clock_in) events.push({ id: `in-${act.id}`, type: "Entrada", time: act.clock_in, date: act.date });
      });
      events.sort((a, b) => new Date(b.time) - new Date(a.time));
      setActivities(events);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchActivities();
  }, [userId]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString + "T00:00:00");
    return date.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
  };

  const formatTime = (dateTimeString) => {
    if (!dateTimeString) return "Pendiente";
    const date = new Date(dateTimeString);
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  const getIcon = (type) => (type === "Entrada" ? <LogIn className="w-4 h-4 text-green-600" /> : <LogOut className="w-4 h-4 text-red-600" />);
  const getIconBg = (type) => (type === "Entrada" ? "bg-green-100" : "bg-red-100");

  return (
    <div className="bg-gray-50 p-6 rounded-2xl shadow-lg w-full max-w-4xl mx-auto font-sans">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-600" />
          Actividades Recientes
        </h2>
        <button
          onClick={fetchActivities}
          className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-lg text-sm transition"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {loading ? (
        <p className="text-gray-400 text-center text-sm">Cargando actividades...</p>
      ) : activities.length === 0 ? (
        <p className="text-gray-400 text-center text-sm">No hay actividades registradas.</p>
      ) : (
        <div className="overflow-x-auto max-h-[300px]">
          <table className="min-w-full border-collapse text-sm text-gray-700">
            <tbody className="divide-y divide-gray-200">
              {activities.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50 transition">
                  {/* Fecha a la izquierda */}
                  <td className="px-4 py-2 font-thin text-gray-600 text-left">{formatDate(event.date)}</td>
                  {/* Evento + hora a la derecha */}
                  <td className="px-4 py-2 flex items-center justify-end gap-2">
                    <div className={`w-6 h-6 flex items-center justify-center ${getIconBg(event.type)} rounded-md`}>
                      {getIcon(event.type)}
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-thin text-gray-800">{event.type}</span>
                      <span className="text-gray-400 text-xs">{formatTime(event.time)}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
