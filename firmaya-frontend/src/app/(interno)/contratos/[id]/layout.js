"use client";

// Layout común de un contrato: muestra las pestañas y debajo la pestaña elegida.

import { useParams } from "next/navigation";
import ContractTabs from "@/components/ContractTabs";
import Alert from "@/components/Alert";
import { getContrato } from "@/data/contracts";

export default function ContratoLayout({ children }) {
  const { id } = useParams();
  const contrato = getContrato(id);

  if (!contrato) {
    return <Alert tipo="error" texto="Contrato no encontrado." />;
  }

  return (
    <>
      <ContractTabs id={id} />
      {children}
    </>
  );
}
