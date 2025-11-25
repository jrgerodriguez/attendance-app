"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase/client";
import { Clock, LogIn, LogOut, Hamburger, Coffee, RefreshCw } from "lucide-react";

export default function ResumenActividades({ userId }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("attendance_events")
      .select("*")
      .eq("user_id", userId)
      .order("event_time", { ascending: false })
      .limit(20);

    if (!error) {
      const events = [];
      data.forEach((act) => {
        if (act.event_type === "clock_out") events.push({ id: `out-${act.id}`, type: "Salida", time: act.event_time, date: act.date });
        if (act.event_type === "clock_in") events.push({ id: `in-${act.id}`, type: "Entrada", time: act.event_time, date: act.date });
        if (act.event_type === "lunch_in") events.push({ id: `in-${act.id}`, type: "Lunch Iniciado", time: act.event_time, date: act.date });
        if (act.event_type === "lunch_out") events.push({ id: `in-${act.id}`, type: "Lunch Terminado", time: act.event_time, date: act.date });
        if (act.event_type === "break_in") events.push({ id: `in-${act.id}`, type: "Break Iniciado", time: act.event_time, date: act.date });
        if (act.event_type === "break_out") events.push({ id: `in-${act.id}`, type: "Break Terminado", time: act.event_time, date: act.date });
      });
      events.sort((a, b) => {
        if (!a.time || !b.time) return 0;
        return new Date(b.time) - new Date(a.time);
      });
      setActivities(events);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchActivities();
  }, [userId]);

  const formatDate = (dateString) => {
    if (!dateString || typeof dateString !== "string") return "";
    const date = new Date(dateString + "T00:00:00");
    return date.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
  };

const formatTime = (isoString) => {
  if (!isoString || typeof isoString !== "string") return "Pendiente";

  // Limpia el string
  let clean = isoString
    .replace("+00:00", "")
    .replace("Z", "")
    .split(".")[0];

  // Si trae fecha, solo agarramos la hora
  if (clean.includes("T")) {
    clean = clean.split("T")[1];
  }

  // Ahora convertimos a 12 horas
  const [hour, minute, second] = clean.split(":");
  let h = parseInt(hour, 10);
  const ampm = h >= 12 ? "PM" : "AM";

  h = h % 12;
  if (h === 0) h = 12;

  return `${h}:${minute}:${second} ${ampm}`;
};


  const getIcon = (type) => {
    switch (type) {
      case "Entrada":
        return <LogIn className="w-4 h-4 text-green-600" />;
      case "Salida":
        return <LogOut className="w-4 h-4 text-red-600" />;
      case "Lunch Iniciado":
      case "Lunch Terminado":
        return <Hamburger className="w-4 h-4 text-yellow-600" />;
      case "Break Iniciado":
      case  "Break Terminado":
        return <Coffee className="w-4 h-4 text-blue-600" />;
      default:
        return null;
    }
  };

    const getIconBg = (type) => {
    switch (type) {
      case "Entrada":
        return "bg-green-100";
      case "Salida":
        return "bg-red-100";
      case "Lunch Iniciado":
      case "Lunch Terminado":
        return "bg-yellow-100";
      case "Break Iniciado":
      case "Break Terminado":
        return "bg-blue-100";
      default:
        return "bg-gray-100";
    }
  };


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
