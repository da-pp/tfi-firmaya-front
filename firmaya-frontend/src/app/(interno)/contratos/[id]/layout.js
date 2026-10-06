"use client";

// Layout común de un contrato: carga el contrato (GET /api/contratos/{id}),
// muestra las pestañas y debajo la pestaña elegida.
// Las pestañas leen el contrato con useContrato().

import { useParams } from "next/navigation";
import ContractTabs from "@/components/ContractTabs";
import Alert from "@/components/Alert";
import { ContratoContext } from "@/components/ContratoContext";
import { useDatos } from "@/lib/api";

export default function ContratoLayout({ children }) {
  const { id } = useParams();
  const { datos: contrato, error, cargando, recargar } = useDatos(`/contratos/${id}`);

  if (cargando) return <p className="texto-suave">Cargando contrato…</p>;

  if (error) {
    return <Alert tipo="error" texto={error.estado === 404 ? "Contrato no encontrado." : error.message} />;
  }

  return (
    <ContratoContext.Provider value={{ contrato, recargar }}>
      <ContractTabs id={id} />
      {children}
    </ContratoContext.Provider>
  );
}
