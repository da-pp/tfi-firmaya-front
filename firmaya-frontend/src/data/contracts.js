// Contratos de prueba con sus versiones, partes invitadas y comentarios.
// Los datos viven en memoria: se reinician al recargar la página.

import { hashSimulado, formatearFechaHora } from "@/lib/utils";

// Estados posibles del contrato
export const ESTADOS_CONTRATO = ["Borrador", "En Revisión", "Listo para firmar", "Firmado", "Archivado"];

// Transiciones manuales permitidas (CU-05). Listo para firmar → Firmado es automática (CU-08).
export const TRANSICIONES = {
  Borrador: ["En Revisión"],
  "En Revisión": ["Listo para firmar"],
  Firmado: ["Archivado"],
};

// ---------- Contenidos de ejemplo ----------

const intro =
  "<h3>CONTRATO DE LOCACIÓN</h3><p>Entre el Sr./Sra. Juan Pérez, en adelante \"EL LOCADOR\", y la Sra. Ana Martínez, en adelante \"LA LOCATARIA\", acuerdan celebrar el presente contrato.</p>";
const inmueble =
  "<p>El inmueble objeto del presente se encuentra ubicado en Av. Corrientes 1240, Ciudad Autónoma de Buenos Aires.</p>";
const cierre =
  "<p>Las partes dejan constancia de que el presente documento será firmado mediante mecanismo de verificación OTP y registro de integridad por hash.</p>";

function version(numero, autor, fecha, comentario, contenido, hash) {
  return { numero, autor, fecha, comentario, contenido, hash: hash || hashSimulado(contenido + numero) };
}

function parte(datos) {
  return {
    estadoInvitacion: "Invitación enviada",
    estadoFirma: "Pendiente",
    fechaEvento: "",
    ip: "",
    hashFirma: "",
    bloqueado: false,
    notificaciones: true,
    ...datos,
  };
}

// ---------- Contratos ----------

