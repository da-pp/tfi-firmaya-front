"use client";

// Sesión del usuario interno (CU-19).
// Guardamos en sessionStorage el token que devuelve el backend y los datos del usuario
// para que la sesión se mantenga al navegar o recargar la página.

import { useEffect, useState } from "react";

const CLAVE = "firmaya_sesion";

// datos: respuesta de POST /api/auth/login más el email ingresado
export function iniciarSesion(datos) {
  sessionStorage.setItem(CLAVE, JSON.stringify(datos));
}

export function cerrarSesion() {
  sessionStorage.removeItem(CLAVE);
}

export function getSesion() {
  if (typeof window === "undefined") return null;
  const texto = sessionStorage.getItem(CLAVE);
  if (!texto) return null;
  const sesion = JSON.parse(texto);
  // La sesión vence en el backend; si ya pasó la fecha, ni siquiera la usamos
  if (sesion.fechaExpiracion && new Date(sesion.fechaExpiracion) < new Date()) {
    cerrarSesion();
    return null;
  }
  return sesion;
}

export function nombreCompleto(usuario) {
  return `${usuario.nombre} ${usuario.apellido}`;
}

// Hook para usar el usuario logueado dentro de un componente.
// "cargado" indica si ya se leyó la sesión (solo se puede en el navegador).
export function useUsuario() {
  const [usuario, setUsuario] = useState(null);
  const [cargado, setCargado] = useState(false);

  useEffect(() => {
    setUsuario(getSesion());
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
