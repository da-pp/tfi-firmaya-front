"use client";

// CU-15 – Gestionar usuarios y roles

import { useState } from "react";
import { UserCog, Plus, Save } from "lucide-react";
import PageTitle from "@/components/PageTitle";
import FormField from "@/components/FormField";
import Alert from "@/components/Alert";
import Badge from "@/components/Badge";
import Modal from "@/components/Modal";
import { nombreCompleto } from "@/data/session";
import { api, useDatos } from "@/lib/api";
import { emailValido } from "@/lib/utils";

const VACIO = { nombre: "", apellido: "", email: "", idRol: "", estado: "" };
const SOLO_LETRAS = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü ]+$/;
const EMAIL_REGISTRADO = "Este Email ya está registrado en el sistema.";

export default function UsuariosPage() {
  const { datos: usuarios, error: errorUsuarios, recargar } = useDatos("/admin/usuarios");
  const { datos: roles } = useDatos("/admin/roles");

  const [form, setForm] = useState(VACIO);
  const [editandoId, setEditandoId] = useState(null); // null = alta de usuario nuevo
  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState(null);
  const [confirmarDesactivacion, setConfirmarDesactivacion] = useState(false);
  const [guardando, setGuardando] = useState(false);

  // Paso 13: email con formato válido y no registrado (validación en tiempo real).
  // El backend vuelve a validar al guardar.
  function errorEmail(valor) {
    if (valor.trim() === "") return "";
    if (!emailValido(valor)) return "Ingrese un correo electrónico válido";
    const existente = (usuarios || []).find((u) => u.email.toLowerCase() === valor.trim().toLowerCase());
    if (existente && existente.idUsuario !== editandoId) return EMAIL_REGISTRADO;
    return "";
  }

  function cambiar(campo, valor) {
    setForm({ ...form, [campo]: valor });
    setErrores({ ...errores, [campo]: campo === "email" ? errorEmail(valor) : "" });
  }

  function nuevoUsuario() {
    setEditandoId(null);
    setForm(VACIO);
    setErrores({});
    setMensaje(null);
  }

  function editar(u) {
    setEditandoId(u.idUsuario);
    setForm({ nombre: u.nombre, apellido: u.apellido, email: u.email, idRol: String(u.idRol), estado: u.estado });
    setErrores({});
    setMensaje(null);
  }

  // Paso 17: validaciones
  function validar() {
    const nuevos = {};
    ["nombre", "apellido"].forEach((campo) => {
      const etiqueta = campo === "nombre" ? "Nombre" : "Apellido";
      if (form[campo].trim() === "") nuevos[campo] = `El campo ${etiqueta} es obligatorio`;
      else if (!SOLO_LETRAS.test(form[campo])) nuevos[campo] = `El campo ${etiqueta} solo admite letras y espacios`;
    });
    nuevos.email = form.email.trim() === "" ? "El campo Email es obligatorio" : errorEmail(form.email);
    if (!form.idRol) nuevos.idRol = "El campo Rol es obligatorio";
    if (!form.estado) nuevos.estado = "El campo Estado es obligatorio";

    Object.keys(nuevos).forEach((k) => !nuevos[k] && delete nuevos[k]);
    setErrores(nuevos);
    return Object.keys(nuevos).length === 0;
  }

  // Pasos 18-21: el backend crea o actualiza la cuenta, envía el correo de activación
  // y registra la acción en auditoría
  async function enviar() {
    setConfirmarDesactivacion(false);
    setGuardando(true);
    const datos = {
      nombre: form.nombre.trim(),
      apellido: form.apellido.trim(),
      email: form.email.trim(),
      idRol: Number(form.idRol),
      estado: form.estado,
    };
    try {
      const respuesta = editandoId === null
        ? await api("/admin/usuarios", { metodo: "POST", cuerpo: datos })
        : await api(`/admin/usuarios/${editandoId}`, { metodo: "PUT", cuerpo: datos });
      setMensaje({ tipo: "exito", texto: respuesta.mensaje });
      if (editandoId === null) setForm(VACIO);
      recargar();
    } catch (e) {
      if (Object.keys(e.errores).length > 0) setErrores(e.errores);
      else setMensaje({ tipo: "error", texto: e.message });
    } finally {
      setGuardando(false);
    }
  }

  function guardar() {
    if (!validar()) return;
    const actual = editandoId !== null && usuarios.find((u) => u.idUsuario === editandoId);
    // Camino alternativo: desactivación de un usuario activo
    if (actual && actual.estado === "Activo" && form.estado === "Inactivo") {
      setConfirmarDesactivacion(true);
      return;
    }
    enviar();
  }

  return (
    <>
      <PageTitle icono={UserCog} titulo="Gestionar usuarios y roles" />
      {mensaje && <Alert tipo={mensaje.tipo} texto={mensaje.texto} />}
      {errorUsuarios && <Alert tipo="error" texto={errorUsuarios.message} />}

      <div className="grilla grilla-2-1">
        <div className="card">
          <div className="card-titulo">
            <h2>Usuarios</h2>
            <button className="btn btn-primario" onClick={nuevoUsuario}>
              <Plus size={14} /> Nuevo Usuario
            </button>
          </div>
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
                {(usuarios || []).map((u) => (
                  <tr key={u.idUsuario}>
                    <td>{nombreCompleto(u)}</td>
                    <td className="texto-suave">{u.email}</td>
                    <td><Badge texto={u.rol} /></td>
                    <td><Badge texto={u.estado} /></td>
                    <td><button className="btn btn-chico" onClick={() => editar(u)}>Editar</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h2 className="mb-16">{editandoId === null ? "Alta de usuario" : "Edición de usuario"}</h2>

          <FormField etiqueta="Nombre" obligatorio error={errores.nombre}>
            <input className={errores.nombre ? "input con-error" : "input"} placeholder="Nombre" maxLength={100} value={form.nombre} onChange={(e) => cambiar("nombre", e.target.value)} />
          </FormField>
          <FormField etiqueta="Apellido" obligatorio error={errores.apellido}>
            <input className={errores.apellido ? "input con-error" : "input"} placeholder="Apellido" maxLength={100} value={form.apellido} onChange={(e) => cambiar("apellido", e.target.value)} />
          </FormField>
          <FormField etiqueta="Email" obligatorio error={errores.email}>
            <input className={errores.email ? "input con-error" : "input"} placeholder="usuario@dominio.com" maxLength={254} value={form.email} onChange={(e) => cambiar("email", e.target.value)} />
          </FormField>
          <FormField etiqueta="Rol" obligatorio error={errores.idRol}>
            <select className={errores.idRol ? "select con-error" : "select"} value={form.idRol} onChange={(e) => cambiar("idRol", e.target.value)}>
              <option value="">Seleccionar</option>
              {(roles || []).map((r) => <option key={r.idRol} value={r.idRol}>{r.nombre}</option>)}
            </select>
          </FormField>
          <FormField etiqueta="Estado" obligatorio error={errores.estado}>
            <div className="opciones-radio">
              {["Activo", "Inactivo"].map((estado) => (
                <label key={estado}>
                  <input type="radio" name="estado" checked={form.estado === estado} onChange={() => cambiar("estado", estado)} /> {estado}
                </label>
              ))}
            </div>
          </FormField>

          <button
            className="btn btn-primario btn-bloque"
            onClick={guardar}
            disabled={guardando || errores.email === EMAIL_REGISTRADO}
          >
            <Save size={14} /> {editandoId === null ? "Guardar Usuario" : "Guardar cambios"}
          </button>
        </div>
      </div>

      {confirmarDesactivacion && (
        <Modal mensaje={`¿Confirma la desactivación de ${form.nombre} ${form.apellido}? El usuario no podrá iniciar sesión.`}>
          <button className="btn" onClick={() => setConfirmarDesactivacion(false)}>Cancelar</button>
          <button className="btn btn-primario" onClick={enviar}>Confirmar</button>
        </Modal>
      )}
    </>
  );
}
