"use client";

// CU-21 – Recuperar Contraseña (paso 1: solicitar el enlace)

import { useState } from "react";
import { Lock, Mail } from "lucide-react";
import FormField from "@/components/FormField";
import Alert from "@/components/Alert";
import { api } from "@/lib/api";
import { emailValido } from "@/lib/utils";

export default function RecuperarPasswordPage() {
  const [email, setEmail] = useState("");
  // Mensaje del backend: siempre el mismo, exista o no la cuenta (paso 9)
  const [enviado, setEnviado] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  const formatoInvalido = email.trim() !== "" && !emailValido(email);
  const puedeEnviar = email.trim() !== "" && !formatoInvalido;

  // Pasos 8-10: si la cuenta existe, el backend envía un enlace con token de 30 minutos
  async function enviar(evento) {
    evento.preventDefault();
    setError("");
    setEnviando(true);
    try {
      const respuesta = await api("/auth/recuperar", { metodo: "POST", cuerpo: { email: email.trim() } });
      setEnviado(respuesta.mensaje);
    } catch (e) {
      setError(e.errores.email || e.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="pagina" style={{ maxWidth: 640, paddingTop: 80 }}>
      <form className="card" onSubmit={enviar} noValidate style={{ padding: 28 }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div className="titulo-pagina-icono" style={{ width: 52, height: 52, borderRadius: 12, margin: "0 auto 12px" }}>
            <Lock size={22} />
          </div>
          <h1>Recuperar contraseña</h1>
          <p className="texto-suave">Ingresá tu email para recibir instrucciones.</p>
        </div>

        {enviado && <Alert tipo="exito" texto={enviado} />}
        {error && <Alert tipo="error" texto={error} />}

        <FormField
          etiqueta="Email de recuperación"
          obligatorio
          error={formatoInvalido ? "Ingrese un correo electrónico válido (ej. nombre@dominio.com)" : ""}
        >
          <input
            className={formatoInvalido ? "input con-error" : "input"}
            type="email"
            placeholder="usuario@dominio.com"
            maxLength={254}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEnviado("");
            }}
          />
        </FormField>

        <button type="submit" className="btn btn-primario btn-bloque" disabled={!puedeEnviar || enviando}>
          <Mail size={14} /> Enviar instrucciones
        </button>
      </form>
    </div>
  );
}
