"use client";

// Layout del BackOffice: solo para el rol Administrador.

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import BackofficeNav from "@/components/BackofficeNav";
import { useUsuario } from "@/data/session";

export default function BackofficeLayout({ children }) {
  const router = useRouter();
  const { usuario } = useUsuario();
  const esAdmin = usuario && usuario.rol === "Administrador";

  useEffect(() => {
    if (usuario && !esAdmin) router.replace("/panel");
  }, [usuario, esAdmin, router]);

  if (!esAdmin) return null;

  return (
    <>
      <BackofficeNav />
      {children}
    </>
  );
}
