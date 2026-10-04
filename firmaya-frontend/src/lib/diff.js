// Comparación simple de dos textos palabra por palabra (CU-12).
// Usa el algoritmo clásico de "subsecuencia común más larga" (LCS).
// Devuelve una lista de partes: { tipo: "igual" | "eliminado" | "agregado", texto }

export function compararTextos(textoA, textoB) {
  // Separamos en palabras conservando los espacios y saltos de línea
  const a = textoA.split(/(\s+)/);
  const b = textoB.split(/(\s+)/);

  // tabla[i][j] = largo de la LCS entre a[i..] y b[j..]
  const tabla = [];
  for (let i = 0; i <= a.length; i++) {
    tabla.push(new Array(b.length + 1).fill(0));
  }
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      tabla[i][j] = a[i] === b[j] ? tabla[i + 1][j + 1] + 1 : Math.max(tabla[i + 1][j], tabla[i][j + 1]);
    }
  }

  // Recorremos la tabla para armar el resultado
  const partes = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      partes.push({ tipo: "igual", texto: a[i] });
      i++;
      j++;
    } else if (tabla[i + 1][j] >= tabla[i][j + 1]) {
      partes.push({ tipo: "eliminado", texto: a[i] });
      i++;
    } else {
      partes.push({ tipo: "agregado", texto: b[j] });
      j++;
    }
  }
  while (i < a.length) partes.push({ tipo: "eliminado", texto: a[i++] });
  while (j < b.length) partes.push({ tipo: "agregado", texto: b[j++] });

  // Numeramos los cambios: un bloque seguido de eliminados/agregados es UN cambio
  let numeroCambio = -1;
  let anteriorEraCambio = false;
  partes.forEach((parte) => {
    const esCambio = parte.tipo !== "igual";
    // Los espacios sueltos entre dos cambios no cortan el bloque
    const esEspacio = parte.texto.trim() === "";
    if (esCambio && !anteriorEraCambio) numeroCambio++;
    if (esCambio) parte.cambio = numeroCambio;
    if (!esEspacio || esCambio) anteriorEraCambio = esCambio;
  });

  return { partes, cantidadCambios: numeroCambio + 1 };
}
