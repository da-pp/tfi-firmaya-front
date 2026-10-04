"use client";

// Layout de las pantallas para usuarios internos (carpeta "(interno)").
// Los paréntesis hacen que "interno" NO forme parte de la URL.
// Si no hay sesión iniciada, redirige al login.

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import { useUsuario } from "@/data/session";

export default function InternoLayout({ children }) {
  const router = useRouter();
  const { usuario, cargado } = useUsuario();

  useEffect(() => {
    if (cargado && !usuario) router.replace("/login");
  }, [cargado, usuario, router]);

  if (!usuario) return null;

  return (
    <>
      <AppHeader usuario={usuario} />
      <main className="pagina">{children}</main>
    </>
  );
}
