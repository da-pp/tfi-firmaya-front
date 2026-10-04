// Etiqueta redondeada para estados, roles, etc.
// El color se elige según el texto.

const COLORES = {
  // Estados de contrato
  "En Revisión": "amarillo",
  "Listo para firmar": "azul",
  Firmado: "verde",
  // Estados de firma e invitación
  Pendiente: "amarillo",
  Notificado: "amarillo",
  "Re-notificado": "amarillo",
  "Invitación enviada": "amarillo",
  // Usuarios y plantillas
  Activo: "verde",
  Activa: "verde",
  Inactivo: "rojo",
  Actual: "verde",
};

export default function Badge({ texto, color }) {
  const colorFinal = color || COLORES[texto];
  const clase = colorFinal ? `badge badge-${colorFinal}` : "badge";
  return <span className={clase}>{texto}</span>;
}
