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

// "DD/MM/AAAA HH:mm[:ss]" -> Date (para ordenar y filtrar mocks)
export function leerFechaHora(texto) {
  const [fecha, hora = "00:00"] = texto.split(" ");
  const d = leerFecha(fecha);
  if (!d) return null;
  const [h, m, s = "0"] = hora.split(":");
  d.setHours(Number(h), Number(m), Number(s));
  return d;
}

// Fecha de hoy sin horas (para comparar solo días)
export function hoy() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

// Fecha de hoy menos/más N días
export function sumarDias(fecha, dias) {
  const d = new Date(fecha);
  d.setDate(d.getDate() + dias);
  return d;
}

// ---------- Validaciones ----------

// Contiene "@" y un dominio con punto
export function emailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// Exactamente 64 caracteres hexadecimales
export function hashValido(hash) {
  return /^[0-9a-fA-F]{64}$/.test(hash.trim());
}

// ---------- Hash simulado ----------

// Genera un "hash" de 64 caracteres hexadecimales a partir de un texto.
// NO es SHA-256 real: solo sirve para mostrar valores en el frontend.
export function hashSimulado(texto) {
  let resultado = "";
  for (let semilla = 1; semilla <= 8; semilla++) {
    let h = 2166136261 ^ semilla;
    for (let i = 0; i < texto.length; i++) {
      h ^= texto.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    resultado += (h >>> 0).toString(16).padStart(8, "0");
  }
  return resultado;
}

// Muestra el inicio de un hash: "a3f91c24d8e7b6a0…"
export function hashCorto(hash, largo = 16) {
  return hash.slice(0, largo) + "…";
}

// ---------- HTML / texto ----------

// Convierte el HTML del editor en texto plano con saltos de línea
export function htmlATexto(html) {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|h1|h2|h3|li|blockquote|div)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

// ---------- Portapapeles y descargas ----------

export function copiarAlPortapapeles(texto) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(texto);
  }
}

// Descarga un archivo generado en el navegador (CSV, PDF, etc.)
export function descargarArchivo(nombre, contenido, tipo) {
  const blob = new Blob([contenido], { type: tipo });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = nombre;
  enlace.click();
  URL.revokeObjectURL(url);
}

// Convierte una lista de objetos en texto CSV
export function generarCsv(columnas, filas) {
  const escapar = (valor) => `"${String(valor ?? "").replace(/"/g, '""')}"`;
  const encabezado = columnas.map((c) => escapar(c.titulo)).join(",");
  const lineas = filas.map((fila) => columnas.map((c) => escapar(fila[c.campo])).join(","));
  return [encabezado, ...lineas].join("\n");
}

// ---------- Envío de correos simulado ----------

// Los emails que contienen "fallo" fallan la PRIMERA vez que se intenta
// enviarles algo. El reintento funciona. Sirve para mostrar los caminos
// alternativos de "error al enviar el correo".
const emailsQueYaFallaron = [];

export function simularEnvioCorreo(email) {
  if (email.includes("fallo") && !emailsQueYaFallaron.includes(email)) {
    emailsQueYaFallaron.push(email);
    return false;
  }
  return true;
}
