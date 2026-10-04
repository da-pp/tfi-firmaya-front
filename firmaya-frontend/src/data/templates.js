// Plantillas de contrato (CU-16) que se usan para crear contratos (CU-01).

export const TIPOS_CONTRATO = ["Arrendamiento", "Venta", "Mandato", "Otro"];

export const plantillas = [
  {
    id: 1,
    nombre: "Locación vivienda",
    tipo: "Arrendamiento",
    descripcion: "Contrato de locación para vivienda familiar.",
    cuerpo:
      "<h3>CONTRATO DE LOCACIÓN</h3><p>Entre {{locador}}, en adelante \"EL LOCADOR\", y {{locatario}}, en adelante \"LA LOCATARIA\", acuerdan celebrar el presente contrato de locación.</p><p>El inmueble objeto del presente se encuentra ubicado en {{inmueble}}.</p><p>La vigencia será de 24 meses a partir de la fecha de inicio indicada por las partes.</p>",
    estado: "Activa",
    version: 1,
    contratosActivos: 3,
  },
  {
    id: 2,
    nombre: "Compraventa inmueble",
    tipo: "Venta",
    descripcion: "Boleto de compraventa de inmueble.",
    cuerpo:
      "<h3>BOLETO DE COMPRAVENTA</h3><p>Entre {{vendedor}}, en adelante \"LA PARTE VENDEDORA\", y {{comprador}}, en adelante \"LA PARTE COMPRADORA\", se celebra el presente boleto de compraventa.</p><p>El inmueble objeto de la operación se encuentra ubicado en {{inmueble}} y el precio total es de {{precio}}.</p>",
    estado: "Activa",
    version: 2,
    contratosActivos: 0,
  },
  {
    id: 3,
    nombre: "Mandato administración",
    tipo: "Mandato",
    descripcion: "Mandato para administración de propiedades.",
    cuerpo:
      "<h3>CONTRATO DE MANDATO</h3><p>{{mandante}} otorga a {{mandatario}} mandato para la administración del inmueble ubicado en {{inmueble}}.</p>",
    estado: "Inactiva",
    version: 3,
    contratosActivos: 0,
  },
];

export function plantillasActivas() {
  return plantillas.filter((p) => p.estado === "Activa");
}

export function guardarPlantilla(datos) {
  if (datos.id) {
    // Editar: se crea una nueva versión de la plantilla
    const plantilla = plantillas.find((p) => p.id === datos.id);
    Object.assign(plantilla, datos, { version: plantilla.version + 1 });
    return plantilla;
  }
  const nueva = { ...datos, id: plantillas.length + 1, version: 1, contratosActivos: 0 };
  plantillas.push(nueva);
  return nueva;
}

// Detecta los marcadores {{campo}} de un texto
export function detectarCampos(texto) {
  const encontrados = texto.match(/\{\{\s*[\w]+\s*\}\}/g) || [];
  const limpios = encontrados.map((m) => m.replace(/\s/g, ""));
  return [...new Set(limpios)];
}
