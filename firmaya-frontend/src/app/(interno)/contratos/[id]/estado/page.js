"use client";

// CU-05 – Cambiar estado del contrato

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import PageTitle from "@/components/PageTitle";
import ContractHeader from "@/components/ContractHeader";
import FormField from "@/components/FormField";
import Alert from "@/components/Alert";
import Badge from "@/components/Badge";
import Modal from "@/components/Modal";
import { useContrato } from "@/components/ContratoContext";
import { api, useDatos } from "@/lib/api";

// Descripción informativa de cada estado destino (paso 6)
const DESCRIPCIONES = {
  "En Revisión": "El contrato queda disponible para revisión y comentarios de las partes.",
  "Listo para firmar": "El contenido queda cerrado para edición y se habilita la solicitud de firmas.",
  Archivado: "El contrato firmado se archiva y queda solo para consulta.",
};

export default function EstadoPage() {
  const router = useRouter();
  const { contrato, recargar } = useContrato();
  const id = contrato.idContrato;
  // Pasos 2-4: estado actual y estados disponibles según el flujo permitido
  const { datos: transiciones, error: errorTransiciones, recargar: recargarTransiciones } = useDatos(`/contratos/${id}/transiciones`);

  const [nuevoEstado, setNuevoEstado] = useState("");
  const [razon, setRazon] = useState("");
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState(null);
  const [confirmando, setConfirmando] = useState(false);
  const [avisoSinFirmantes, setAvisoSinFirmantes] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const opciones = transiciones ? transiciones.estadosDisponibles : [];

  function pedirConfirmacion() {
    if (!nuevoEstado) {
      setError("Este campo es obligatorio");
      return;
    }
    setConfirmando(true);
  }

  // Pasos 12-17: el backend valida la transición, actualiza el estado,
  // registra la auditoría y notifica a las partes.
  // continuarSinFirmantes: el usuario eligió "Continuar" en el aviso de contrato sin firmantes.
  async function aplicarCambio(continuarSinFirmantes) {
    setConfirmando(false);
    setAvisoSinFirmantes(false);
    setEnviando(true);
    try {
      const respuesta = await api(`/contratos/${id}/estado`, {
        metodo: "PATCH",
        cuerpo: { nuevoEstado, razon: razon.trim(), continuarSinFirmantes },
      });
      setNuevoEstado("");
      setRazon("");
      setMensaje({ tipo: "exito", texto: respuesta.mensaje });
      recargar();
      recargarTransiciones();
    } catch (e) {
      // 409: el contrato no tiene firmantes asignados y hay que confirmar
      if (e.estado === 409) setAvisoSinFirmantes(true);
      else setMensaje({ tipo: "error", texto: e.message });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <PageTitle icono={RefreshCw} titulo="Cambiar estado del contrato" />
      {mensaje && <Alert tipo={mensaje.tipo} texto={mensaje.texto} />}
      {errorTransiciones && <Alert tipo="error" texto={errorTransiciones.message} />}
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

          <button className="btn btn-primario btn-bloque" onClick={pedirConfirmacion} disabled={enviando}>
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
          <button className="btn btn-primario" onClick={() => aplicarCambio(false)}>Confirmar</button>
        </Modal>
      )}

      {avisoSinFirmantes && (
        <Modal mensaje="El contrato no tiene firmantes asignados. ¿Desea continuar o ir a invitar partes?">
          <button className="btn" onClick={() => router.push(`/contratos/${id}/invitar`)}>Invitar partes</button>
          <button className="btn btn-primario" onClick={() => aplicarCambio(true)}>Continuar</button>
        </Modal>
      )}
    </>
  );
}
