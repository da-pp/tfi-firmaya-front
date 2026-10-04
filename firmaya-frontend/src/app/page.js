import { redirect } from "next/navigation";

// La raíz del sitio lleva directamente al inicio de sesión (CU-19)
export default function Inicio() {
  redirect("/login");
}
