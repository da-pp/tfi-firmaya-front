// Usuarios internos de prueba (CU-15, CU-19, CU-21).
// Contraseña de todos los usuarios de prueba: Password1!

export const ROLES_INTERNOS = ["Administrador", "Abogado", "Agente Inmobiliario"];

export const usuarios = [
  { id: 1, nombre: "Daniel", apellido: "Pérez", email: "daniel@mail.com", rol: "Administrador", estado: "Activo", password: "Password1!" },
  { id: 2, nombre: "María", apellido: "Gómez", email: "maria@mail.com", rol: "Abogado", estado: "Activo", password: "Password1!" },
  { id: 3, nombre: "Laura", apellido: "Díaz", email: "laura@mail.com", rol: "Agente Inmobiliario", estado: "Inactivo", password: "Password1!" },
  { id: 4, nombre: "Pablo", apellido: "Sosa", email: "pablo@mail.com", rol: "Agente Inmobiliario", estado: "Activo", password: "Password1!" },
];

export function nombreCompleto(usuario) {
  return `${usuario.nombre} ${usuario.apellido}`;
}

export function buscarUsuarioPorEmail(email) {
  return usuarios.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
}

export function crearUsuario(datos) {
  const nuevo = {
    ...datos,
    id: usuarios.length + 1,
    password: "",
  };
  usuarios.push(nuevo);
  return nuevo;
}

export function actualizarUsuario(id, datos) {
  const usuario = usuarios.find((u) => u.id === id);
  Object.assign(usuario, datos);
  return usuario;
}
