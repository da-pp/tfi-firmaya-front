"use client";

// Pestañas del contrato según el mapa de navegación:
// Contrato (editor y pestañas) → Comentarios · Invitar · Estado

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ContractTabs({ id }) {
  const ruta = usePathname();
  const base = `/contratos/${id}`;

  const pestanas = [
    { texto: "Editor", href: `${base}/editar` },
    { texto: "Comentarios", href: `${base}/comentarios` },
    { texto: "Invitar", href: `${base}/invitar` },
    { texto: "Estado", href: `${base}/estado` },
  ];

  return (
    <nav className="pestanas">
      {pestanas.map((p) => {
        const activa = ruta === p.href || ruta.startsWith(p.href + "/");
        return (
          <Link key={p.href} href={p.href} className={activa ? "pestana pestana-activa" : "pestana"}>
            {p.texto}
          </Link>
        );
      })}
    </nav>
  );
}
