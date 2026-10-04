"use client";

// CU-05 – Cambiar estado del contrato

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import PageTitle from "@/components/PageTitle";
import ContractHeader from "@/components/ContractHeader";
import FormField from "@/components/FormField";
import Alert from "@/components/Alert";
import Badge from "@/components/Badge";
import Modal from "@/components/Modal";
import { getContrato, TRANSICIONES, firmantes } from "@/data/contracts";
import { registrarAuditoria } from "@/data/audit";
import { useUsuario } from "@/data/session";

// Descripción informativa de cada estado destino (paso 6)
const DESCRIPCIONES = {
  "En Revisión": "El contrato queda disponible para revisión y comentarios de las partes.",
  "Listo para firmar": "El contenido queda cerrado para edición y se habilita la solicitud de firmas.",
  Archivado: "El contrato firmado se archiva y queda solo para consulta.",
};

export default function EstadoPage() {
  const { id } = useParams();
  const router = useRouter();
  const { usuario } = useUsuario();
  const contrato = getContrato(id);

  const [nuevoEstado, setNuevoEstado] = useState("");
  const [razon, setRazon] = useState("");
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState(null);
  const [confirmando, setConfirmando] = useState(false);
  const [avisoSinFirmantes, setAvisoSinFirmantes] = useState(false);

  const opciones = TRANSICIONES[contrato.estado] || [];

  function pedirConfirmacion() {
    if (!nuevoEstado) {
      setError("Este campo es obligatorio");
      return;
    }
    setConfirmando(true);
  }

  // Paso 12: validar transición
  function confirmar() {
    setConfirmando(false);
    if (!opciones.includes(nuevoEstado)) {
      setMensaje({ tipo: "error", texto: "Esta transición de estado no es posible. Verifique el flujo permitido." });
      return;
    }
    if (nuevoEstado === "Listo para firmar" && firmantes(contrato).length === 0) {
      setAvisoSinFirmantes(true);
      return;
    }
    aplicarCambio();
  }

  // Pasos 13-17
  function aplicarCambio() {
    const anterior = contrato.estado;
    contrato.estado = nuevoEstado;
    registrarAuditoria({
      usuario: usuario.email,
      tipo: "Cambio de estado",
      entidad: "Contrato",
      descripcion: `${contrato.nombre}: ${anterior} → ${nuevoEstado}${razon.trim() ? ` (${razon.trim()})` : ""}`,
      contrato: contrato.nombre,
      antes: `Estado: ${anterior}`,
      despues: `Estado: ${nuevoEstado}`,
    });
    // Paso 15: se notificaría por correo a las partes con notificaciones activas
    setAvisoSinFirmantes(false);
    setNuevoEstado("");
    setRazon("");
    setMensaje({ tipo: "exito", texto: "Estado actualizado exitosamente" });
  }

  return (
    <>
      <PageTitle icono={RefreshCw} titulo="Cambiar estado del contrato" />
      {mensaje && <Alert tipo={mensaje.tipo} texto={mensaje.texto} />}
      <ContractHeader contrato={contrato} />

      <div className="grilla grilla-2">
        <div className="card">
          <h2 className="mb-16">Cambiar estado</h2>

          <div className="campo">
            <label>Estado actual</label>
            <Badge texto={contrato.estado} />
          </div>

          <FormField etiqueta="Nuevo estado" obligatorio error={error}>
            <select
              className={error ? "select con-error" : "select"}
              value={nuevoEstado}
              onChange={(e) => {
                setNuevoEstado(e.target.value);
                setError("");
                setMensaje(null);
              }}
            >
              <option value="">Seleccionar</option>
              {opciones.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </FormField>

          {nuevoEstado && <Alert tipo="info" texto={DESCRIPCIONES[nuevoEstado]} />}

          <FormField etiqueta="Razón del cambio">
            <textarea
              className="textarea"
              placeholder="Motivo opcional para registrar en auditoría."
              maxLength={500}
              value={razon}
              onChange={(e) => setRazon(e.target.value)}
            />
          </FormField>

          <button className="btn btn-primario btn-bloque" onClick={pedirConfirmacion}>
            <RefreshCw size={14} /> Confirmar cambio de estado
          </button>
        </div>

        <div className="card">
          <h2 className="mb-16">Flujo permitido</h2>
          {["Borrador → En Revisión", "En Revisión → Listo para firmar", "Firmado → Archivado"].map((t) => (
            <div key={t} className="card mb-8" style={{ padding: "12px 14px", marginTop: 0 }}>{t}</div>
          ))}
          <Alert tipo="aviso" texto="Si el contrato no tiene firmantes asignados, el sistema debe ofrecer ir a “Invitar partes”." />
        </div>
      </div>

      {confirmando && (
        <Modal mensaje={`¿Confirma el cambio de estado de ${contrato.estado} a ${nuevoEstado}?`}>
          <button className="btn" onClick={() => setConfirmando(false)}>Cancelar</button>
          <button className="btn btn-primario" onClick={confirmar}>Confirmar</button>
        </Modal>
      )}

      {avisoSinFirmantes && (
        <Modal mensaje="El contrato no tiene firmantes asignados. ¿Desea continuar o ir a invitar partes?">
          <button className="btn" onClick={() => router.push(`/contratos/${id}/invitar`)}>Invitar partes</button>
          <button className="btn btn-primario" onClick={aplicarCambio}>Continuar</button>
        </Modal>
      )}
    </>
  );
}
