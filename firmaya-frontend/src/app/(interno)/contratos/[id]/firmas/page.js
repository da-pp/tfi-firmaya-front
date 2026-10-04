"use client";

// CU-09 – Consultar estado de firmas pendientes

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Activity, RefreshCw } from "lucide-react";
import PageTitle from "@/components/PageTitle";
import ContractHeader from "@/components/ContractHeader";
import Alert from "@/components/Alert";
import Badge from "@/components/Badge";
import Modal from "@/components/Modal";
import { getContrato, firmantes, firmasCompletadas, enlaceFirma } from "@/data/contracts";
import { simularEnvioCorreo, copiarAlPortapapeles, formatearFechaHora, hashCorto } from "@/lib/utils";

export default function FirmasPage() {
  const { id } = useParams();
  const contrato = getContrato(id);

  const [mensaje, setMensaje] = useState(null);
  const [aConfirmar, setAConfirmar] = useState(null); // firmante elegido para reenviar
  const [conError, setConError] = useState(null); // firmante cuyo reenvío falló

  // Camino alternativo: todavía no se enviaron solicitudes (paso 1)
  if (!contrato.solicitudFirmaEnviada) {
    return (
      <>
        <PageTitle icono={Activity} titulo="Consultar estado de firmas pendientes" />
        <ContractHeader contrato={contrato} />
        <div className="card">
          <Alert tipo="info" texto="Aún no se han enviado solicitudes de firma para este contrato.">
            <Link href={`/contratos/${id}/firmas/solicitar`} className="btn btn-primario btn-chico">Solicitar firmas</Link>
          </Alert>
        </div>
      </>
    );
  }

  const lista = firmantes(contrato);
  const completadas = firmasCompletadas(contrato);
  const todasFirmadas = lista.length > 0 && completadas === lista.length;

  // Pasos 15-17: reenvío de la solicitud
  function reenviar(firmante) {
    setAConfirmar(null);
    if (simularEnvioCorreo(firmante.email)) {
      firmante.estadoFirma = "Re-notificado";
      firmante.fechaEvento = formatearFechaHora(new Date());
      setConError(null);
      setMensaje({ tipo: "exito", texto: "Solicitud reenviada exitosamente" });
    } else {
      setConError(firmante);
    }
  }

  function copiarEnlace(firmante) {
    copiarAlPortapapeles(enlaceFirma(firmante));
    setConError(null);
    setMensaje({ tipo: "exito", texto: "Enlace copiado al portapapeles" });
  }

  return (
    <>
      <PageTitle icono={Activity} titulo="Consultar estado de firmas pendientes" />
      {todasFirmadas && <Alert tipo="exito" texto="Todas las firmas han sido completadas. El contrato está firmado." />}
      {mensaje && <Alert tipo={mensaje.tipo} texto={mensaje.texto} />}
      <ContractHeader contrato={contrato} />

      <div className="card separado">
        <div>
          <h2>Progreso de firmas</h2>
          <p className="card-subtitulo">{completadas} de {lista.length} firmas completadas.</p>
        </div>
        <div className="barra" style={{ width: "45%", minWidth: 180 }}>
          <div className="barra-relleno" style={{ width: `${lista.length ? (completadas / lista.length) * 100 : 0}%` }} />
        </div>
      </div>

      <div className="card">
        <div className="tabla-contenedor">
          <table className="tabla">
            <thead>
              <tr>
                <th>Firmante</th>
                <th>Correo electrónico</th>
                <th>Estado</th>
                <th>Evento</th>
                <th>IP / Hash</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((f) => (
                <tr key={f.id}>
                  <td><strong>{f.nombre}</strong></td>
                  <td className="texto-suave">{f.email}</td>
                  <td><Badge texto={f.estadoFirma} /></td>
                  <td className="texto-suave">{f.fechaEvento || "—"}</td>
                  <td className="texto-suave">
                    {f.estadoFirma === "Firmado" ? (
                      <>
                        {f.ip}
                        <div className="mono texto-tenue" title={f.hashFirma}>{hashCorto(f.hashFirma)}</div>
                      </>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>
                    {f.estadoFirma !== "Firmado" && (
                      <button className="btn btn-chico" onClick={() => setAConfirmar(f)}>
                        <RefreshCw size={12} /> Reenviar solicitud
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {aConfirmar && (
        <Modal mensaje={`¿Confirmar reenvío de solicitud a ${aConfirmar.nombre}?`}>
          <button className="btn" onClick={() => setAConfirmar(null)}>Cancelar</button>
          <button className="btn btn-primario" onClick={() => reenviar(aConfirmar)}>Confirmar</button>
        </Modal>
      )}

      {conError && (
        <Modal mensaje="No se pudo reenviar la solicitud. ¿Desea reintentar o copiar el enlace manualmente?">
          <button className="btn" onClick={() => copiarEnlace(conError)}>Copiar enlace</button>
          <button className="btn btn-primario" onClick={() => reenviar(conError)}>Reintentar</button>
        </Modal>
      )}
    </>
  );
}
