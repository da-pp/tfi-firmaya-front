"use client";

// CU-10 – Descargar contrato firmado en PDF (usuarios internos)

import { useParams } from "next/navigation";
import { Download } from "lucide-react";
import PageTitle from "@/components/PageTitle";
import PdfDownload from "@/components/PdfDownload";
import { getContrato } from "@/data/contracts";
import { useUsuario } from "@/data/session";

export default function PdfPage() {
  const { id } = useParams();
  const { usuario } = useUsuario();
  const contrato = getContrato(id);

  if (!usuario) return null;

  return (
    <>
      <PageTitle icono={Download} titulo="Descargar contrato firmado en PDF" />
      <PdfDownload contrato={contrato} usuario={usuario.email} />
    </>
  );
}
