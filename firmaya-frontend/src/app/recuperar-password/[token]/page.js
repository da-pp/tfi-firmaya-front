"use client";

// CU-21 – Recuperar Contraseña (paso 2: restablecer desde el enlace del correo)
// Token de prueba válido: /recuperar-password/valido  (cuenta maria@mail.com)

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Lock } from "lucide-react";
import FormField from "@/components/FormField";
import Alert from "@/components/Alert";
import { buscarUsuarioPorEmail } from "@/data/users";
import { registrarAuditoria } from "@/data/audit";

// Tokens de recuperación simulados (token → email de la cuenta)
const tokensRecuperacion = { valido: "maria@mail.com" };
// Tokens ya utilizados (quedan invalidados)
const tokensUsados = [];

// Requisitos de la nueva contraseña (paso 14)
const REQUISITOS = [
  { texto: "Mínimo 8 caracteres", cumple: (p) => p.length >= 8 },
  { texto: "Al menos 1 mayúscula", cumple: (p) => /[A-Z]/.test(p) },
  { texto: "Al menos 1 número", cumple: (p) => /[0-9]/.test(p) },
  { texto: "Al menos 1 carácter especial", cumple: (p) => /[^A-Za-z0-9]/.test(p) },
];

export default function RestablecerPasswordPage() {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [listo, setListo] = useState(false);

  const tokenValido = tokensRecuperacion[token] && !tokensUsados.includes(token);

  // Token expirado o inválido (paso 12)
  if (!tokenValido && !listo) {
    return (
      <div className="pagina" style={{ maxWidth: 640, paddingTop: 80 }}>
        <div className="card" style={{ padding: 28 }}>
          <Alert tipo="error" texto="El enlace de recuperación ha expirado o no es válido. Solicita uno nuevo." />
          <Link href="/recuperar-password" className="btn btn-primario btn-bloque">Solicitar nuevo enlace</Link>
        </div>
      </div>
    );
  }

  const cumplidos = REQUISITOS.filter((r) => r.cumple(password)).length;
  const cumpleTodos = cumplidos === REQUISITOS.length;
  const noCoinciden = confirmacion !== "" && confirmacion !== password;
  const puedeRestablecer = cumpleTodos && confirmacion === password;

  // Indicador de fortaleza: rojo / amarillo / verde
  let colorFortaleza = "var(--rojo)";
  if (cumplidos === 3) colorFortaleza = "#eab308";
  if (cumpleTodos) colorFortaleza = "var(--verde)";

  function restablecer(evento) {
    evento.preventDefault();
    const usuario = buscarUsuarioPorEmail(tokensRecuperacion[token]);
    usuario.password = password;
    tokensUsados.push(token);
    registrarAuditoria({ usuario: usuario.email, tipo: "Cambio de contraseña", entidad: "Usuario", descripcion: "Cambio de contraseña" });
    setListo(true);
  }

  if (listo) {
    return (
      <div className="pagina" style={{ maxWidth: 640, paddingTop: 80 }}>
        <div className="card" style={{ padding: 28 }}>
          <Alert tipo="exito" texto="Tu contraseña se restableció exitosamente." />
          <Link href="/login" className="btn btn-primario btn-bloque">Ir a inicio de sesión</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pagina" style={{ maxWidth: 640, paddingTop: 80 }}>
      <form className="card" onSubmit={restablecer} style={{ padding: 28 }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div className="titulo-pagina-icono" style={{ width: 52, height: 52, borderRadius: 12, margin: "0 auto 12px" }}>
            <Lock size={22} />
          </div>
          <h1>Restablecer contraseña</h1>
        </div>

        <FormField etiqueta="Nueva contraseña" obligatorio>
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </FormField>

        {/* Indicador visual de fortaleza en tiempo real */}
        {password !== "" && (
          <div className="mb-16">
            <div className="barra">
              <div className="barra-relleno" style={{ width: `${(cumplidos / REQUISITOS.length) * 100}%`, background: colorFortaleza }} />
            </div>
            <ul style={{ listStyle: "none", marginTop: 8 }}>
              {REQUISITOS.map((r) => (
                <li key={r.texto} className="texto-chico" style={{ color: r.cumple(password) ? "var(--verde)" : "var(--rojo)" }}>
                  {r.cumple(password) ? "✓" : "✗"} {r.texto}
                </li>
              ))}
            </ul>
          </div>
        )}

        <FormField etiqueta="Confirmar nueva contraseña" obligatorio error={noCoinciden ? "Las contraseñas no coinciden." : ""}>
          <input
            className={noCoinciden ? "input con-error" : "input"}
            type="password"
            value={confirmacion}
            onChange={(e) => setConfirmacion(e.target.value)}
          />
        </FormField>

        <button type="submit" className="btn btn-primario btn-bloque" disabled={!puedeRestablecer}>
          Restablecer contraseña
        </button>
      </form>
    </div>
  );
}
