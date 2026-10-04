"use client";

// CU-03 – Invitar a las partes al contrato

import { useState } from "react";
import { useParams } from "next/navigation";
import { Users, Mail, Copy } from "lucide-react";
import PageTitle from "@/components/PageTitle";
import ContractHeader from "@/components/ContractHeader";
import FormField from "@/components/FormField";
import Alert from "@/components/Alert";
import Badge from "@/components/Badge";
import Modal from "@/components/Modal";
import { getContrato, agregarParte, enlaceAcceso } from "@/data/contracts";
import { emailValido, copiarAlPortapapeles, simularEnvioCorreo } from "@/lib/utils";

const ROLES_PARTE = ["Firmante", "Solo lectura", "Revisor"];
const VACIO = { email: "", nombre: "", rol: "", mensaje: "" };

export default function InvitarPage() {
  const { id } = useParams();
  const contrato = getContrato(id);

  const [form, setForm] = useState(VACIO);
  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState(null);
  // Parte cuyo correo no se pudo enviar (camino alternativo del paso 14)
  const [parteConError, setParteConError] = useState(null);

  // Pasos 8-9: validación en tiempo real del email
  function errorEmail(valor) {
    if (valor.trim() === "") return "";
    if (!emailValido(valor)) return "Ingrese un correo electrónico válido (ej. nombre@dominio.com)";
    const yaInvitado = contrato.partes.some((p) => p.email.toLowerCase() === valor.trim().toLowerCase());
    if (yaInvitado) return "Esta dirección ya ha sido invitada a este contrato";
    return "";
  }

  function cambiar(campo, valor) {
    setForm({ ...form, [campo]: valor });
    setErrores({ ...errores, [campo]: campo === "email" ? errorEmail(valor) : "" });
  }

  // Paso 14: envío del correo con el enlace tokenizado
  function enviarCorreo(parte) {
    if (simularEnvioCorreo(parte.email)) {
      parte.estadoInvitacion = "Invitación enviada";
      setParteConError(null);
      setMensaje({ tipo: "exito", texto: `Invitación enviada exitosamente a ${parte.email}` });
    } else {
      setParteConError(parte);
    }
  }

  function enviarInvitacion() {
    // Paso 11: campos obligatorios
    const nuevos = {
      email: form.email.trim() === "" ? "Este campo es obligatorio" : errorEmail(form.email),
      nombre: form.nombre.trim() === "" ? "Este campo es obligatorio" : "",
      rol: form.rol === "" ? "Este campo es obligatorio" : "",
    };
    setErrores(nuevos);
    if (nuevos.email || nuevos.nombre || nuevos.rol) return;

    // Pasos 12-13: token único y registro con estado "Pendiente"
    const parte = agregarParte(contrato, {
      email: form.email.trim(),
      nombre: form.nombre.trim(),
      rol: form.rol,
      mensaje: form.mensaje.trim(),
    });
    setForm(VACIO);
    enviarCorreo(parte);
  }

  function copiarEnlace(parte) {
    copiarAlPortapapeles(enlaceAcceso(parte));
    setParteConError(null);
    setMensaje({ tipo: "exito", texto: "Enlace copiado al portapapeles" });
  }

  const archivado = contrato.estado === "Archivado";

  return (
    <>
      <PageTitle icono={Users} titulo="Invitar partes al contrato" />
      {mensaje && <Alert tipo={mensaje.tipo} texto={mensaje.texto} />}
      <ContractHeader contrato={contrato} />

      <div className={archivado ? "grilla" : "grilla grilla-1-2"}>
        {!archivado && (
          <div className="card">
            <h2 className="mb-16">Nueva invitación</h2>

            <FormField etiqueta="Correo electrónico" obligatorio error={errores.email}>
              <input
                className={errores.email ? "input con-error" : "input"}
                placeholder="nombre@dominio.com"
                maxLength={254}
                value={form.email}
                onChange={(e) => cambiar("email", e.target.value)}
              />
            </FormField>

            <FormField etiqueta="Nombre de la parte" obligatorio error={errores.nombre}>
              <input
                className={errores.nombre ? "input con-error" : "input"}
                placeholder="Nombre y apellido"
                maxLength={150}
                value={form.nombre}
                onChange={(e) => cambiar("nombre", e.target.value)}
              />
            </FormField>

            <FormField etiqueta="Rol" obligatorio error={errores.rol}>
              <select className={errores.rol ? "select con-error" : "select"} value={form.rol} onChange={(e) => cambiar("rol", e.target.value)}>
                <option value="">Seleccionar</option>
                {ROLES_PARTE.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </FormField>

            <FormField etiqueta="Mensaje personalizado">
              <textarea
                className="textarea"
                placeholder="Mensaje opcional para incluir en la invitación."
                maxLength={500}
                value={form.mensaje}
                onChange={(e) => cambiar("mensaje", e.target.value)}
              />
            </FormField>

            <button className="btn btn-primario btn-bloque" onClick={enviarInvitacion} disabled={errores.email === "Esta dirección ya ha sido invitada a este contrato"}>
              <Mail size={14} /> Enviar invitación
            </button>
          </div>
        )}

        <div className="card">
          <h2 className="mb-16">Partes invitadas</h2>
          <div className="tabla-contenedor">
            <table className="tabla">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {contrato.partes.map((p) => (
                  <tr key={p.id}>
                    <td>{p.nombre}</td>
                    <td className="texto-suave">{p.email}</td>
                    <td><Badge texto={p.rol} /></td>
                    <td><Badge texto={p.estadoInvitacion} /></td>
                    <td>
                      <button className="btn btn-chico" onClick={() => copiarEnlace(p)}>
                        <Copy size={12} /> Copiar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {parteConError && (
        <Modal mensaje="No se pudo enviar el correo de invitación. ¿Desea reintentar o copiar el enlace manualmente?">
          <button className="btn" onClick={() => copiarEnlace(parteConError)}>Copiar enlace</button>
          <button className="btn btn-primario" onClick={() => enviarCorreo(parteConError)}>Reintentar</button>
        </Modal>
      )}
    </>
  );
}
