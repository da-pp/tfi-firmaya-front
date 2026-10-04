"use client";

// Pestañas del contrato según el mapa de navegación:
// Contrato (editor y pestañas) → Invitar · Estado · Firmas · Versiones
// Dentro de Versiones: Historial · Comparar · Integridad

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
    { texto: "Firmas", href: `${base}/firmas` },
    { texto: "Versiones", href: `${base}/versiones` },
    { texto: "Descargar PDF", href: `${base}/pdf` },
  ];

  const subPestanasVersiones = [
    { texto: "Historial", href: `${base}/versiones` },
    { texto: "Comparar", href: `${base}/versiones/comparar` },
    { texto: "Integridad", href: `${base}/versiones/integridad` },
  ];

  const enVersiones = ruta.startsWith(`${base}/versiones`);

  return (
    <>
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

      {enVersiones && (
        <nav className="pestanas" style={{ marginTop: -12 }}>
          {subPestanasVersiones.map((p) => (
            <Link key={p.href} href={p.href} className={ruta === p.href ? "pestana pestana-activa" : "pestana"}>
              {p.texto}
            </Link>
          ))}
        </nav>
      )}
    </>
  );
}
