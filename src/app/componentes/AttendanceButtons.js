"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/app/lib/supabase/client";
import { LogIn, LogOut } from "lucide-react";

export default function AttendanceButtons({ userId }) {
  const [entradaMarcada, setEntradaMarcada] = useState(false);
  const [loadingEntrada, setLoadingEntrada] = useState(false);
  const [loadingSalida, setLoadingSalida] = useState(false);
  const [message, setMessage] = useState("");

  // ------------------ FUNCIONES ------------------
  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 3000);
  };

  const getLocalDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    const localDate = `${year}-${month}-${day}`;
    const localTime = `${hours}:${minutes}:${seconds}`;
    const localDateTime = `${localDate} ${localTime}`;

    return { localDate, localDateTime };
  };

  // ------------------ VERIFICAR ENTRADA PENDIENTE ------------------
  useEffect(() => {
    const checkEntrada = async () => {
      const { localDate } = getLocalDateTime();

      const { data: pendingEntry } = await supabase
        .from("attendance")
        .select("*")
        .eq("user_id", userId)
        .eq("date", localDate)
        .is("clock_out", null)
        .single();

      if (pendingEntry) {
        setEntradaMarcada(true);
        showMessage("Ya tienes entrada marcada. Esperando salida...");
      }
    };

    checkEntrada();
  }, [userId]);

  // ------------------ ENTRADA ------------------
  const marcarEntrada = async () => {
    setLoadingEntrada(true);
    setMessage("");

    const { localDate, localDateTime } = getLocalDateTime();

    const { error } = await supabase
      .from("attendance")
      .insert([{ user_id: userId, date: localDate, clock_in: localDateTime }]);

    if (error) {
      showMessage("Error al marcar entrada.");
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

    const { data: lastEntry, error: fetchError } = await supabase
      .from("attendance")
      .select("*")
      .eq("user_id", userId)
      .eq("date", localDate)
      .is("clock_out", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (fetchError || !lastEntry) {
      showMessage("No hay entrada pendiente para marcar salida.");
      setLoadingSalida(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("attendance")
      .update({ clock_out: localDateTime })
      .eq("id", lastEntry.id);

    if (updateError) {
      showMessage("Error al marcar salida.");
    } else {
      showMessage("Salida marcada correctamente!");
      setEntradaMarcada(false);
    }

    setLoadingSalida(false);
  };

  return (
    <div className="flex flex-col justify-center items-center gap-4 w-full max-w-xs mx-auto">
      <button
        onClick={marcarEntrada}
        disabled={entradaMarcada || loadingEntrada}
        className={`cursor-pointer w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl shadow-md transition-all duration-200 transform
          ${entradaMarcada || loadingEntrada
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-gray-900 text-white hover:bg-gray-800 hover:scale-105"
          }`}
      >
        <LogIn className="w-5 h-5" />
        {loadingEntrada ? "Marcando..." : "Entrada"}
      </button>

      <button
        onClick={marcarSalida}
        disabled={loadingSalida}
        className="cursor-pointer w-full flex items-center justify-center gap-2 bg-red-600 text-white px-5 py-3 rounded-xl shadow-md transition-all duration-200 transform hover:bg-red-500 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <LogOut className="w-5 h-5" />
        {loadingSalida ? "Marcando..." : "Salida"}
      </button>
      {message && (
        <p className="text-center text-sm px-4 py-3 rounded-xl border border-green-300 bg-green-100 w-full animate-fade-in text-green-700">
          {message}
        </p>
      )}
    </div>
  );
}
