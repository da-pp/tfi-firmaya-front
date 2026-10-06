// Datos fijos de las plantillas de contrato (CU-16) que se usan para crear contratos (CU-01).
// Las plantillas en sí vienen del backend.

export const TIPOS_CONTRATO = ["Arrendamiento", "Venta", "Mandato", "Otro"];

// Detecta los marcadores {{campo}} de un texto (mismo patrón que usa el backend)
export function detectarCampos(texto) {
  const encontrados = texto.match(/\{\{[^{}]+\}\}/g) || [];
  const limpios = encontrados.map((m) => `{{${m.slice(2, -2).trim()}}}`);
  return [...new Set(limpios)];
}
