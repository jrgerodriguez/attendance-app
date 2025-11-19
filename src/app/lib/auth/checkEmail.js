import { supabase } from "../supabase/client";

export async function checkEmail(email) {
  const { data, error } = await supabase
    .from("users")
    .select("id, email")
    .eq("email", email)
    .single();

  // Si existe un error que no sea "not found"
  if (error && error.code !== "PGRST116") {
    console.error("Error al verificar correo:", error);
    return null;
  }

  return data || null;
}
