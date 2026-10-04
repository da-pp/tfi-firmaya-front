"use client";

// CU-01 – Crear contrato desde plantilla

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Plus } from "lucide-react";
import PageTitle from "@/components/PageTitle";
import FormField from "@/components/FormField";
import { TIPOS_CONTRATO, plantillasActivas } from "@/data/templates";
import { crearContrato } from "@/data/contracts";
import { registrarAuditoria } from "@/data/audit";
import { useUsuario, guardarFlash } from "@/data/session";
import { nombreCompleto } from "@/data/users";
import { leerFecha, hoy } from "@/lib/utils";

const ERROR_OBLIGATORIO = "Este campo es obligatorio";
const ERROR_FECHA_INICIO = "La fecha debe tener el formato DD/MM/AAAA y no puede ser anterior a la fecha de hoy";
const ERROR_FECHA_FORMATO = "La fecha debe tener el formato DD/MM/AAAA";

export default function NuevoContratoPage() {
  const router = useRouter();
  const { usuario } = useUsuario();

  const [tipo, setTipo] = useState("");
  const [datos, setDatos] = useState({
    nombre: "",
    partesInvolucradas: "",
    fechaInicio: "",
    fechaExpiracion: "",
    descripcionPropiedad: "",
  });
  const [errores, setErrores] = useState({});

  const activas = plantillasActivas();
  // Tipos que tienen al menos una plantilla activa
  const tiposDisponibles = TIPOS_CONTRATO.filter((t) => activas.some((p) => p.tipo === t));

  // Camino alternativo: no hay plantillas disponibles (paso 2)
  useEffect(() => {
    if (activas.length === 0) {
      guardarFlash("error", "No hay plantillas disponibles. Contacte al administrador del sistema.");
      router.replace("/panel");
    }
  }, [activas.length, router]);

  // Solo Abogado o Agente Inmobiliario (precondición)
  useEffect(() => {
    if (usuario && usuario.rol === "Administrador") router.replace("/panel");
  }, [usuario, router]);

  function cambiar(campo, valor) {
    setDatos({ ...datos, [campo]: valor });
    setErrores({ ...errores, [campo]: "" });
  }

  // Paso 16: validaciones
  function validar() {
    const nuevos = {};
    if (!tipo) nuevos.tipo = ERROR_OBLIGATORIO;
    if (datos.nombre.trim() === "") nuevos.nombre = ERROR_OBLIGATORIO;
    if (datos.partesInvolucradas.trim() === "") nuevos.partesInvolucradas = ERROR_OBLIGATORIO;

    if (datos.fechaInicio.trim() === "") {
      nuevos.fechaInicio = ERROR_OBLIGATORIO;
    } else {
      const fecha = leerFecha(datos.fechaInicio);
      if (!fecha || fecha < hoy()) nuevos.fechaInicio = ERROR_FECHA_INICIO;
    }

    if (datos.fechaExpiracion.trim() !== "" && !leerFecha(datos.fechaExpiracion)) {
      nuevos.fechaExpiracion = ERROR_FECHA_FORMATO;
    }

    setErrores(nuevos);
    return Object.keys(nuevos).length === 0;
  }

  function crear() {
    if (!validar()) return;
    const plantilla = activas.find((p) => p.tipo === tipo);
    const autor = nombreCompleto(usuario);
    // Pasos 17-19: versión 1, hash y estado Borrador
    const contrato = crearContrato({ ...datos, tipo, plantillaId: plantilla.id }, plantilla.cuerpo, autor);
    registrarAuditoria({
      usuario: usuario.email,
      tipo: "Creación",
      entidad: "Contrato",
      descripcion: `Creación de ${contrato.nombre}`,
      contrato: contrato.nombre,
      version: "v1",
      hash: contrato.versiones[0].hash,
    });
    // Paso 20
    guardarFlash("exito", "Contrato creado exitosamente");
    router.push(`/contratos/${contrato.id}/editar`);
  }

  const sinTipo = tipo === "";

  return (
    <>
      <PageTitle icono={FileText} titulo="Crear contrato desde plantilla" />

      <div className="grilla grilla-1-2">
        <div className="card">
          <h2>1. Selección de plantilla</h2>
          <p className="card-subtitulo mb-16">Elegí el tipo de contrato que querés crear.</p>
          <FormField etiqueta="Tipo de plantilla" obligatorio error={errores.tipo}>
            <select
              className={errores.tipo ? "select con-error" : "select"}
              value={tipo}
              onChange={(e) => {
                setTipo(e.target.value);
                setErrores({ ...errores, tipo: "" });
              }}
            >
              <option value="">Seleccionar</option>
              {tiposDisponibles.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </FormField>
        </div>

        <div className="card">
          <h2 className="mb-16">2. Datos iniciales del contrato</h2>

          <div className="grilla grilla-2" style={{ gap: "0 16px" }}>
            <FormField etiqueta="Nombre del Contrato" obligatorio error={errores.nombre}>
              <input
                className={errores.nombre ? "input con-error" : "input"}
                placeholder="Ej: Contrato de locación - Corrientes 1240"
                maxLength={200}
                disabled={sinTipo}
                value={datos.nombre}
                onChange={(e) => cambiar("nombre", e.target.value)}
              />
            </FormField>
            <FormField etiqueta="Partes Involucradas" obligatorio error={errores.partesInvolucradas}>
              <input
                className={errores.partesInvolucradas ? "input con-error" : "input"}
                placeholder="Ej: Juan Pérez / Inmobiliaria Centro"
                maxLength={1000}
                disabled={sinTipo}
                value={datos.partesInvolucradas}
                onChange={(e) => cambiar("partesInvolucradas", e.target.value)}
              />
            </FormField>
            <FormField etiqueta="Fecha de Inicio" obligatorio error={errores.fechaInicio}>
              <input
                className={errores.fechaInicio ? "input con-error" : "input"}
                placeholder="DD/MM/AAAA"
                disabled={sinTipo}
                value={datos.fechaInicio}
                onChange={(e) => cambiar("fechaInicio", e.target.value)}
              />
            </FormField>
            <FormField etiqueta="Fecha de Expiración" error={errores.fechaExpiracion}>
              <input
                className={errores.fechaExpiracion ? "input con-error" : "input"}
                placeholder="DD/MM/AAAA"
                disabled={sinTipo}
                value={datos.fechaExpiracion}
                onChange={(e) => cambiar("fechaExpiracion", e.target.value)}
              />
            </FormField>
          </div>

          <FormField etiqueta="Descripción de la Propiedad">
            <textarea
              className="textarea"
              placeholder="Ingresá domicilio, características principales y observaciones."
              maxLength={2000}
              disabled={sinTipo}
              value={datos.descripcionPropiedad}
              onChange={(e) => cambiar("descripcionPropiedad", e.target.value)}
            />
          </FormField>

          <div className="botonera botonera-derecha">
            <button className="btn" onClick={() => router.push("/panel")}>Cancelar</button>
            <button className="btn btn-primario" onClick={crear}>
              <Plus size={14} /> Crear Contrato
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
