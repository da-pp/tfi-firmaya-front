"use client";

// Sesión simulada (no hay autenticación real).
// Guardamos solo el email del usuario logueado en sessionStorage
// para que la sesión se mantenga al navegar o recargar la página.

import { useEffect, useState } from "react";
import { buscarUsuarioPorEmail } from "./users";

const CLAVE = "firmaya_usuario";

export function iniciarSesion(email) {
  sessionStorage.setItem(CLAVE, email);
}

export function cerrarSesion() {
  sessionStorage.removeItem(CLAVE);
}

export function getUsuarioActual() {
  if (typeof window === "undefined") return null;
  const email = sessionStorage.getItem(CLAVE);
  return email ? buscarUsuarioPorEmail(email) : null;
}

// Hook para usar el usuario logueado dentro de un componente.
// "cargado" indica si ya se leyó la sesión (solo se puede en el navegador).
export function useUsuario() {
  const [usuario, setUsuario] = useState(null);
  const [cargado, setCargado] = useState(false);

  useEffect(() => {
    setUsuario(getUsuarioActual());
    setCargado(true);
  }, []);

  return { usuario, cargado };
}

// ---------- Mensajes "flash" ----------
// Un mensaje que se guarda antes de redirigir y se muestra en la página destino.
// Ej: "Contrato creado exitosamente" (CU-01) o "Bienvenido, [nombre]." (CU-19)

let mensajeFlash = null;

export function guardarFlash(tipo, texto) {
  mensajeFlash = { tipo, texto };
}

export function tomarFlash() {
  const mensaje = mensajeFlash;
  mensajeFlash = null;
  return mensaje;
}
