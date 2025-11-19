'use client'
import { useState } from "react";
import { supabase } from "../lib/supabase/client";
import { useRouter } from "next/navigation";
import { checkEmail } from "../lib/auth/checkEmail";

export default function Registrarse() {

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("") 
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const showMessage = (text) => {
    setMessage(text);

    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  const registerUser = async () => {

    setLoading(true)
    
    if (!firstName || !lastName || !email) {
      showMessage("Por favor, completa todos los campos.");
      setLoading(false)
      return;
    }
    
    const existingUser = await checkEmail(email);

    if (existingUser) {
      showMessage("Este correo ya está registrado. Intenta iniciar sesión.");
      setLoading(false)
      return;
    }
    
    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          nombre: firstName,
          apellido: lastName,
          email: email
        }
      ])
      .select()
      .single();

    if (error) {
      console.error("Error al registrar:", error);
      showMessage("Hubo un error al registrarte.");
      setLoading(false)
      return;
    }

    localStorage.setItem("user_id", data.id);
    router.push(`/dashboard/${data.id}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-between bg-gray-100 py-6">
      <main className="w-full max-w-md flex-1 flex items-center">
        <div className="bg-white shadow-xl rounded-2xl p-10 space-y-6 font-sans w-full">
          <h2 className="text-2xl font-bold text-gray-900 text-center">
            Registrarse
          </h2>

          <p className="text-gray-600 text-md text-center">
            Completa tus datos para crear tu cuenta.
          </p>

          {/* Nombre */}
          <div className="space-y-3">
            <label htmlFor="firstName" className="block text-gray-700 text-sm font-medium">
              Nombre
            </label>
            <input
              required
              id="firstName"
              type="text"
              placeholder="Tu nombre"
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 text-gray-900 
              focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
            />
          </div>

          {/* Apellido */}
          <div className="space-y-3">
            <label htmlFor="lastName" className="block text-gray-700 text-sm font-medium">
              Apellido
            </label>
            <input
              required
              id="lastName"
              type="text"
              placeholder="Tu apellido"
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 text-gray-900 
              focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
            />
          </div>

          {/* Correo */}
          <div className="space-y-3">
            <label htmlFor="email" className="block text-gray-700 text-sm font-medium">
              Correo electrónico
            </label>
            <input
              required
              id="email"
              type="email"
              placeholder="tucorreo@email.com"
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 text-gray-900 
              focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
            />
          </div>

          {/* Botón */}
          <button
            onClick={registerUser}
            disabled={loading}
            className={`w-full bg-black text-white py-3 rounded-xl text-md font-medium hover:bg-gray-900 transition-all cursor-pointer
              ${loading 
              ? "bg-gray-400 text-gray-200 cursor-not-allowed" 
              : "bg-black text-white hover:bg-gray-900"
              }`
          }
          >
            {loading ? "Registrando..." : "Registrarse"}
          </button>

          {/* Mensaje dinámico */}
          {message && (
            <p className="text-red-700 text-center text-sm px-4 py-3 rounded-xl border border-red-400 bg-red-100 
               w-full animate-fade-in">
              {message}
            </p>
          )}

          <a
            href="/"
            className="block text-gray-600 text-sm text-center underline hover:text-gray-900 transition"
          >
            Ya tengo una cuenta
          </a>

        </div>
      </main>

      <footer className="text-gray-500 text-sm mt-6">
        ©2025 Denzo Studios
      </footer>
    </div>
  );
}
