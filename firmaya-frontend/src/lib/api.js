"use client";

// Cliente HTTP para el backend. Todas las rutas son relativas a /api
// (next.config.mjs las reenvía al backend).
// Agrega el token de sesión y convierte las respuestas de error en ErrorApi.

import { useCallback, useEffect, useState } from "react";
import { getSesion, cerrarSesion } from "@/data/session";

export const MENSAJE_SIN_CONEXION = "No se pudo conectar al servidor. Verifica tu conexión a internet.";

// estado: código HTTP (0 si no hubo conexión)
// errores: mensaje de cada campo inválido, para mostrar debajo de cada campo
export class ErrorApi extends Error {
  constructor(estado, mensaje, errores = {}) {
    super(mensaje);
    this.estado = estado;
    this.errores = errores;
  }
}

function armarUrl(ruta, params) {
  const query = new URLSearchParams();
  Object.entries(params || {}).forEach(([clave, valor]) => {
    if (valor !== undefined && valor !== null && String(valor).trim() !== "") query.append(clave, String(valor).trim());
  });
  const texto = query.toString();
  return `/api${ruta}${texto ? `?${texto}` : ""}`;
}

async function pedir(ruta, { metodo = "GET", cuerpo, params } = {}) {
  const encabezados = {};
  const sesion = getSesion();
  if (sesion) encabezados.Authorization = `Bearer ${sesion.token}`;
  if (cuerpo !== undefined) encabezados["Content-Type"] = "application/json";

  let respuesta;
  try {
    respuesta = await fetch(armarUrl(ruta, params), {
      method: metodo,
      headers: encabezados,
      body: cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined,
    });
  } catch {
    throw new ErrorApi(0, MENSAJE_SIN_CONEXION);
  }

  if (respuesta.ok) return respuesta;

  let datos = {};
  try {
    datos = await respuesta.json();
  } catch {
    // El cuerpo no es JSON (por ejemplo, el backend está caído y responde el proxy)
  }

  // El proxy de Next responde 500 sin cuerpo JSON cuando el backend no está levantado
  if (!datos.mensaje && respuesta.status >= 500) throw new ErrorApi(0, MENSAJE_SIN_CONEXION);

  // Sesión vencida: se vuelve al login (salvo en las rutas de autenticación)
  if (respuesta.status === 401 && !ruta.startsWith("/auth")) {
    cerrarSesion();
    // Fuera de un componente no hay router: recarga completa para limpiar el estado de la app
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = "/login";
  }

  throw new ErrorApi(respuesta.status, datos.mensaje || "Ocurrió un error inesperado.", datos.errores || {});
}

// Pide JSON. Devuelve null si la respuesta no tiene cuerpo.
export async function api(ruta, opciones) {
  const respuesta = await pedir(ruta, opciones);
  const texto = await respuesta.text();
  return texto ? JSON.parse(texto) : null;
}

// Pide un archivo (por ejemplo el CSV de auditoría) y lo devuelve como Blob.
export async function apiArchivo(ruta, opciones) {
  const respuesta = await pedir(ruta, opciones);
  return respuesta.blob();
}

// Carga datos al montar el componente.
// Devuelve { datos, error, cargando, recargar }. "recargar" vuelve a pedir sin vaciar los datos actuales.
export function useDatos(ruta) {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(true);

  const recargar = useCallback(async () => {
    try {
      setDatos(await api(ruta));
      setError(null);
    } catch (e) {
      setError(e);
    } finally {
      setCargando(false);
    }
  }, [ruta]);

  useEffect(() => {
    recargar();
  }, [recargar]);

  return { datos, error, cargando, recargar };
}
