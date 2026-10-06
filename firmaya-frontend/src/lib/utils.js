// Funciones simples reutilizadas por varias pantallas.

// ---------- Fechas ----------

// Agrega un 0 adelante si hace falta: 5 -> "05"
function dosDigitos(n) {
  return String(n).padStart(2, "0");
}

// Date -> "DD/MM/AAAA"
export function formatearFecha(fecha) {
  return `${dosDigitos(fecha.getDate())}/${dosDigitos(fecha.getMonth() + 1)}/${fecha.getFullYear()}`;
}

// Date -> "DD/MM/AAAA HH:mm"
export function formatearFechaHora(fecha) {
  return `${formatearFecha(fecha)} ${dosDigitos(fecha.getHours())}:${dosDigitos(fecha.getMinutes())}`;
}

// Date -> "DD/MM/AAAA HH:mm:ss"
export function formatearFechaHoraSegundos(fecha) {
  return `${formatearFechaHora(fecha)}:${dosDigitos(fecha.getSeconds())}`;
}

// El backend envía fechas ISO ("2026-10-06T14:30:00"). Las mostramos como DD/MM/AAAA HH:mm.
export function fechaHoraDeIso(iso, conSegundos = false) {
  if (!iso) return "—";
  const fecha = new Date(iso);
  return conSegundos ? formatearFechaHoraSegundos(fecha) : formatearFechaHora(fecha);
}

// "DD/MM/AAAA" -> Date (o null si el formato o la fecha no son válidos)
export function leerFecha(texto) {
  const partes = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(texto.trim());
  if (!partes) return null;
  const dia = Number(partes[1]);
  const mes = Number(partes[2]);
  const anio = Number(partes[3]);
  const fecha = new Date(anio, mes - 1, dia);
  // Evita fechas como 31/02/2026
  if (fecha.getDate() !== dia || fecha.getMonth() !== mes - 1) return null;
  return fecha;
}

// Fecha de hoy sin horas (para comparar solo días)
export function hoy() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

// ---------- Validaciones ----------

// Contiene "@" y un dominio con punto
export function emailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// ---------- Hash ----------

// Muestra el inicio de un hash: "a3f91c24d8e7b6a0…"
export function hashCorto(hash, largo = 16) {
  return hash.slice(0, largo) + "…";
}

// ---------- Portapapeles y descargas ----------

export function copiarAlPortapapeles(texto) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(texto);
  }
}

// Descarga un archivo en el navegador (ej. el CSV de auditoría)
export function descargarArchivo(nombre, contenido, tipo) {
  const blob = new Blob([contenido], { type: tipo });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = nombre;
  enlace.click();
  URL.revokeObjectURL(url);
}
