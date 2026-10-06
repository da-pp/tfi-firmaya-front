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
import { TIPOS_CONTRATO, detectarCampos } from "@/data/templates";
import { api, useDatos } from "@/lib/api";

const VACIO = { id: null, nombre: "", tipo: "", descripcion: "", cuerpo: "", estado: "" };

export default function PlantillasPage() {
  const { datos: plantillas, error: errorPlantillas, recargar } = useDatos("/admin/plantillas");

  const [form, setForm] = useState(VACIO);
  const [textoCuerpo, setTextoCuerpo] = useState("");
  // Cambia cada vez que se carga otra plantilla, para reiniciar el editor
  const [claveEditor, setClaveEditor] = useState(0);
  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [avisoSinCampos, setAvisoSinCampos] = useState(false);
  const [plantillaConContratos, setPlantillaConContratos] = useState(null);

  // Paso 14: campos dinámicos detectados
  const campos = detectarCampos(textoCuerpo);

  function cargarEnEditor(datos) {
    setForm(datos);
    setTextoCuerpo(datos.cuerpo.replace(/<[^>]+>/g, " "));
    setClaveEditor((n) => n + 1);
    setErrores({});
    setMensaje(null);
  }

  function nuevaPlantilla() {
    cargarEnEditor(VACIO);
  }

  // Camino alternativo: editar una plantilla con contratos activos.
  // La lista no trae el cuerpo: se pide el detalle de la plantilla.
  async function editar(resumen) {
    try {
      const p = await api(`/admin/plantillas/${resumen.idPlantilla}`);
      const datos = { id: p.idPlantilla, nombre: p.nombre, tipo: p.tipoContrato, descripcion: p.descripcionUso || "", cuerpo: p.cuerpo, estado: p.estado };
      if (p.tieneContratosActivos) setPlantillaConContratos(datos);
      else cargarEnEditor(datos);
    } catch (e) {
      setMensaje({ tipo: "error", texto: e.message });
    }
  }

  function cambiar(campo, valor) {
    setForm({ ...form, [campo]: valor });
    setErrores({ ...errores, [campo]: "" });
  }

  // Pasos 17-20: el backend valida, guarda la plantilla versionada y registra la auditoría.
  // Si no tiene campos dinámicos responde 409 y hay que confirmar "Guardar sin campos".
  async function guardar(guardarSinCampos) {
    setAvisoSinCampos(false);
    setGuardando(true);
    const datos = {
      nombre: form.nombre.trim(),
      tipoContrato: form.tipo,
      descripcionUso: form.descripcion.trim(),
      cuerpo: form.cuerpo,
      estado: form.estado,
      guardarSinCampos,
    };
    try {
      const respuesta = form.id
        ? await api(`/admin/plantillas/${form.id}`, { metodo: "PUT", cuerpo: datos })
        : await api("/admin/plantillas", { metodo: "POST", cuerpo: datos });
      cargarEnEditor(VACIO);
      setMensaje({ tipo: "exito", texto: respuesta.mensaje });
      recargar();
    } catch (e) {
      if (e.estado === 409) setAvisoSinCampos(true);
      else if (Object.keys(e.errores).length > 0) {
        const { tipoContrato, descripcionUso, ...resto } = e.errores;
        setErrores({ ...resto, tipo: tipoContrato, descripcion: descripcionUso });
      } else setMensaje({ tipo: "error", texto: e.message });
    } finally {
      setGuardando(false);
    }
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
    guardar(false);
  }

  return (
    <>
      <PageTitle icono={Settings} titulo="Gestionar plantillas de contratos" />
      {mensaje && <Alert tipo={mensaje.tipo} texto={mensaje.texto} />}
      {errorPlantillas && <Alert tipo="error" texto={errorPlantillas.message} />}

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
                {(plantillas || []).map((p) => (
                  <tr key={p.idPlantilla}>
                    <td><strong>{p.nombre}</strong></td>
                    <td className="texto-suave">{p.tipoContrato}</td>
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

          <button className="btn btn-primario" onClick={alGuardar} disabled={guardando}>
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
