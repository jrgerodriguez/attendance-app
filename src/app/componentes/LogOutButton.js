'use client'

import { useRouter } from "next/navigation";

export default function LogOutButton() {
    
    const router = useRouter();

    const handleLogout = () => {
        localStorage.clear();
        router.push("/");
    }

    return (
        <button 
            href="/"
            onClick={handleLogout} 
            className="absolute top-4 right-4 text-red-700 text-sm cursor-pointer font-semibold hover:text-red-800">
                Cerrar Sesión
        </button>
    )
}