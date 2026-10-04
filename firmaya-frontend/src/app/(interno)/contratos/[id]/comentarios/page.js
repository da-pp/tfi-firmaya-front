"use client";

// CU-06 – Añadir comentarios y observaciones (usuarios internos)

import { useState } from "react";
import { useParams } from "next/navigation";
import { MessageSquare } from "lucide-react";
import PageTitle from "@/components/PageTitle";
import ContractHeader from "@/components/ContractHeader";
import CommentsPanel from "@/components/CommentsPanel";
import { getContrato } from "@/data/contracts";
import { useUsuario } from "@/data/session";
import { nombreCompleto } from "@/data/users";

export default function ComentariosPage() {
  const { id } = useParams();
  const { usuario } = useUsuario();
  const contrato = getContrato(id);
  const [, setActualizar] = useState(0);

  if (!usuario) return null;

  // Comentan: Abogado, Agente (internos), Firmante y Revisor. No en contratos archivados.
  const rolPermite = usuario.rol === "Abogado" || usuario.rol === "Agente Inmobiliario";
  const puedeComentar = rolPermite && contrato.estado !== "Archivado";

  return (
    <>
      <PageTitle icono={MessageSquare} titulo="Agregar comentarios y observaciones" />
      <ContractHeader contrato={contrato} extra={[{ etiqueta: "Comentarios", valor: contrato.comentarios.length }]} />
      <CommentsPanel
        contrato={contrato}
        autor={nombreCompleto(usuario)}
        puedeComentar={puedeComentar}
        mensajeSinPermiso={rolPermite ? "" : "No puede añadir comentarios con su rol actual."}
        onPublicado={() => setActualizar((n) => n + 1)}
      />
    </>
  );
}
