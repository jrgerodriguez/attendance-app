'use client'
import { useState } from "react";
import { useRouter } from "next/navigation";
import { checkEmail } from "./lib/auth/checkEmail";
import Image from "next/image";

export default function Login() {

  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
   const [message, setMessage] = useState("") 
  const router = useRouter()

  const showMessage = (text) => {
    setMessage(text);

    setTimeout(() => {
       setMessage("")
    }, 3000);
  }

  const handleLogin = async () => {
    setLoading(true)

    if(!email) {
      showMessage("Ingresa tu correo electrónico."); 
      setLoading(false)
      return
    }

    const user = await checkEmail(email);

    if(!user) {
      showMessage("Este correo no existe. Por favor registrate.");      
      setTimeout(() => {
        router.push("/registrarse");
      }, 2000);

      return
    }

    localStorage.setItem("user_id", user.id);
    router.push(`/dashboard/${user.id}`);

  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-between bg-gray-100 py-6">
      <main className="w-full max-w-md flex-1 flex items-center">
        <div className="bg-white shadow-xl rounded-2xl p-10 space-y-6 font-sans w-full">
        <Image 
          src="/images/logo.png"
          alt="Mi imagen"
          width={500}
          height={400}
          className="rounded-2xl"
        />
          <h2 className="text-2xl font-bold text-gray-900 text-center">
            Bienvenido
          </h2>

          <p className="text-gray-600 text-md text-center">
            Ingresa tu correo electrónico para continuar.
          </p>

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
              className=" w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className={`w-full bg-black text-white py-3 rounded-xl text-md font-medium hover:bg-gray-900 transition-all cursor-pointer
              ${loading 
              ? "bg-gray-400 text-gray-200 cursor-not-allowed" 
              : "bg-black text-white hover:bg-gray-900"
              }`
          }
          >
            {loading ? "Ingresando..." : "Iniciar Sesión"}
          </button>

          {/* Mensaje dinámico */}
          {message && (
            <p className="text-red-700 text-center text-sm px-4 py-3 rounded-xl border border-red-400 bg-red-100 
               w-full animate-fade-in">
              {message}
            </p>
          )}

          <a
            href="/registrarse"
            className="block text-gray-600 text-sm text-center underline hover:text-gray-900 transition"
          >
            Registrarse
          </a>

        </div>
      </main>

      <footer className="text-gray-500 text-sm mt-6">
        ©2025 Denzo Studios
      </footer>
    </div>
  );
}
