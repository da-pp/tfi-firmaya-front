"use client";

// Navegación del BackOffice (solo Administrador): Usuarios · Plantillas · Actividad · Auditoría

import Link from "next/link";
import { usePathname } from "next/navigation";

const SECCIONES = [
  { texto: "Gestión de Usuarios", href: "/backoffice/usuarios" },
  { texto: "Gestión de Plantillas", href: "/backoffice/plantillas" },
  { texto: "Panel de Actividad", href: "/backoffice/actividad" },
  { texto: "Registro de Auditoría", href: "/backoffice/auditoria" },
];

export default function BackofficeNav() {
  const ruta = usePathname();

  return (
    <nav className="pestanas">
      {SECCIONES.map((s) => (
        <Link key={s.href} href={s.href} className={ruta === s.href ? "pestana pestana-activa" : "pestana"}>
          {s.texto}
        </Link>
      ))}
    </nav>
  );
}
