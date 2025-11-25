'use client'
import { useState, useEffect } from "react"
import { supabase } from "@/app/lib/supabase/client";

export default function Cronometro({userId, lunchActivo, breakActivo}) {

    const [isActive, setIsActive] = useState(false)
    const [startTime, setStartTime] = useState(null);
    const [elapse, setElapse] = useState("00:00:00")

    const getLocalDate = () => {
        const now = new Date();
        const options = {
        timeZone: "America/El_Salvador",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        };
        return new Intl.DateTimeFormat("en-CA", options).format(now);
  };

  // Cargar el último evento para saber si hay uno activo
  useEffect(() => {
    const loadEvent = async () => {
        const {data: lastEvent} = await supabase
            .from("attendance_events")
            .select("*")
            .eq("user_id", userId)
            .eq("date", getLocalDate())
            .order("event_time", {ascending: false})
            .limit(1)
            .single();

            if(lastEvent && (lastEvent.event_type === "lunch_in" || lastEvent.event_type === "break_in")) {
                setIsActive(true)
                const utcDate = new Date(lastEvent.event_time);
                const localDate = new Date(utcDate.getTime() + 6 * 60 * 60 * 1000);
                setStartTime(localDate.getTime());
            } else {
                setIsActive(false)
            }
    }
    loadEvent()
  }, [userId, lunchActivo, breakActivo])

    useEffect(() => {
        if (lunchActivo || breakActivo) {
            setIsActive(true);
            setStartTime(Date.now());
        } else {
            setIsActive(false);
            setElapse("00:00:00")
        }
    }, [lunchActivo, breakActivo]);  

  // Cronómetro que actualiza cada segundo
  useEffect(() => {
    if(!isActive || !startTime) return;

    const interval = setInterval(() => {
      const diff = Date.now() - startTime;

      const hours = String(Math.floor(diff / 1000 / 60 / 60)).padStart(2, "0");
      const minutes = String(Math.floor((diff / 1000 / 60) % 60)).padStart(2, "0");
      const seconds = String(Math.floor((diff / 1000) % 60)).padStart(2, "0");

      setElapse(`${hours}:${minutes}:${seconds}`);

      
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive, startTime])

    return (
        <div className="flex flex-col font-sans justify-center text-center bg-[#0b2545] w-full gap-2 rounded-xl shadow-md px-5 py-3 text-white">
            <h2 className="text-lg">Tiempo Fuera</h2>
            <p className="text-5xl">{elapse}</p>
        </div>
    )
}