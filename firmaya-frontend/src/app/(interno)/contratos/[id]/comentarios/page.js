"use client";

// CU-06 – Añadir comentarios y observaciones (usuarios internos)

import { MessageSquare } from "lucide-react";
import PageTitle from "@/components/PageTitle";
import ContractHeader from "@/components/ContractHeader";
import CommentsPanel from "@/components/CommentsPanel";
import Alert from "@/components/Alert";
import { useContrato } from "@/components/ContratoContext";
import { useUsuario } from "@/data/session";
import { api, useDatos } from "@/lib/api";

export default function ComentariosPage() {
  const { usuario } = useUsuario();
  const { contrato } = useContrato();
  const ruta = `/contratos/${contrato.idContrato}/comentarios`;
  const { datos, error, recargar } = useDatos(ruta);

  if (!usuario) return null;

  // Comentan: Abogado, Agente (internos), Firmante y Revisor. No en contratos archivados.
  const rolPermite = usuario.rol === "Abogado" || usuario.rol === "Agente Inmobiliario";
  const puedeComentar = rolPermite && contrato.estado !== "Archivado";

  // Pasos 13-18: el backend registra el comentario y notifica a las partes
  async function publicar(texto, textoSeleccionado) {
    const respuesta = await api(ruta, { metodo: "POST", cuerpo: { texto, textoSeleccionado: textoSeleccionado || null } });
    await recargar();
    return respuesta.mensaje;
  }

  return (
    <>
      <PageTitle icono={MessageSquare} titulo="Agregar comentarios y observaciones" />
      {error && <Alert tipo="error" texto={error.message} />}
      <ContractHeader contrato={contrato} extra={[{ etiqueta: "Comentarios", valor: datos ? datos.totalComentarios : "…" }]} />
      <CommentsPanel
        contenido={contrato.contenido}
        comentarios={datos ? datos.comentarios : []}
        puedeComentar={puedeComentar}
        mensajeSinPermiso={rolPermite ? "" : "No puede añadir comentarios con su rol actual."}
        onPublicar={publicar}
      />
    </>
  );
}
