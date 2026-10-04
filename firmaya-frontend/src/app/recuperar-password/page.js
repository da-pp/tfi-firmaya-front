"use client";

// CU-21 – Recuperar Contraseña (paso 1: solicitar el enlace)

import { useState } from "react";
import { Lock, Mail } from "lucide-react";
import FormField from "@/components/FormField";
import Alert from "@/components/Alert";
import { emailValido } from "@/lib/utils";

export default function RecuperarPasswordPage() {
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);

  const formatoInvalido = email.trim() !== "" && !emailValido(email);
  const puedeEnviar = email.trim() !== "" && !formatoInvalido;

  function enviar(evento) {
    evento.preventDefault();
    // Se muestra el mismo mensaje exista o no la cuenta (paso 9).
    // Si existe, el sistema enviaría un enlace con token de 30 minutos (paso 10).
    setEnviado(true);
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

        {enviado && (
          <Alert
            tipo="exito"
            texto="Si el correo electrónico ingresado corresponde a una cuenta registrada, recibirás instrucciones para restablecer tu contraseña."
          />
        )}

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
              setEnviado(false);
            }}
          />
        </FormField>

        <button type="submit" className="btn btn-primario btn-bloque" disabled={!puedeEnviar}>
          <Mail size={14} /> Enviar instrucciones
        </button>
      </form>
    </div>
  );
}
