import { supabase } from "@/app/lib/supabase/client";
import AttendanceButtons from "@/app/componentes/AttendanceButtons";
import ResumenActividades from "@/app/componentes/ResumenActividad";
import LogOutButton from "@/app/componentes/LogOutButton";
import CheckUserIdClient from "@/app/componentes/CheckUserIdCliente";

export default async function Dashboard({ params }) {
    const paramsCorrect = await params
    const userId = paramsCorrect.id;

    const { data: user, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

    if (error) return <p>Error cargando usuario.</p>;

    return (
        <div className="min-h-screen flex flex-col items-center justify-between bg-gray-100 py-6">
            <CheckUserIdClient userId={userId} /> {/* <-- control de acceso */}
        <main className="w-full flex-1 flex flex-col items-center justify-center gap-5 px-6">
            <div className="relative bg-white shadow-xl rounded-2xl p-10 space-y-6 font-sans w-full max-w-lg">

                <LogOutButton />

                <h2 className="text-2xl font-bold text-gray-900 text-center">
                    Hola, {user.nombre} {user.apellido}
                </h2>

                <p className="text-gray-600 text-md text-center">
                    Click para marcar tu actividad.
                </p>

                <AttendanceButtons userId={userId} />
            </div>

            <div className="w-full max-w-4xl mt-6">
                <ResumenActividades userId={userId} />
            </div>
        </main>

        <footer className="text-gray-500 text-sm text-center py-4">
            ©2025 Denzo Studios
        </footer>
        </div>
    );
}
