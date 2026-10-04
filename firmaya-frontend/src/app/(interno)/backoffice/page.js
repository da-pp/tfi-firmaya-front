import { redirect } from "next/navigation";

// /backoffice abre directamente la Gestión de Usuarios
export default function BackofficePage() {
  redirect("/backoffice/usuarios");
}