export const contratos = [
  {
    id: 1,
    nombre: "Locación - Av. Corrientes 1240",
    tipo: "Arrendamiento",
    estado: "En Revisión",
    creador: "Daniel Pérez",
    partesInvolucradas: "Juan Pérez / Ana Martínez",
    fechaInicio: "01/06/2026",
    fechaExpiracion: "31/05/2028",
    descripcionPropiedad: "Departamento de 2 ambientes en Av. Corrientes 1240.",
    solicitudFirmaEnviada: false,
    falloPdf: false,
    versiones: [
      version(1, "Sistema", "12/05/2026 09:00", "Creación inicial", intro + "<p>El contrato tendrá una duración de 12 meses.</p>"),
      version(2, "Daniel Pérez", "13/05/2026 12:20", "Primera revisión", intro + inmueble + "<p>El contrato tendrá una duración de 12 meses.</p>"),
      version(3, "María Gómez", "14/05/2026 18:05", "Corrección de datos", intro + inmueble + "<p>El contrato tendrá una duración de 12 meses.</p>" + cierre),
      version(4, "Daniel Pérez", "15/05/2026 10:42", "Ajuste de cláusula", intro + inmueble + "<p>El contrato tendrá una duración de 24 meses.</p>" + cierre, "a3f91c24d8e7b6a0f4c912bb75e82d74d109ac03cf2b91a70f9b8e62d51a9c44"),
    ],
    partes: [
      parte({ id: 1, nombre: "Ana Martínez", email: "ana@mail.com", rol: "Firmante", tokenAcceso: "acc-ana", tokenFirma: "firma-ana-c1" }),
      parte({ id: 2, nombre: "Carlos Ruiz", email: "carlos@mail.com", rol: "Revisor", estadoInvitacion: "Pendiente", tokenAcceso: "acc-carlos" }),
      parte({ id: 3, nombre: "Lucía Fernández", email: "lucia@mail.com", rol: "Solo lectura", tokenAcceso: "acc-lucia" }),
    ],
    comentarios: [
      { autor: "María Gómez", fecha: "15/05/2026 11:10", texto: "Revisar el plazo antes de solicitar firma.", fragmento: "" },
    ],
  },
  {
    id: 2,
    nombre: "Boleto de compraventa - Palermo",
    tipo: "Venta",
    estado: "Listo para firmar",
    creador: "María Gómez",
    partesInvolucradas: "Ana Martínez / Juan Pérez / Carlos Ruiz",
    fechaInicio: "20/05/2026",
    fechaExpiracion: "",
    descripcionPropiedad: "PH en Palermo.",
    solicitudFirmaEnviada: true,
    falloPdf: false,
    versiones: [
      version(1, "Sistema", "10/05/2026 09:30", "Creación inicial", "<h3>BOLETO DE COMPRAVENTA</h3><p>Entre Ana Martínez, en adelante \"LA PARTE VENDEDORA\", y Juan Pérez, en adelante \"LA PARTE COMPRADORA\", se celebra el presente boleto de compraventa.</p><p>El inmueble objeto de la operación se encuentra ubicado en Palermo, Ciudad Autónoma de Buenos Aires.</p>"),
      version(2, "María Gómez", "14/05/2026 18:05", "Precio y forma de pago", "<h3>BOLETO DE COMPRAVENTA</h3><p>Entre Ana Martínez, en adelante \"LA PARTE VENDEDORA\", y Juan Pérez, en adelante \"LA PARTE COMPRADORA\", se celebra el presente boleto de compraventa.</p><p>El inmueble objeto de la operación se encuentra ubicado en Palermo, Ciudad Autónoma de Buenos Aires.</p><p>El precio total se abonará en dos cuotas iguales. Carlos Ruiz interviene como garante de la operación.</p><p>Las partes firman el presente mediante verificación OTP.</p>"),
    ],
    partes: [
      parte({ id: 1, nombre: "Ana Martínez", email: "ana@mail.com", rol: "Firmante", estadoFirma: "Firmado", fechaEvento: "15/05/2026 11:31", ip: "181.44.10.22", hashFirma: hashSimulado("firma-ana"), tokenAcceso: "acc-ana-c2", tokenFirma: "firma-ana" }),
      parte({ id: 2, nombre: "Juan Pérez", email: "juan@mail.com", rol: "Firmante", estadoFirma: "Notificado", fechaEvento: "15/05/2026 10:50", tokenAcceso: "acc-juan", tokenFirma: "firma-juan" }),
      parte({ id: 3, nombre: "Carlos Ruiz", email: "carlos.fallo@mail.com", rol: "Firmante", tokenAcceso: "acc-carlos-c2", tokenFirma: "firma-carlos" }),
    ],
    comentarios: [],
  },
  {
    id: 3,
    nombre: "Mandato administración - Local Centro",
    tipo: "Mandato",
    estado: "Firmado",
    creador: "Pablo Sosa",
    partesInvolucradas: "Laura Díaz / Inmobiliaria Centro",
    fechaInicio: "01/05/2026",
    fechaExpiracion: "30/04/2027",
    descripcionPropiedad: "Local comercial en el centro.",
    solicitudFirmaEnviada: true,
    falloPdf: true, // la primera generación del PDF falla (camino alternativo de CU-10)
    versiones: [1, 2, 3, 4, 5].map((n) =>
      version(n, n === 1 ? "Sistema" : "Pablo Sosa", `0${n}/05/2026 09:${n}0`, n === 1 ? "Creación inicial" : `Revisión ${n}`, `<h3>CONTRATO DE MANDATO</h3><p>Laura Díaz otorga a Inmobiliaria Centro mandato para la administración del local ubicado en el centro de la ciudad.</p><p>Revisión número ${n} del contrato.</p>`)
    ),
    partes: [
      parte({ id: 1, nombre: "Laura Díaz", email: "laura.d@mail.com", rol: "Firmante", estadoFirma: "Firmado", fechaEvento: "06/05/2026 15:20", ip: "181.44.10.30", hashFirma: hashSimulado("firma-laura"), tokenAcceso: "acc-laura" }),
    ],
    comentarios: [],
  },
  {
    id: 4,
    nombre: "Locación - Belgrano",
    tipo: "Arrendamiento",
    estado: "Borrador",
    creador: "Pablo Sosa",
    partesInvolucradas: "Pedro Gil / Sofía Rey",
    fechaInicio: "01/11/2026",
    fechaExpiracion: "",
    descripcionPropiedad: "",
    solicitudFirmaEnviada: false,
    falloPdf: false,
    versiones: [
      version(1, "Sistema", "01/10/2026 10:00", "Creación inicial", "<h3>CONTRATO DE LOCACIÓN</h3><p>Entre Pedro Gil, en adelante \"EL LOCADOR\", y Sofía Rey, en adelante \"LA LOCATARIA\", acuerdan celebrar el presente contrato de locación sobre el inmueble ubicado en Belgrano.</p>"),
    ],
    partes: [],
    comentarios: [],
  },
  {
    id: 5,
    nombre: "Mandato - Recoleta",
    tipo: "Mandato",
    estado: "En Revisión",
    creador: "María Gómez",
    partesInvolucradas: "Inés Vidal / María Gómez",
    fechaInicio: "15/10/2026",
    fechaExpiracion: "",
    descripcionPropiedad: "",
    solicitudFirmaEnviada: false,
    falloPdf: false,
    versiones: [
      version(1, "Sistema", "28/09/2026 09:00", "Creación inicial", "<h3>CONTRATO DE MANDATO</h3><p>Inés Vidal otorga mandato para la administración del inmueble ubicado en Recoleta.</p>"),
      version(2, "María Gómez", "30/09/2026 16:40", "Se agregan obligaciones", "<h3>CONTRATO DE MANDATO</h3><p>Inés Vidal otorga mandato para la administración del inmueble ubicado en Recoleta.</p><p>El mandatario deberá rendir cuentas mensualmente.</p>"),
    ],
    partes: [
      parte({ id: 1, nombre: "Tomás Rey", email: "tomas@mail.com", rol: "Revisor", tokenAcceso: "acc-tomas" }),
    ],
    comentarios: [],
  },
  {
    id: 6,
    nombre: "Locación - San Telmo",
    tipo: "Arrendamiento",
    estado: "Archivado",
    creador: "Daniel Pérez",
    partesInvolucradas: "Raúl Paz / Julia Sanz",
    fechaInicio: "01/01/2025",
    fechaExpiracion: "31/12/2025",
    descripcionPropiedad: "",
    solicitudFirmaEnviada: true,
    falloPdf: false,
    versiones: [
      version(1, "Sistema", "20/12/2024 09:00", "Creación inicial", "<h3>CONTRATO DE LOCACIÓN</h3><p>Entre Raúl Paz y Julia Sanz se celebra el presente contrato de locación sobre el inmueble ubicado en San Telmo.</p>"),
    ],
    partes: [
      parte({ id: 1, nombre: "Julia Sanz", email: "julia@mail.com", rol: "Firmante", estadoFirma: "Firmado", fechaEvento: "22/12/2024 12:00", ip: "181.44.10.40", hashFirma: hashSimulado("firma-julia"), tokenAcceso: "acc-archivado" }),
    ],
    comentarios: [],
  },
];

