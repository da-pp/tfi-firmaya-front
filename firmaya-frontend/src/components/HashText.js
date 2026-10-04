"use client";

// Muestra un hash recortado con botón de copia rápida (CU-11).

import { useState } from "react";
import { Copy } from "lucide-react";
import { copiarAlPortapapeles, hashCorto } from "@/lib/utils";

export default function HashText({ hash }) {
  const [copiado, setCopiado] = useState(false);

  function copiar(evento) {
    evento.stopPropagation(); // para no expandir la fila de la tabla
    copiarAlPortapapeles(hash);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <span className="fila">
      <span className="mono texto-tenue" title={hash}>
        {hashCorto(hash)}
      </span>
      <button className="btn btn-chico" onClick={copiar} title="Copiar hash">
        <Copy size={12} />
      </button>
      {copiado && <span className="texto-chico" style={{ color: "var(--verde)" }}>Hash copiado al portapapeles.</span>}
    </span>
  );
}
