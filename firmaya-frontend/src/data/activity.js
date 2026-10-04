// Datos para el Panel de Actividad Global (CU-17).
// Generamos 70 contratos de ejemplo con fechas relativas a hoy,
// así el período predeterminado (últimos 30 días) siempre tiene datos.

import { formatearFecha, formatearFechaHora, sumarDias, hoy } from "@/lib/utils";

const nombres = ["Locación", "Boleto de compraventa", "Mandato administración", "Locación comercial"];
const barrios = ["Palermo", "Belgrano", "Recoleta", "Caballito", "Centro", "San Telmo", "Núñez"];
const estados = ["Borrador", "En Revisión", "Listo para firmar", "Firmado", "Archivado"];
const responsables = ["María Gómez", "Daniel Pérez", "Pablo Sosa", "Laura Díaz"];

export const contratosReporte = [];

for (let i = 0; i < 70; i++) {
  const modificacion = sumarDias(new Date(), -Math.floor(i * 0.9));
  modificacion.setHours(9 + (i % 9), (i * 11) % 60);
  contratosReporte.push({
    id: i + 1,
    nombre: `${nombres[i % nombres.length]} - ${barrios[i % barrios.length]} ${100 + i}`,
    estado: estados[(i * 3) % estados.length],
    responsable: responsables[i % responsables.length],
    modificacion, // Date (para filtrar y ordenar)
    ultimaModificacion: formatearFechaHora(modificacion),
    // algunos vencen en los próximos días
    fechaExpiracion: formatearFecha(sumarDias(hoy(), (i % 12) + 1)),
    vence: sumarDias(hoy(), (i % 12) + 1),
  });
}
