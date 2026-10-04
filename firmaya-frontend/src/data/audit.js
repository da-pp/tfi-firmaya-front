// Registro de auditoría (CU-18). Las demás pantallas agregan registros con registrarAuditoria().

import { formatearFechaHoraSegundos, sumarDias, hashSimulado } from "@/lib/utils";

// Tipos de acción que los casos de uso indican registrar
export const TIPOS_ACCION = [
  "Creación",
  "Edición",
  "Cambio de estado",
  "Descarga",
  "Firma",
  "Verificación",
  "Inicio de sesión",
  "Cambio de contraseña",
];

// Generamos 120 registros de ejemplo (para poder ver la paginación de 50)
const usuariosEjemplo = ["ana@mail.com", "daniel@mail.com", "maria@mail.com", "pablo@mail.com"];
const ejemplos = [
  { tipo: "Firma", entidad: "Contrato", descripcion: "Firma registrada en Boleto de compraventa - Palermo" },
  { tipo: "Edición", entidad: "Contrato", descripcion: "Nueva versión de Locación - Av. Corrientes 1240" },
  { tipo: "Cambio de estado", entidad: "Contrato", descripcion: "Locación - Av. Corrientes 1240: Borrador → En Revisión" },
  { tipo: "Creación", entidad: "Usuario", descripcion: "Alta del usuario pablo@mail.com" },
  { tipo: "Descarga", entidad: "Contrato", descripcion: "Descarga de Mandato administración - Local Centro v5" },
  { tipo: "Edición", entidad: "Plantilla", descripcion: "Nueva versión de la plantilla Compraventa inmueble" },
  { tipo: "Inicio de sesión", entidad: "Usuario", descripcion: "Inicio de sesión" },
];

export const registrosAuditoria = [];

for (let i = 0; i < 120; i++) {
  const ejemplo = ejemplos[i % ejemplos.length];
  const fecha = sumarDias(new Date(), -Math.floor(i / 4));
  fecha.setHours(18 - (i % 9), (i * 7) % 60, (i * 13) % 60);
  registrosAuditoria.push({
    id: 120 - i,
    fecha: formatearFechaHoraSegundos(fecha),
    usuario: usuariosEjemplo[i % usuariosEjemplo.length],
    tipo: ejemplo.tipo,
    entidad: ejemplo.entidad,
    descripcion: ejemplo.descripcion,
    ip: `181.44.10.${10 + (i % 15)}`,
    contrato: ejemplo.entidad === "Contrato" ? ejemplo.descripcion.split(":")[0] : "",
    antes: ejemplo.tipo === "Cambio de estado" ? "Estado: Borrador" : "",
    despues: ejemplo.tipo === "Cambio de estado" ? "Estado: En Revisión" : "",
    version: ejemplo.entidad === "Contrato" ? `v${(i % 4) + 1}` : "",
    hash: ejemplo.entidad === "Contrato" ? hashSimulado("auditoria" + i) : "",
  });
}

// Agrega un registro nuevo al principio (más reciente primero)
export function registrarAuditoria(datos) {
  registrosAuditoria.unshift({
    id: registrosAuditoria.length + 1,
    fecha: formatearFechaHoraSegundos(new Date()),
    ip: "181.44.10.20",
    contrato: "",
    antes: "",
    despues: "",
    version: "",
    hash: "",
    ...datos,
  });
}

// La PRIMERA exportación de la sesión falla (para mostrar el camino alternativo).
let exportacionYaFallo = false;

export function simularExportacion() {
  if (!exportacionYaFallo) {
    exportacionYaFallo = true;
    return false;
  }
  return true;
}
