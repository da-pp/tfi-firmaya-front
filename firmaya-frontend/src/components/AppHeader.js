"use client";

// Barra superior para usuarios internos.
// Panel principal · BackOffice (solo Administrador) · nombre del usuario → Mi Perfil

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText } from "lucide-react";
import { cerrarSesion } from "@/data/session";
import { nombreCompleto } from "@/data/users";

export default function AppHeader({ usuario }) {
  const router = useRouter();
  const [menuAbierto, setMenuAbierto] = useState(false);

  function salir() {
    cerrarSesion();
    router.push("/login");
  }

  return (
    <header style={{ background: "#fff", borderBottom: "1px solid var(--borde)" }}>
      <div className="pagina separado" style={{ paddingTop: 12, paddingBottom: 12 }}>
        <div className="fila" style={{ gap: 24 }}>
          <Link href="/panel" className="fila" style={{ fontWeight: 700 }}>
            <span className="titulo-pagina-icono" style={{ width: 30, height: 30, borderRadius: 8 }}>
              <FileText size={15} />
            </span>
            FirmaYA
          </Link>
          <Link href="/panel" className="btn-enlace">Panel principal</Link>
          {usuario.rol === "Administrador" && (
            <Link href="/backoffice/usuarios" className="btn-enlace">BackOffice</Link>
          )}
        </div>

        <div style={{ position: "relative" }}>
          <button className="btn" onClick={() => setMenuAbierto(!menuAbierto)}>
            {nombreCompleto(usuario)} · <span className="texto-suave">{usuario.rol}</span>
          </button>
          {menuAbierto && (
            <div className="card" style={{ position: "absolute", right: 0, top: 42, padding: 8, zIndex: 20, minWidth: 160 }}>
              <button className="btn btn-bloque" style={{ border: "none", justifyContent: "flex-start" }} onClick={salir}>
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
