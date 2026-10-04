"use client";

// CU-15 – Gestionar usuarios y roles

import { useState } from "react";
import { UserCog, Plus, Save } from "lucide-react";
import PageTitle from "@/components/PageTitle";
import FormField from "@/components/FormField";
import Alert from "@/components/Alert";
import Badge from "@/components/Badge";
import Modal from "@/components/Modal";
import { usuarios, ROLES_INTERNOS, buscarUsuarioPorEmail, crearUsuario, actualizarUsuario, nombreCompleto } from "@/data/users";
import { registrarAuditoria } from "@/data/audit";
import { useUsuario } from "@/data/session";
import { emailValido } from "@/lib/utils";

const VACIO = { nombre: "", apellido: "", email: "", rol: "", estado: "" };
const SOLO_LETRAS = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü ]+$/;

export default function UsuariosPage() {
  const { usuario: admin } = useUsuario();

  const [form, setForm] = useState(VACIO);
  const [editandoId, setEditandoId] = useState(null); // null = alta de usuario nuevo
  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState("");
  const [confirmarDesactivacion, setConfirmarDesactivacion] = useState(false);

  // Paso 13: email con formato válido y no registrado (validación en tiempo real)
  function errorEmail(valor) {
    if (valor.trim() === "") return "";
    if (!emailValido(valor)) return "Ingrese un correo electrónico válido";
    const existente = buscarUsuarioPorEmail(valor);
    if (existente && existente.id !== editandoId) return "Este Email ya está registrado en el sistema.";
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
    setMensaje("");
  }

  function editar(u) {
    setEditandoId(u.id);
    setForm({ nombre: u.nombre, apellido: u.apellido, email: u.email, rol: u.rol, estado: u.estado });
    setErrores({});
    setMensaje("");
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
    if (!form.rol) nuevos.rol = "El campo Rol es obligatorio";
    if (!form.estado) nuevos.estado = "El campo Estado es obligatorio";

    Object.keys(nuevos).forEach((k) => !nuevos[k] && delete nuevos[k]);
    setErrores(nuevos);
    return Object.keys(nuevos).length === 0;
  }

  function guardar() {
    if (!validar()) return;
    const datos = { ...form, nombre: form.nombre.trim(), apellido: form.apellido.trim(), email: form.email.trim() };

    if (editandoId === null) {
      const nuevo = crearUsuario(datos);
      registrarAuditoria({ usuario: admin.email, tipo: "Creación", entidad: "Usuario", descripcion: `Alta del usuario ${nuevo.email}` });
      setMensaje("Usuario creado exitosamente. Se envió un correo de activación.");
      setForm(VACIO);
      return;
    }

    const actual = usuarios.find((u) => u.id === editandoId);
    // Camino alternativo: desactivación de un usuario activo
    if (actual.estado === "Activo" && datos.estado === "Inactivo") {
      setConfirmarDesactivacion(true);
      return;
    }
    actualizarUsuario(editandoId, datos);
    registrarAuditoria({ usuario: admin.email, tipo: "Edición", entidad: "Usuario", descripcion: `Edición del usuario ${datos.email}` });
    setMensaje("Usuario actualizado exitosamente.");
  }

  function desactivar() {
    actualizarUsuario(editandoId, { ...form });
    registrarAuditoria({ usuario: admin.email, tipo: "Edición", entidad: "Usuario", descripcion: `Desactivación del usuario ${form.email}` });
    setConfirmarDesactivacion(false);
    setMensaje("Usuario desactivado exitosamente.");
  }

  return (
    <>
      <PageTitle icono={UserCog} titulo="Gestionar usuarios y roles" />
      {mensaje && <Alert tipo="exito" texto={mensaje} />}

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
                {usuarios.map((u) => (
                  <tr key={u.id}>
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
          <FormField etiqueta="Rol" obligatorio error={errores.rol}>
            <select className={errores.rol ? "select con-error" : "select"} value={form.rol} onChange={(e) => cambiar("rol", e.target.value)}>
              <option value="">Seleccionar</option>
              {ROLES_INTERNOS.map((r) => <option key={r} value={r}>{r}</option>)}
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
            disabled={errores.email === "Este Email ya está registrado en el sistema."}
          >
            <Save size={14} /> {editandoId === null ? "Guardar Usuario" : "Guardar cambios"}
          </button>
        </div>
      </div>

      {confirmarDesactivacion && (
        <Modal mensaje={`¿Confirma la desactivación de ${form.nombre} ${form.apellido}? El usuario no podrá iniciar sesión.`}>
          <button className="btn" onClick={() => setConfirmarDesactivacion(false)}>Cancelar</button>
          <button className="btn btn-primario" onClick={desactivar}>Confirmar</button>
        </Modal>
      )}
    </>
  );
}
