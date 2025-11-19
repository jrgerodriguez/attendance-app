"use client";
import { useState } from "react";
import { supabase } from "@/app/lib/supabase/client";
import { LogOut } from "lucide-react";

export default function SalidaButton({ userId }) {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const showMessage = (text) => {
        setMessage(text);

        setTimeout(() => {
        setMessage("")
        }, 3000);
    }

    async function marcarSalida() {
        setLoading(true);
        setMessage("");

        const now = new Date();

        // Construimos la fecha y hora local manualmente
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        const hours = String(now.getHours()).padStart(2, "0");
        const minutes = String(now.getMinutes()).padStart(2, "0");
        const seconds = String(now.getSeconds()).padStart(2, "0");

        const localDate = `${year}-${month}-${day}`; // yyyy-mm-dd
        const localTime = `${hours}:${minutes}:${seconds}`; // HH:MM:SS
        const localDateTime = `${localDate} ${localTime}`; // yyyy-mm-dd HH:MM:SS

        const { error } = await supabase
            .from("attendance")
            .insert([{ user_id: userId, date: localDate, clock_out: localDateTime }]);

        if (error) {
            showMessage("Error al marcar salida.");
        } else {
            showMessage("Salida marcada correctamente!");
        }

        setLoading(false);
    }

    return (
        <div className="flex flex-col justify-center items-center gap-4">
            <button
                onClick={marcarSalida}
                disabled={loading}
                className="cursor-pointer w-72 flex items-center justify-center gap-2 bg-gray-900 text-white px-5 py-3 rounded-xl shadow hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <LogOut className="w-5 h-5" />
                {loading ? "Marcando..." : "Salida"}
            </button>
            {message && <p className="text-green-700 text-center text-sm px-4 py-3 rounded-xl border border-green-400 bg-green-100 
               w-full animate-fade-in">{message}</p>}
        </div>
    );
}
