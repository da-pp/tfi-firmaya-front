// Generador de PDF muy simple (solo texto) para simular CU-10.
// Arma el archivo PDF "a mano": páginas A4, fuente Helvetica,
// y un pie de página repetido en cada página.

const ANCHO_LINEA = 95; // caracteres aproximados por línea
const LINEAS_POR_PAGINA = 58;

// Reemplaza caracteres que la fuente básica no soporta
function limpiar(texto) {
  return texto
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[—–]/g, "-")
    .replace(/…/g, "...")
    .replace(/[^\x00-\xFF]/g, "?")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

// Corta un párrafo largo en varias líneas
function cortarEnLineas(parrafo) {
  const palabras = parrafo.split(" ");
  const lineas = [];
  let actual = "";
  palabras.forEach((palabra) => {
    if ((actual + " " + palabra).trim().length > ANCHO_LINEA) {
      lineas.push(actual);
      actual = palabra;
    } else {
      actual = (actual + " " + palabra).trim();
    }
  });
  lineas.push(actual);
  return lineas;
}

// parrafos: array de textos. pie: texto que va al final de cada página.
// Devuelve un Uint8Array listo para descargar.
export function generarPdf(parrafos, pie) {
  // 1. Pasamos todos los párrafos a líneas
  let lineas = [];
  parrafos.forEach((p) => {
    lineas = lineas.concat(cortarEnLineas(p));
  });

  // 2. Repartimos las líneas en páginas
  const paginas = [];
  for (let i = 0; i < lineas.length; i += LINEAS_POR_PAGINA) {
    paginas.push(lineas.slice(i, i + LINEAS_POR_PAGINA));
  }

  // 3. Armamos los objetos del PDF
  const objetos = [];
  objetos[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objetos[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>";

  const idsPaginas = [];
  paginas.forEach((lineasPagina, indice) => {
    const idPagina = 4 + indice * 2;
    const idContenido = idPagina + 1;
    idsPaginas.push(idPagina);

    let contenido = "BT /F1 10 Tf 13 TL 50 800 Td\n";
    lineasPagina.forEach((linea) => {
      contenido += `(${limpiar(linea)}) Tj T*\n`;
    });
    contenido += "ET\n";
    contenido += `BT /F1 7 Tf 50 30 Td (${limpiar(pie)}) Tj ET\n`;

    objetos[idPagina] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] ` +
      `/Resources << /Font << /F1 3 0 R >> >> /Contents ${idContenido} 0 R >>`;
    objetos[idContenido] = `<< /Length ${contenido.length} >>\nstream\n${contenido}endstream`;
  });

  objetos[2] = `<< /Type /Pages /Kids [${idsPaginas.map((id) => `${id} 0 R`).join(" ")}] /Count ${idsPaginas.length} >>`;

  // 4. Escribimos el archivo calculando la posición de cada objeto (xref)
  let pdf = "%PDF-1.4\n";
  const posiciones = [];
  for (let id = 1; id < objetos.length; id++) {
    posiciones[id] = pdf.length;
    pdf += `${id} 0 obj\n${objetos[id]}\nendobj\n`;
  }
  const inicioXref = pdf.length;
  pdf += `xref\n0 ${objetos.length}\n0000000000 65535 f \n`;
  for (let id = 1; id < objetos.length; id++) {
    pdf += `${String(posiciones[id]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objetos.length} /Root 1 0 R >>\nstartxref\n${inicioXref}\n%%EOF`;

  // 5. Cada carácter es un byte (Latin-1)
  const bytes = new Uint8Array(pdf.length);
  for (let i = 0; i < pdf.length; i++) bytes[i] = pdf.charCodeAt(i);
  return bytes;
}
