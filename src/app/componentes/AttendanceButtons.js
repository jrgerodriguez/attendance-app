"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/app/lib/supabase/client";
import { LogIn, LogOut, Hamburger, Coffee   } from "lucide-react";
import Cronometro from "./Cronometro";

export default function AttendanceButtons({ userId }) {
  const [entradaMarcada, setEntradaMarcada] = useState(false);
  const [loadingEntrada, setLoadingEntrada] = useState(false);
  const [loadingSalida, setLoadingSalida] = useState(false);
  const [lunchActivo, setLunchActivo] = useState(false);
  const [loadingLunch, setLoadingLunch] = useState(false);
  const [breakActivo, setBreakActivo] = useState(false);
  const [loadingBreak, setLoadingBreak] = useState(false);
  const [message, setMessage] = useState("");

  // ------------------ FUNCIONES ------------------
  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 3000);
  };

const getLocalDateTime = () => {
  const now = new Date();

  // Forzar zona horaria exacta
  const options = {
    timeZone: "America/El_Salvador",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  };

  const formatter = new Intl.DateTimeFormat("en-CA", options);
  const formatted = formatter.format(now); // "2025-11-23, 23:15:00"

  const [date, time] = formatted.split(", ");
  
  return {
    localDate: date,
    localDateTime: `${date}T${time}`,
  };
};


  // ------------------ VERIFICAR ENTRADA PENDIENTE ------------------
  useEffect(() => {
    const checkEstado = async () => {
      const { localDate } = getLocalDateTime();

      const { data: lastEvent, error } = await supabase
        .from("attendance_events")
        .select("*")
        .eq("user_id", userId)
        .eq("date", localDate)
        .order("event_time", { ascending: false })
        .limit(1)
        .single();

      if (error || !lastEvent) {
        setEntradaMarcada(false);
        setLunchActivo(false);
        setBreakActivo(false);
        return;
      }

      // Entrada se considera activa mientras no sea clock_out
      const entradaActiva = lastEvent.event_type !== "clock_out";
      setEntradaMarcada(entradaActiva);

      // Lunch activo si el último evento fue lunch_in
      setLunchActivo(lastEvent.event_type === "lunch_in");

      // Break activo si el último evento fue break_in
      setBreakActivo(lastEvent.event_type === "break_in");
    };

      checkEstado();
  }, [userId]);

  // ------------------ ENTRADA ------------------
  const marcarEntrada = async () => {
    setLoadingEntrada(true);
    setMessage("");

    const { localDate, localDateTime } = getLocalDateTime();

    const { error } = await supabase
      .from("attendance_events")
      .insert([{ user_id: userId, event_type: "clock_in", date: localDate, event_time: localDateTime}]);

    if (error) {
      showMessage("Error al marcar entrada.");
      console.log(error)
    } else {
      showMessage("¡Entrada marcada correctamente!");
      setEntradaMarcada(true);
    }

    setLoadingEntrada(false);
  };

  // ------------------ SALIDA ------------------
  const marcarSalida = async () => {
    setLoadingSalida(true);
    setMessage("");

    const { localDate, localDateTime } = getLocalDateTime();

    // Verificar si hay clock_in pendiente
    const { data: lastEvent, error } = await supabase
        .from("attendance_events")
        .select("*")
        .eq("user_id", userId)
        .eq("date", localDate)
        .order("event_time", { ascending: false })
        .limit(1)
        .single();

    if (error) {
      showMessage("Error al verificar entrada pendiente.");
      setLoadingSalida(false);
      return;
    }

    if (lastEvent?.event_type === "lunch_in") {
      showMessage("Debes finalizar el lunch antes de marcar salida.");
      setLoadingSalida(false);
      return;
    }

    if (lastEvent?.event_type === "break_in") {
      showMessage("Debes finalizar el break antes de marcar salida.");
      setLoadingSalida(false);
      return;
    }

    if (!lastEvent || 
        (lastEvent.event_type !== "clock_in" && 
        lastEvent.event_type !== "lunch_out" &&
        lastEvent.event_type !== "break_out")) {
      showMessage("No hay entrada pendiente para marcar salida.");
      setLoadingSalida(false);
      return;
    }

    const { error: insertError } = await supabase
      .from("attendance_events")
      .insert([{ user_id: userId, event_type: "clock_out", date: localDate, event_time: localDateTime}]);

    if (insertError) {
      showMessage("Error al marcar salida.");
    } else {
      showMessage("Salida marcada correctamente!");
      setEntradaMarcada(false);
    }

    setLoadingSalida(false);
  };

