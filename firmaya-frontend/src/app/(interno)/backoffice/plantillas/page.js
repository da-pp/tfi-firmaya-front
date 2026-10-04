"use client";

// CU-16 – Gestionar plantillas de contrato

import { useState } from "react";
import { Settings, Plus, Save } from "lucide-react";
import PageTitle from "@/components/PageTitle";
import FormField from "@/components/FormField";
import RichEditor from "@/components/RichEditor";
import Alert from "@/components/Alert";
import Badge from "@/components/Badge";
import Modal from "@/components/Modal";
import { plantillas, TIPOS_CONTRATO, guardarPlantilla, detectarCampos } from "@/data/templates";
import { registrarAuditoria } from "@/data/audit";
import { useUsuario } from "@/data/session";

const VACIO = { id: null, nombre: "", tipo: "", descripcion: "", cuerpo: "", estado: "" };

export default function PlantillasPage() {
  const { usuario } = useUsuario();

  const [form, setForm] = useState(VACIO);
  const [textoCuerpo, setTextoCuerpo] = useState("");
  // Cambia cada vez que se carga otra plantilla, para reiniciar el editor
  const [claveEditor, setClaveEditor] = useState(0);
  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState("");
  const [avisoSinCampos, setAvisoSinCampos] = useState(false);
  const [plantillaConContratos, setPlantillaConContratos] = useState(null);

  // Paso 14: campos dinámicos detectados
  const campos = detectarCampos(textoCuerpo);

  function cargarEnEditor(datos) {
    setForm(datos);
    setTextoCuerpo(datos.cuerpo.replace(/<[^>]+>/g, " "));
    setClaveEditor((n) => n + 1);
    setErrores({});
    setMensaje("");
  }

  function nuevaPlantilla() {
    cargarEnEditor(VACIO);
  }

  // Camino alternativo: editar una plantilla con contratos activos
  function editar(plantilla) {
    if (plantilla.contratosActivos > 0) {
      setPlantillaConContratos(plantilla);
      return;
    }
    cargarEnEditor({ ...plantilla });
  }

  function cambiar(campo, valor) {
    setForm({ ...form, [campo]: valor });
    setErrores({ ...errores, [campo]: "" });
  }

  function guardar(sinCampos) {
    const plantilla = guardarPlantilla({ ...form, nombre: form.nombre.trim() });
    registrarAuditoria({
      usuario: usuario.email,
      tipo: form.id ? "Edición" : "Creación",
      entidad: "Plantilla",
      descripcion: `${form.id ? "Nueva versión" : "Alta"} de la plantilla ${plantilla.nombre}${sinCampos ? " (sin campos dinámicos)" : ""}`,
    });
    setAvisoSinCampos(false);
    cargarEnEditor(VACIO);
    setMensaje("Plantilla guardada exitosamente.");
  }

  // Pasos 16-20
  function alGuardar() {
    const nuevos = {};
    if (form.nombre.trim() === "") nuevos.nombre = "Este campo es obligatorio";
    if (!form.tipo) nuevos.tipo = "Este campo es obligatorio";
    if (textoCuerpo.trim() === "") nuevos.cuerpo = "Este campo es obligatorio";
    if (!form.estado) nuevos.estado = "Este campo es obligatorio";
    setErrores(nuevos);
    if (Object.keys(nuevos).length > 0) return;

    if (campos.length === 0) {
      setAvisoSinCampos(true);
      return;
    }
    guardar(false);
  }

  return (
    <>
      <PageTitle icono={Settings} titulo="Gestionar plantillas de contratos" />
      {mensaje && <Alert tipo="exito" texto={mensaje} />}

      <div className="grilla grilla-1-2">
        <div className="card">
          <div className="card-titulo">
            <h2>Plantillas</h2>
            <button className="btn btn-primario btn-chico" onClick={nuevaPlantilla}>
              <Plus size={12} /> Nueva Plantilla
            </button>
          </div>
          <div className="tabla-contenedor">
            <table className="tabla">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Tipo</th>
                  <th>Estado</th>
                  <th>Versión</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {plantillas.map((p) => (
                  <tr key={p.id}>
                    <td><strong>{p.nombre}</strong></td>
                    <td className="texto-suave">{p.tipo}</td>
                    <td><Badge texto={p.estado} /></td>
                    <td className="texto-suave">Versión {p.version}</td>
                    <td><button className="btn btn-chico" onClick={() => editar(p)}>Editar</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h2 className="mb-16">Editor de plantilla</h2>

          <div className="grilla grilla-2" style={{ gap: "0 16px" }}>
            <FormField etiqueta="Nombre de la plantilla" obligatorio error={errores.nombre}>
              <input className={errores.nombre ? "input con-error" : "input"} placeholder="Ej: Locación vivienda" maxLength={200} value={form.nombre} onChange={(e) => cambiar("nombre", e.target.value)} />
            </FormField>
            <FormField etiqueta="Tipo de contrato" obligatorio error={errores.tipo}>
              <select className={errores.tipo ? "select con-error" : "select"} value={form.tipo} onChange={(e) => cambiar("tipo", e.target.value)}>
                <option value="">Seleccionar</option>
                {TIPOS_CONTRATO.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </FormField>
          </div>

          <FormField etiqueta="Descripción de uso">
            <textarea className="textarea" style={{ minHeight: 60 }} placeholder="Uso o alcance de la plantilla." maxLength={500} value={form.descripcion} onChange={(e) => cambiar("descripcion", e.target.value)} />
          </FormField>

          <FormField etiqueta="Plantilla" obligatorio error={errores.cuerpo}>
            <RichEditor
              key={claveEditor}
              valorInicial={form.cuerpo}
              alto={160}
              conError={!!errores.cuerpo}
              onCambio={(html, texto) => {
                setForm((anterior) => ({ ...anterior, cuerpo: html }));
                setTextoCuerpo(texto);
                setErrores((anterior) => ({ ...anterior, cuerpo: "" }));
              }}
            />
          </FormField>

          <FormField etiqueta="Estado" obligatorio error={errores.estado}>
            <div className="opciones-radio">
              {["Activa", "Inactiva"].map((estado) => (
                <label key={estado}>
                  <input type="radio" name="estado-plantilla" checked={form.estado === estado} onChange={() => cambiar("estado", estado)} /> {estado}
                </label>
              ))}
            </div>
          </FormField>

          <div className="caja-gris mb-16">
            <strong className="texto-chico">Campos dinámicos detectados</strong>
            <div className="botonera mt-8">
              {campos.map((c) => <Badge key={c} texto={c} />)}
            </div>
          </div>

          <button className="btn btn-primario" onClick={alGuardar}>
            <Save size={14} /> Guardar Plantilla
          </button>
        </div>
      </div>

      {avisoSinCampos && (
        <Modal mensaje="La plantilla no tiene campos dinámicos definidos. ¿Desea guardarla de todos modos?">
          <button className="btn" onClick={() => setAvisoSinCampos(false)}>Volver a editar</button>
          <button className="btn btn-primario" onClick={() => guardar(true)}>Guardar sin campos</button>
        </Modal>
      )}

      {plantillaConContratos && (
        <Modal mensaje="Esta plantilla tiene contratos activos. Los cambios no afectarán a los contratos ya creados. ¿Desea continuar?">
          <button className="btn" onClick={() => setPlantillaConContratos(null)}>Cancelar</button>
          <button
            className="btn btn-primario"
            onClick={() => {
              cargarEnEditor({ ...plantillaConContratos });
              setPlantillaConContratos(null);
            }}
          >
            Continuar
          </button>
        </Modal>
      )}
    </>
  );
}
