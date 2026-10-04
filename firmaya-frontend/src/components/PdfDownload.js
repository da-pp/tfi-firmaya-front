"use client";

// Descarga del contrato firmado en PDF (CU-10).
// Se usa en la pestaña "Descargar PDF" y en la vista de la parte invitada (CU-04 / CU-08).

import { useState } from "react";
import { Download, RefreshCw } from "lucide-react";
import Alert from "./Alert";
import Badge from "./Badge";
import { versionActual, firmantes } from "@/data/contracts";
import { registrarAuditoria } from "@/data/audit";
import { descargarArchivo, hashSimulado, htmlATexto } from "@/lib/utils";
import { generarPdf } from "@/lib/pdf";

// [NombreDelContrato]_v[versión]_firmado.pdf
function nombreArchivo(contrato, conFirmas) {
  const nombre = contrato.nombre.replace(/[^\wáéíóúñÁÉÍÓÚÑ]+/g, "_");
  const version = versionActual(contrato).numero;
  return conFirmas ? `${nombre}_v${version}_firmado.pdf` : `${nombre}_v${version}.pdf`;
}

function armarPdf(contrato, conFirmas) {
  const version = versionActual(contrato);
  const parrafos = [contrato.nombre, `Versión v${version.numero}`, ""];
  htmlATexto(version.contenido).split("\n").forEach((linea) => parrafos.push(linea));

  if (conFirmas) {
    parrafos.push("", "DATOS DE FIRMA", "");
    firmantes(contrato).forEach((f) => {
      parrafos.push(`Nombre del firmante: ${f.nombre}`);
      parrafos.push(`Fecha y hora de la firma: ${f.fechaEvento}`);
      parrafos.push(`Dirección IP del firmante: ${f.ip}`);
      parrafos.push(`Hash de la versión firmada: ${version.hash}`);
      parrafos.push("");
    });
    parrafos.push("Documento con firma digital verificada por FirmaYA");
  }

  const hashDocumento = hashSimulado(parrafos.join("\n"));
  return generarPdf(parrafos, `Hash del documento: ${hashDocumento}`);
}

export default function PdfDownload({ contrato, usuario }) {
  // "inicial" | "generando" | "error"
  const [estado, setEstado] = useState("inicial");
  const [conFirmasPedido, setConFirmasPedido] = useState(true);
  const [exito, setExito] = useState("");

  const firmado = contrato.estado === "Firmado";
  const version = versionActual(contrato);

  function generar(conFirmas) {
    setConFirmasPedido(conFirmas);
    setExito("");
    setEstado("generando");

    setTimeout(() => {
      // Contrato de prueba configurado para que la primera generación falle
      if (contrato.falloPdf) {
        contrato.falloPdf = false;
        setEstado("error");
        return;
      }
      descargarArchivo(nombreArchivo(contrato, conFirmas), armarPdf(contrato, conFirmas), "application/pdf");
      registrarAuditoria({
        usuario,
        tipo: "Descarga",
        entidad: "Contrato",
        descripcion: `Descarga de ${contrato.nombre} v${version.numero}`,
        contrato: contrato.nombre,
        version: `v${version.numero}`,
        hash: version.hash,
      });
      setEstado("inicial");
      setExito("El PDF se descargó exitosamente.");
    }, 1200);
  }

  return (
    <div className="card" style={{ textAlign: "center" }}>
      <div
        style={{ width: 44, height: 44, borderRadius: 10, background: "var(--verde-fondo)", color: "var(--verde)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}
      >
        <Download size={20} />
      </div>
      <h2 style={{ fontSize: 18 }}>Descargar contrato firmado</h2>
      <p className="texto-suave texto-chico mb-16">El PDF final incluirá datos de firma, IP, fecha, hora y hash del documento.</p>

      <div className="caja-gris mb-16" style={{ background: "#fff", textAlign: "left" }}>
        <div className="grilla grilla-2" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
          <div className="contrato-header-dato">
            <span>Estado</span>
            <Badge texto={contrato.estado} />
          </div>
          <div className="contrato-header-dato">
            <span>Versión</span>
            <strong>v{version.numero}</strong>
          </div>
          <div className="contrato-header-dato">
            <span>Archivo</span>
            <strong style={{ wordBreak: "break-all" }}>{nombreArchivo(contrato, firmado)}</strong>
          </div>
        </div>
      </div>

      <div style={{ textAlign: "left" }}>
        {exito && <Alert tipo="exito" texto={exito} />}
        {estado === "generando" && <Alert tipo="info" texto="Generando PDF..." />}
        {estado === "error" && (
          <Alert tipo="error" texto="El PDF no pudo ser generado en este momento.">
            <button className="btn btn-chico" onClick={() => generar(conFirmasPedido)}>
              <RefreshCw size={12} /> Reintentar
            </button>
            <button className="btn btn-chico" onClick={() => setEstado("inicial")}>Cancelar</button>
          </Alert>
        )}
        {!firmado && (
          <Alert tipo="aviso" texto="El PDF completo solo está disponible una vez que todos los firmantes hayan completado la firma" />
        )}
      </div>

      <div className="botonera" style={{ justifyContent: "center" }}>
        {firmado ? (
          <button className="btn btn-primario" disabled={estado === "generando"} onClick={() => generar(true)}>
            <Download size={14} /> Descargar PDF firmado
          </button>
        ) : (
          <button className="btn" disabled={estado === "generando"} onClick={() => generar(false)}>
            <Download size={14} /> Descargar versión actual sin firmas
          </button>
        )}
      </div>
    </div>
  );
}
