"use client";

// CU-04 – Ver contrato como parte invitada (acceso externo con token, sin cuenta)
// Tokens de prueba: acc-juan (Firmante), acc-carlos (Revisor), acc-lucia (Solo lectura),
// acc-archivado (contrato archivado), cualquier otro (enlace inválido).

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Eye, Download, PenLine } from "lucide-react";
import PageTitle from "@/components/PageTitle";
import ContractHeader from "@/components/ContractHeader";
import CommentsPanel from "@/components/CommentsPanel";
import PdfDownload from "@/components/PdfDownload";
import Alert from "@/components/Alert";
import Badge from "@/components/Badge";
import Modal from "@/components/Modal";
import { buscarPorTokenAcceso, versionActual } from "@/data/contracts";

const INACTIVIDAD_MS = 60 * 60 * 1000; // 60 minutos sin actividad
const AVISO_MS = 5 * 60 * 1000; // 5 minutos para responder el aviso

// Barra superior simple para las partes externas
function BarraExterna({ children }) {
  return (
    <>
      <header style={{ background: "#fff", borderBottom: "1px solid var(--borde)" }}>
        <div className="pagina" style={{ paddingTop: 14, paddingBottom: 14, fontWeight: 700 }}>FirmaYA</div>
      </header>
      <main className="pagina">{children}</main>
    </>
  );
}

export default function AccesoPage() {
  const { token } = useParams();
  const encontrado = buscarPorTokenAcceso(token);
  const existe = Boolean(encontrado);

  const [sesionExpirada, setSesionExpirada] = useState(false);
  const [avisoExpiracion, setAvisoExpiracion] = useState(false);
  const [verPdf, setVerPdf] = useState(false);
  const [, setActualizar] = useState(0);
  const temporizador = useRef(null);
  const temporizadorAviso = useRef(null);

  // Pasos 19-20: aviso por inactividad
  useEffect(() => {
    if (!existe || sesionExpirada) return;

    function reiniciar() {
      clearTimeout(temporizador.current);
      temporizador.current = setTimeout(() => {
        setAvisoExpiracion(true);
        // Si no responde en 5 minutos, la sesión expira
        temporizadorAviso.current = setTimeout(() => {
          setAvisoExpiracion(false);
          setSesionExpirada(true);
        }, AVISO_MS);
      }, INACTIVIDAD_MS);
    }

    reiniciar();
    const eventos = ["mousemove", "keydown", "scroll", "click"];
    eventos.forEach((e) => window.addEventListener(e, reiniciar));
    return () => {
      clearTimeout(temporizador.current);
      clearTimeout(temporizadorAviso.current);
      eventos.forEach((e) => window.removeEventListener(e, reiniciar));
    };
  }, [existe, sesionExpirada]);

  // Token inválido o expirado (paso 2) o sesión expirada por inactividad
  if (!encontrado || sesionExpirada) {
    return (
      <BarraExterna>
        <Alert tipo="error" texto="El enlace de acceso no es válido o ha expirado. Solicite un nuevo enlace al dueño del contrato." />
      </BarraExterna>
    );
  }

  const { contrato, parte } = encontrado;

  // Contrato archivado o eliminado (paso 3)
  if (contrato.estado === "Archivado") {
    return (
      <BarraExterna>
        <Alert tipo="error" texto="Este contrato ya no está disponible." />
      </BarraExterna>
    );
  }

  const puedeFirmar = parte.rol === "Firmante" && contrato.estado === "Listo para firmar" && parte.estadoFirma !== "Firmado";

  return (
    <BarraExterna>
      <PageTitle icono={Eye} titulo="Ver contrato como parte invitada" />

      {/* Paso 14: versión y hash siempre visibles */}
      <div style={{ position: "sticky", top: 0, zIndex: 10, paddingTop: 4, background: "var(--fondo)" }}>
        <ContractHeader
          contrato={contrato}
          extra={[
            { etiqueta: "Última modificación", valor: versionActual(contrato).fecha },
            { etiqueta: "Rol asignado", valor: <Badge texto={parte.rol} /> },
            { etiqueta: "Comentarios", valor: contrato.comentarios.length },
          ]}
        />
      </div>

      <div className="botonera mt-16 mb-16">
        {puedeFirmar && (
          <Link href={`/firmar/${parte.tokenFirma}`} className="btn btn-primario">
            <PenLine size={14} /> Firmar contrato
          </Link>
        )}
        <button className="btn" onClick={() => setVerPdf(!verPdf)}>
          <Download size={14} /> Descargar PDF
        </button>
      </div>

      {verPdf && (
        <div className="mb-16">
          <PdfDownload contrato={contrato} usuario={parte.email} />
        </div>
      )}

      {/* CU-06: Firmante y Revisor pueden comentar; Solo lectura no */}
      <CommentsPanel
        contrato={contrato}
        autor={parte.nombre}
        puedeComentar={parte.rol !== "Solo lectura"}
        mensajeSinPermiso="No puede añadir comentarios con su rol actual."
        onPublicado={() => setActualizar((n) => n + 1)}
      />

      {avisoExpiracion && (
        <Modal mensaje="Su sesión está por expirar en 5 minutos. ¿Desea continuar?">
          <button className="btn" onClick={() => { setAvisoExpiracion(false); setSesionExpirada(true); }}>Salir</button>
          <button
            className="btn btn-primario"
            onClick={() => {
              // Se renueva el token y se mantiene la sesión
              clearTimeout(temporizadorAviso.current);
              setAvisoExpiracion(false);
            }}
          >
            Continuar
          </button>
        </Modal>
      )}
    </BarraExterna>
  );
}
