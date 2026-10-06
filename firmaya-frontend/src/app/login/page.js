"use client";

// CU-19 – Iniciar Sesión

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText, LogIn } from "lucide-react";
import FormField from "@/components/FormField";
import Alert from "@/components/Alert";
import Modal from "@/components/Modal";
import { iniciarSesion, guardarFlash } from "@/data/session";
import { api } from "@/lib/api";
import { emailValido } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errores, setErrores] = useState({});
  const [mensajeError, setMensajeError] = useState("");
  const [errorConexion, setErrorConexion] = useState(false);
  const [enviando, setEnviando] = useState(false);

  // Pasos 12-14: validaciones de formato
  function validarCampos() {
    const nuevos = {};
    if (email.trim() === "") nuevos.email = "El campo Email es obligatorio";
    else if (!emailValido(email)) nuevos.email = "Ingrese un correo electrónico válido";
    if (password === "") nuevos.password = "El campo Contraseña es obligatorio";
    else if (password.length < 8) nuevos.password = "La contraseña debe tener al menos 8 caracteres";
    setErrores(nuevos);

    // Foco en el primer campo con error
    if (nuevos.email) emailRef.current.focus();
    else if (nuevos.password) passwordRef.current.focus();

    return Object.keys(nuevos).length === 0;
  }

  // Pasos 15-20: el backend verifica las credenciales, cuenta los intentos fallidos
  // (bloqueo de 15 minutos tras 5 intentos) y registra el inicio de sesión en auditoría
  async function verificarCredenciales() {
    setEnviando(true);
    try {
      const sesion = await api("/auth/login", {
        metodo: "POST",
        cuerpo: { email: email.trim(), contrasenia: password },
      });
      iniciarSesion({ ...sesion, email: email.trim() });
      guardarFlash("exito", sesion.mensaje);
      router.push("/panel");
    } catch (e) {
      if (e.estado === 0) {
        setErrorConexion(true);
      } else if (e.errores.email || e.errores.contrasenia) {
        setErrores({ email: e.errores.email, password: e.errores.contrasenia });
      } else {
        setMensajeError(e.message);
      }
    } finally {
      setEnviando(false);
    }
  }

  function enviar(evento) {
    evento.preventDefault();
    setMensajeError("");
    if (validarCampos()) verificarCredenciales();
  }

  return (
    <div className="pagina" style={{ maxWidth: 980, paddingTop: 60 }}>
      <div className="card grilla grilla-2" style={{ padding: 0, overflow: "hidden", gap: 0, alignItems: "stretch" }}>
        {/* Panel oscuro izquierdo */}
        <div style={{ background: "var(--primario)", color: "#fff", padding: 32, display: "flex", flexDirection: "column", minHeight: 440 }}>
          <div className="titulo-pagina-icono" style={{ background: "#1e293b", marginBottom: 24 }}>
            <FileText size={18} />
          </div>
          <h1 style={{ fontSize: 26, lineHeight: 1.25 }}>Plataforma Centralizada de Gestión de Contratos</h1>
          <p style={{ color: "#cbd5e1", fontSize: 13, marginTop: 12 }}>
            Accedé para crear, editar, firmar y auditar contratos con trazabilidad por versión y hash.
          </p>
          <p style={{ color: "#94a3b8", fontSize: 11, marginTop: "auto" }}>MVP · Firma OTP · Auditoría · Versionado</p>
        </div>

        {/* Formulario */}
        <form onSubmit={enviar} noValidate style={{ padding: 32, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <h2 style={{ fontSize: 20 }}>Iniciar sesión</h2>
          <p className="texto-suave texto-chico mb-16">Ingresá con tu cuenta para continuar.</p>

          {mensajeError && <Alert tipo="error" texto={mensajeError} />}

          <FormField etiqueta="Email" obligatorio error={errores.email}>
            <input
              ref={emailRef}
              className={errores.email ? "input con-error" : "input"}
              type="email"
              placeholder="usuario@dominio.com"
              maxLength={254}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                // Paso 8: al confirmar el email el foco pasa a la contraseña
                if (e.key === "Enter") {
                  e.preventDefault();
                  passwordRef.current.focus();
                }
              }}
            />
          </FormField>

          <FormField etiqueta="Contraseña" obligatorio error={errores.password}>
            <input
              ref={passwordRef}
              className={errores.password ? "input con-error" : "input"}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </FormField>

          <button type="submit" className="btn btn-primario btn-bloque" disabled={enviando}>
            <LogIn size={14} /> Iniciar Sesión
          </button>

          <Link href="/recuperar-password" className="btn-enlace mt-16" style={{ textAlign: "center", fontSize: 12 }}>
            ¿Olvidaste tu contraseña?
          </Link>
        </form>
      </div>

      {errorConexion && (
        <Modal titulo="Error de conexión" mensaje="No se pudo conectar al servidor. Verifica tu conexión a internet.">
          <button className="btn" onClick={() => setErrorConexion(false)}>Cancelar</button>
          <button
            className="btn btn-primario"
            onClick={() => {
              setErrorConexion(false);
              verificarCredenciales();
            }}
          >
            Reintentar
          </button>
        </Modal>
      )}
    </div>
  );
}
