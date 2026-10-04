"use client";

// CU-20 – Configurar notificaciones (Mi Perfil)

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Save } from "lucide-react";
import PageTitle from "@/components/PageTitle";
import Alert from "@/components/Alert";
import Modal from "@/components/Modal";
import { EVENTOS_NOTIFICACION } from "@/data/users";
import { useUsuario } from "@/data/session";

export default function PerfilPage() {
  const router = useRouter();
  const { usuario } = useUsuario();

  const [eventos, setEventos] = useState(null);
  const [canales, setCanales] = useState(null);
  const [errorCanal, setErrorCanal] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [avisoTodoApagado, setAvisoTodoApagado] = useState(false);

  // Paso 7: cargamos el estado actual de las preferencias del usuario
  useEffect(() => {
    if (usuario) {
      setEventos({ ...usuario.preferencias.eventos });
      setCanales({ ...usuario.preferencias.canales });
    }
  }, [usuario]);

  if (!eventos) return null;

  function cambiarEvento(clave) {
    setEventos({ ...eventos, [clave]: !eventos[clave] });
    setMensaje("");
  }

  function cambiarCanal(clave) {
    setCanales({ ...canales, [clave]: !canales[clave] });
    setErrorCanal("");
    setMensaje("");
  }

  function guardarPreferencias() {
    usuario.preferencias = { eventos: { ...eventos }, canales: { ...canales } };
    setAvisoTodoApagado(false);
    setMensaje("Preferencias de notificación guardadas exitosamente.");
  }

  // Pasos 11-14
  function alGuardar() {
    if (!canales.email && !canales.plataforma) {
      setErrorCanal("Debe seleccionar al menos un canal de notificación.");
      return;
    }
    const todosApagados = EVENTOS_NOTIFICACION.every((e) => !eventos[e.clave]);
    if (todosApagados) {
      setAvisoTodoApagado(true);
      return;
    }
    guardarPreferencias();
  }

  function activarTodo() {
    const todos = {};
    EVENTOS_NOTIFICACION.forEach((e) => (todos[e.clave] = true));
    setEventos(todos);
    setAvisoTodoApagado(false);
  }

  // Texto "Canal: ..." según los canales seleccionados
  const textoCanal = [canales.email && "Email", canales.plataforma && "plataforma"].filter(Boolean).join(" y ") || "—";

  return (
    <>
      <PageTitle icono={Bell} titulo="Configurar notificaciones" />
      {mensaje && <Alert tipo="exito" texto={mensaje} />}

      <div className="card">
        <div className="card-titulo">
          <div>
            <h2>Configurar notificaciones</h2>
            <p className="card-subtitulo">Elegí qué eventos querés recibir y por qué canal.</p>
          </div>
          <button className="btn btn-primario" onClick={alGuardar}>
            <Save size={14} /> Guardar Preferencias
          </button>
        </div>

        <div className="grilla grilla-2" style={{ gap: 12 }}>
          {EVENTOS_NOTIFICACION.map((e) => (
            <div key={e.clave} className="caja-gris separado" style={{ background: "#fff" }}>
              <div>
                <strong className="texto-chico">{e.nombre}</strong>
                <div className="texto-tenue" style={{ fontSize: 11 }}>Canal: {textoCanal}</div>
              </div>
              <button
                type="button"
                className={eventos[e.clave] ? "toggle toggle-activo" : "toggle"}
                onClick={() => cambiarEvento(e.clave)}
                aria-pressed={eventos[e.clave]}
                aria-label={e.nombre}
              />
            </div>
          ))}
        </div>

        <div className="caja-gris mt-16">
          <strong className="texto-chico">Canal de notificación preferido <span className="obligatorio">*</span></strong>
          <div className="opciones-radio mt-8">
            <label className="fila texto-chico">
              <input type="checkbox" checked={canales.email} onChange={() => cambiarCanal("email")} /> Correo Electrónico
            </label>
            <label className="fila texto-chico">
              <input type="checkbox" checked={canales.plataforma} onChange={() => cambiarCanal("plataforma")} /> Notificación de Plataforma
            </label>
          </div>
          {errorCanal && <div className="helper-error">{errorCanal}</div>}
        </div>

        <div className="mt-16">
          <button className="btn" onClick={() => router.push("/panel")}>Atrás</button>
        </div>
      </div>

      {avisoTodoApagado && (
        <Modal mensaje="Tiene todas las notificaciones desactivadas. No recibirá alertas de actividad en sus contratos. ¿Confirma esta configuración?">
          <button className="btn" onClick={activarTodo}>Activar Todo</button>
          <button className="btn btn-primario" onClick={guardarPreferencias}>Confirmar</button>
        </Modal>
      )}
    </>
  );
}