// ------------------ LUNCH ------------------
const toggleLunch = async () => {
  setLoadingLunch(true);
  setMessage("");

  const { localDate, localDateTime } = getLocalDateTime();

  // Obtener último evento
  const { data: lastEvent, error: lastErr } = await supabase
    .from("attendance_events")
    .select("*")
    .eq("user_id", userId)
    .eq("date", localDate)
    .order("event_time", { ascending: false })
    .limit(1)
    .single();

  if (lastErr) {
    showMessage("No has marcado una entrada o un error ha ocurrido.");
    setLoadingLunch(false);
    return;
  }

  // Lógica para lunch
  const validForLunchIn =
    lastEvent &&
    (lastEvent.event_type === "clock_in" ||
     lastEvent.event_type === "lunch_out") ||
     lastEvent.event_type === "break_out";

  const validForLunchOut =
    lastEvent && lastEvent.event_type === "lunch_in";

  // Si quiere iniciar lunch

  if(lastEvent.event_type === "break_in") {
    showMessage("Debes terminar el break pendiente antes de comenzar lunch.");
    setLoadingLunch(false);
    return;
  }

  if (!lunchActivo && !validForLunchIn) {
    showMessage("Debes marcar entrada antes del lunch.");
    setLoadingLunch(false);
    return;
  }

  // Si quiere terminar lunch
  if (lunchActivo && !validForLunchOut) {
    showMessage("No puedes finalizar lunch porque no está iniciado.");
    setLoadingLunch(false);
    return;
  }

  const eventType = lunchActivo ? "lunch_out" : "lunch_in";

  // Registrar evento
  const { error } = await supabase
    .from("attendance_events")
    .insert([
      {
        user_id: userId,
        event_type: eventType,
        date: localDate,
        event_time: localDateTime,
      },
    ]);

  if (error) {
    showMessage("Error al marcar lunch.");
  } else {
    if (eventType === "lunch_in") {
      showMessage("Lunch iniciado 🍔");
      setLunchActivo(true);

      // Mantener estado de entrada activa
      setEntradaMarcada(true);

    } else {
      showMessage("Lunch finalizado 🍽️");
      setLunchActivo(false);
      setEntradaMarcada(true);
    }
  }

  setLoadingLunch(false);
};

  // ------------------ BREAK ------------------
  const toggleBreak = async () => {
    setLoadingBreak(true)
    setMessage("")

    const { localDate, localDateTime } = getLocalDateTime();

    // Obtener último evento
    const { data: lastEvent, error: lastErr } = await supabase
      .from("attendance_events")
      .select("*")
      .eq("user_id", userId)
      .eq("date", localDate)
      .order("event_time", { ascending: false })
      .limit(1)
      .single();

    if (lastErr) {
      showMessage("No has marcado una entrada o un error ha ocurrido.");
      setLoadingBreak(false);
      return;
    }

  // Lógica para lunch
  const validForBreakIn =
    lastEvent &&
    (lastEvent.event_type === "clock_in" ||
     lastEvent.event_type === "break_out") ||
     lastEvent.event_type === "lunch_out";

  const validForBreakOut =
    lastEvent && lastEvent.event_type === "break_in";

// Si quiere iniciar break
  if(lastEvent.event_type === "lunch_in") {
    showMessage("Debes terminar el lunch pendiente antes de comenzar break.");
    setLoadingBreak(false);
    return;
  }

  if(!breakActivo && !validForBreakIn) {
    showMessage("Debes marcar entrada antes del break.")
    setLoadingBreak(false)
    return
  }


// Si quiere terminar break
  if(breakActivo && !validForBreakOut) {
    showMessage("No puedes finalizar break porque no esta iniciado.")
    setLoadingBreak(false)
    return
  }

    const eventType = breakActivo ? "break_out" : "break_in";

  // Registrar evento
    const { error } = await supabase
      .from("attendance_events")
      .insert([
        {
          user_id: userId,
          event_type: eventType,
          date: localDate,
          event_time: localDateTime,
        },
      ]);

      if(error) {
        showMessage("Error al marcar break")
      } else {
        if(eventType === "break_in") {
          showMessage("☕ Break Iniciado")
          setBreakActivo(true)

        // Mantener estado de entrada activa
        setEntradaMarcada(true);

        } else {
          showMessage("🧑‍💻 Break Finalizado")
          setBreakActivo(false)
          setEntradaMarcada(true);
        }
      }

      setLoadingBreak(false);
  }

  return (
    <div className="flex flex-col justify-center items-center gap-4 w-full max-w-xs mx-auto">
      <button
        onClick={marcarEntrada}
        disabled={entradaMarcada || loadingEntrada}
        className={`cursor-pointer w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl shadow-md transition-all duration-200 transform
          ${entradaMarcada || loadingEntrada
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-green-900 text-white hover:bg-green-800 hover:scale-105"
          }`}
      >
        <LogIn className="w-5 h-5" />
        {loadingEntrada ? "Marcando..." : "Entrada"}
      </button>

      <button
        onClick={marcarSalida}
        disabled={loadingSalida || !entradaMarcada || breakActivo || lunchActivo}
        className="cursor-pointer w-full flex items-center justify-center gap-2 bg-red-600 text-white px-5 py-3 rounded-xl shadow-md transition-all duration-200 transform hover:bg-red-500 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <LogOut className="w-5 h-5" />
        {loadingSalida ? "Marcando..." : "Salida"}
      </button>

      <button
        onClick={toggleLunch}
        disabled={loadingLunch || !entradaMarcada || breakActivo}
        className="cursor-pointer w-full flex items-center justify-center gap-2 bg-yellow-600 text-white px-5 py-3 rounded-xl shadow-md transition-all duration-200 transform hover:bg-yellow-500 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Hamburger className="w-5 h-5" />
        {loadingLunch ? "Marcando..." : lunchActivo ? "End Lunch" : "Lunch"}
      </button>

      <button
        onClick={toggleBreak}
        disabled={loadingBreak || !entradaMarcada || lunchActivo}
        className="cursor-pointer w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl shadow-md transition-all duration-200 transform hover:bg-blue-500 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Coffee  className="w-5 h-5" />
        {loadingBreak ? "Marcando..." : breakActivo ? "End Break" : "Break"}
      </button>

      <Cronometro userId={userId} lunchActivo={lunchActivo} breakActivo={breakActivo}/>

      {message && (
        <p className="text-center text-sm px-4 py-3 rounded-xl border border-green-300 bg-green-100 w-full animate-fade-in text-green-700">
          {message}
        </p>
      )}
    </div>
  );
}