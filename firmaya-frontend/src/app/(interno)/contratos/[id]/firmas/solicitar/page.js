"use client";

// CU-07 – Solicitar firma de las partes

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Mail, Copy } from "lucide-react";
import PageTitle from "@/components/PageTitle";
import ContractHeader from "@/components/ContractHeader";
import FormField from "@/components/FormField";
import Alert from "@/components/Alert";
import Badge from "@/components/Badge";
import { getContrato, firmantes, firmasCompletadas, enlaceFirma } from "@/data/contracts";
import { leerFecha, hoy, simularEnvioCorreo, copiarAlPortapapeles, formatearFechaHora } from "@/lib/utils";

export default function SolicitarFirmasPage() {
  const { id } = useParams();
  const contrato = getContrato(id);

  const [canal, setCanal] = useState("");
  const [mensajePersonalizado, setMensajePersonalizado] = useState("");
  const [fechaLimite, setFechaLimite] = useState("");
  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState(null);
  const [fallidos, setFallidos] = useState([]); // firmantes a los que no se pudo notificar

  const lista = firmantes(contrato);
  const listoParaFirmar = contrato.estado === "Listo para firmar";

  // Camino alternativo: no hay firmantes (paso 2)
  if (lista.length === 0) {
    return (
      <>
        <PageTitle icono={Mail} titulo="Solicitar firma a las partes" />
        <ContractHeader contrato={contrato} />
        <div className="card">
          <Alert tipo="aviso" texto="No hay firmantes asignados. Debe invitar al menos a una parte con el rol de Firmante antes de solicitar firmas.">
            <Link href={`/contratos/${id}/invitar`} className="btn btn-primario btn-chico">Ir a invitar partes</Link>
          </Alert>
        </div>
      </>
    );
  }

  // Envía la notificación a los firmantes indicados (pasos 14-17)
  function notificar(destinatarios) {
    const conError = [];
    destinatarios.forEach((f) => {
      if (simularEnvioCorreo(f.email)) {
        f.estadoFirma = "Notificado";
        f.fechaEvento = formatearFechaHora(new Date());
      } else {
        conError.push(f);
      }
    });
    contrato.solicitudFirmaEnviada = true;
    setFallidos(conError);
    if (conError.length === 0) {
      setMensaje({
        tipo: "exito",
        texto: `Solicitudes de firma enviadas exitosamente. ${firmasCompletadas(contrato)} de ${lista.length} firmas completadas.`,
      });
    } else {
      setMensaje(null);
    }
  }

  function enviar() {
    // Pasos 12-13: validaciones
    const nuevos = {};
    if (!canal) nuevos.canal = "Este campo es obligatorio";
    if (fechaLimite.trim() !== "") {
      const fecha = leerFecha(fechaLimite);
      if (!fecha || fecha <= hoy()) nuevos.fechaLimite = "La fecha límite debe ser posterior a la fecha actual";
    }
    setErrores(nuevos);
    if (Object.keys(nuevos).length > 0) return;

    notificar(lista.filter((f) => f.estadoFirma !== "Firmado"));
  }

  return (
    <>
      <PageTitle icono={Mail} titulo="Solicitar firma a las partes" />
      {mensaje && <Alert tipo={mensaje.tipo} texto={mensaje.texto} />}

      {/* Camino alternativo: fallo en el envío (paso 16) */}
      {fallidos.length > 0 && (
        <div className="alerta alerta-error" style={{ display: "block" }}>
          <strong>No se pudo enviar la notificación a:</strong>
          {fallidos.map((f) => (
            <div key={f.id} className="separado mt-8">
              <span>{f.nombre} ({f.email})</span>
              <button className="btn btn-chico" onClick={() => { copiarAlPortapapeles(enlaceFirma(f)); setMensaje({ tipo: "exito", texto: "Enlace copiado al portapapeles" }); }}>
                <Copy size={12} /> Copiar enlace
              </button>
            </div>
          ))}
          <button className="btn btn-chico btn-primario mt-8" onClick={() => notificar(fallidos)}>Reintentar fallidos</button>
        </div>
      )}

      <ContractHeader contrato={contrato} />

      <div className="grilla grilla-2">
        <div className="card">
          <h2 className="mb-16">Firmantes</h2>
          {lista.map((f) => (
            <div key={f.id} className="card separado mb-8" style={{ padding: "12px 14px", marginTop: 0 }}>
              <div>
                <strong>{f.nombre}</strong>
                <div className="texto-suave texto-chico">{f.email}</div>
              </div>
              <Badge texto={f.estadoFirma} />
            </div>
          ))}
        </div>

        <div className="card">
          <h2 className="mb-16">Configurar solicitud</h2>

          <FormField etiqueta="Canal de notificación" obligatorio error={errores.canal}>
            <div className="opciones-radio">
              <label>
                <input type="radio" name="canal" value="Correo electrónico" checked={canal === "Correo electrónico"} onChange={(e) => { setCanal(e.target.value); setErrores({ ...errores, canal: "" }); }} />
                Correo electrónico
              </label>
            </div>
          </FormField>

          <FormField etiqueta="Mensaje personalizado">
            <textarea className="textarea" placeholder="Mensaje opcional para los firmantes." maxLength={500} value={mensajePersonalizado} onChange={(e) => setMensajePersonalizado(e.target.value)} />
          </FormField>

          <FormField etiqueta="Fecha límite de firma" error={errores.fechaLimite}>
            <input className={errores.fechaLimite ? "input con-error" : "input"} placeholder="DD/MM/AAAA" value={fechaLimite} onChange={(e) => { setFechaLimite(e.target.value); setErrores({ ...errores, fechaLimite: "" }); }} />
          </FormField>

          <button className="btn btn-primario btn-bloque" onClick={enviar} disabled={!listoParaFirmar}>
            <Mail size={14} /> Enviar solicitudes de firma
          </button>
          {!listoParaFirmar && (
            <p className="helper">Disponible cuando el contrato está en estado “Listo para firmar”.</p>
          )}
        </div>
      </div>
    </>
  );
}