// ---------- Consultas ----------

export function getContrato(id) {
  return contratos.find((c) => c.id === Number(id));
}

export function versionActual(contrato) {
  return contrato.versiones[contrato.versiones.length - 1];
}

export function firmantes(contrato) {
  return contrato.partes.filter((p) => p.rol === "Firmante");
}

export function firmasCompletadas(contrato) {
  return firmantes(contrato).filter((p) => p.estadoFirma === "Firmado").length;
}

export function esEditable(contrato) {
  return contrato.estado === "Borrador" || contrato.estado === "En Revisión";
}

// Busca la parte (y su contrato) por el token del enlace de acceso (CU-04)
export function buscarPorTokenAcceso(token) {
  for (const contrato of contratos) {
    const p = contrato.partes.find((x) => x.tokenAcceso === token);
    if (p) return { contrato, parte: p };
  }
  return null;
}

// Busca la parte (y su contrato) por el token del enlace de firma (CU-08)
export function buscarPorTokenFirma(token) {
  for (const contrato of contratos) {
    const p = contrato.partes.find((x) => x.tokenFirma === token);
    if (p) return { contrato, parte: p };
  }
  return null;
}

export function enlaceAcceso(parteInvitada) {
  return `${window.location.origin}/acceso/${parteInvitada.tokenAcceso}`;
}

export function enlaceFirma(parteInvitada) {
  return `${window.location.origin}/firmar/${parteInvitada.tokenFirma}`;
}

// ---------- Acciones ----------

export function crearContrato(datos, contenido, autor) {
  const nuevo = {
    ...datos,
    id: contratos.length + 1,
    estado: "Borrador",
    creador: autor,
    solicitudFirmaEnviada: false,
    falloPdf: false,
    versiones: [version(1, autor, formatearFechaHora(new Date()), "Creación inicial", contenido)],
    partes: [],
    comentarios: [],
  };
  contratos.push(nuevo);
  return nuevo;
}

// Guarda una nueva versión numerada (CU-02 y CU-14)
export function agregarVersion(contrato, contenido, comentario, autor) {
  const numero = versionActual(contrato).numero + 1;
  const nueva = version(numero, autor, formatearFechaHora(new Date()), comentario, contenido, hashSimulado(contenido + numero + Date.now()));
  contrato.versiones.push(nueva);
  return nueva;
}

export function agregarParte(contrato, datos) {
  const id = contrato.partes.length + 1;
  const nueva = parte({
    ...datos,
    id,
    estadoInvitacion: "Pendiente",
    tokenAcceso: `acc-${contrato.id}-${id}-${Date.now()}`,
    tokenFirma: datos.rol === "Firmante" ? `firma-${contrato.id}-${id}-${Date.now()}` : undefined,
  });
  contrato.partes.push(nueva);
  return nueva;
}
