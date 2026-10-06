"use client";

// CU-21 – Recuperar Contraseña (paso 2: restablecer desde el enlace del correo)

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Lock } from "lucide-react";
import FormField from "@/components/FormField";
import Alert from "@/components/Alert";
import { api } from "@/lib/api";

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
  // Mensaje de éxito del backend (paso 24)
  const [listo, setListo] = useState("");
  // null mientras se valida; "" si el token es válido; el mensaje de error si no lo es
  const [errorToken, setErrorToken] = useState(null);
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  // Paso 12: el backend valida que el token exista y no haya expirado
  useEffect(() => {
    api(`/auth/recuperar/${token}`)
      .then(() => setErrorToken(""))
      .catch((e) => setErrorToken(e.message));
  }, [token]);

  if (errorToken === null) {
    return <div className="pagina texto-suave" style={{ maxWidth: 640, paddingTop: 80 }}>Validando enlace…</div>;
  }

  // Token expirado o inválido (paso 12)
  if (errorToken && !listo) {
    return (
      <div className="pagina" style={{ maxWidth: 640, paddingTop: 80 }}>
        <div className="card" style={{ padding: 28 }}>
          <Alert tipo="error" texto={errorToken} />
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

  // Pasos 20-24: el backend actualiza la contraseña, invalida el token y registra la auditoría
  async function restablecer(evento) {
    evento.preventDefault();
    setError("");
    setEnviando(true);
    try {
      const respuesta = await api("/auth/restablecer", {
        metodo: "POST",
        cuerpo: { token, nuevaContrasenia: password, confirmarContrasenia: confirmacion },
      });
      setListo(respuesta.mensaje);
    } catch (e) {
      setError(e.message);
    } finally {
      setEnviando(false);
    }
  }

  if (listo) {
    return (
      <div className="pagina" style={{ maxWidth: 640, paddingTop: 80 }}>
        <div className="card" style={{ padding: 28 }}>
          <Alert tipo="exito" texto={listo} />
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

        {error && <Alert tipo="error" texto={error} />}

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

        <button type="submit" className="btn btn-primario btn-bloque" disabled={!puedeRestablecer || enviando}>
          Restablecer contraseña
        </button>
      </form>
    </div>
  );
}
