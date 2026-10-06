"use client";

// CU-18 – Registro de acciones de auditoría

import { Fragment, useEffect, useState } from "react";
import { Search, Download, Eye } from "lucide-react";
import PageTitle from "@/components/PageTitle";
import FormField from "@/components/FormField";
import Alert from "@/components/Alert";
import Badge from "@/components/Badge";
import Modal from "@/components/Modal";
import Pagination from "@/components/Pagination";
import { TIPOS_ACCION } from "@/data/audit";
import { api, apiArchivo } from "@/lib/api";
import { leerFecha, descargarArchivo, fechaHoraDeIso } from "@/lib/utils";

const SIN_FILTROS = { desde: "", hasta: "", usuario: "", tipo: "", contrato: "" };

export default function AuditoriaPage() {
  const [form, setForm] = useState(SIN_FILTROS);
  const [filtros, setFiltros] = useState(SIN_FILTROS); // filtros aplicados al presionar "Buscar"
  const [errores, setErrores] = useState({});
  const [pagina, setPagina] = useState(1);
  const [expandido, setExpandido] = useState(null);
  const [detalle, setDetalle] = useState(null);
  const [errorExportacion, setErrorExportacion] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  // Página de resultados: { total, pagina, totalPaginas, mensaje, registros }
  const [resultado, setResultado] = useState(null);

  // Parámetros que entiende el backend (fechas DD/MM/AAAA)
  const params = {
    fechaDesde: filtros.desde,
    fechaHasta: filtros.hasta,
    usuario: filtros.usuario,
    tipoAccion: filtros.tipo,
    contrato: filtros.contrato,
  };
  const clave = JSON.stringify(params);

  // Pasos 2, 15, 16, 19 y 20: el backend filtra y pagina de a 50 registros
  useEffect(() => {
    let vigente = true;
    api("/admin/auditoria", { params: { ...JSON.parse(clave), pagina } })
      .then((datos) => vigente && setResultado(datos))
      .catch((e) => vigente && setMensaje({ tipo: "error", texto: e.message }));
    return () => {
      vigente = false;
    };
  }, [clave, pagina]);

  function buscar() {
    const nuevos = {};
    if (form.desde && !leerFecha(form.desde)) nuevos.desde = "La fecha debe tener el formato DD/MM/AAAA";
    if (form.hasta && !leerFecha(form.hasta)) nuevos.hasta = "La fecha debe tener el formato DD/MM/AAAA";
    setErrores(nuevos);
    if (Object.keys(nuevos).length > 0) return;
    setFiltros(form);
    setPagina(1);
    setExpandido(null);
    setMensaje(null);
  }

  function borrarFiltros() {
    setForm(SIN_FILTROS);
    setFiltros(SIN_FILTROS);
    setPagina(1);
  }

  // Paso 18: detalle del registro (datos antes y después, versión y hash)
  async function alternarDetalle(idRegistro) {
    if (expandido === idRegistro) {
      setExpandido(null);
      return;
    }
    setExpandido(idRegistro);
    setDetalle(null);
    try {
      setDetalle(await api(`/admin/auditoria/${idRegistro}`));
    } catch (e) {
      setMensaje({ tipo: "error", texto: e.message });
    }
  }

  // Pasos 21-25: el backend genera el CSV con los filtros activos
  async function exportar() {
    setErrorExportacion(false);
    try {
      const archivo = await apiArchivo("/admin/auditoria/exportar", { params });
      descargarArchivo("registro_auditoria.csv", archivo, "text/csv;charset=utf-8");
      setMensaje({ tipo: "exito", texto: "Registro exportado exitosamente." });
    } catch {
      setErrorExportacion(true);
    }
  }

  const registros = resultado ? resultado.registros : [];

  function cambiar(campo, valor) {
    setForm({ ...form, [campo]: valor });
  }

  return (
    <>
      <PageTitle icono={Search} titulo="Auditar log de acciones" />
      {mensaje && <Alert tipo={mensaje.tipo} texto={mensaje.texto} />}

      <div className="card">
        <div className="grilla" style={{ gridTemplateColumns: "repeat(5, 1fr) auto", alignItems: "start" }}>
          <FormField etiqueta="Desde" error={errores.desde}>
            <input className={errores.desde ? "input con-error" : "input"} placeholder="DD/MM/AAAA" value={form.desde} onChange={(e) => cambiar("desde", e.target.value)} />
          </FormField>
          <FormField etiqueta="Hasta" error={errores.hasta}>
            <input className={errores.hasta ? "input con-error" : "input"} placeholder="DD/MM/AAAA" value={form.hasta} onChange={(e) => cambiar("hasta", e.target.value)} />
          </FormField>
          <FormField etiqueta="Usuario">
            <input className="input" placeholder="Email o nombre" value={form.usuario} onChange={(e) => cambiar("usuario", e.target.value)} />
          </FormField>
          <FormField etiqueta="Tipo de acción">
            <select className="select" value={form.tipo} onChange={(e) => cambiar("tipo", e.target.value)}>
              <option value="">Seleccionar</option>
              {TIPOS_ACCION.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </FormField>
          <FormField etiqueta="Contrato">
            <input className="input" placeholder="Buscar contrato" value={form.contrato} onChange={(e) => cambiar("contrato", e.target.value)} />
          </FormField>
          <div className="campo" style={{ paddingTop: 22 }}>
            <button className="btn btn-primario" onClick={buscar}>
              <Search size={14} /> Buscar
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-titulo">
          <div>
            <h2>Log de auditoría</h2>
            <p className="card-subtitulo">{resultado ? `${resultado.total} registros encontrados.` : "Cargando…"}</p>
          </div>
          <button className="btn" onClick={exportar}>
            <Download size={14} /> Exportar Registro
          </button>
        </div>

        {resultado && registros.length === 0 ? (
          <Alert tipo="info" texto={resultado.mensaje || "No se encontraron registros con los filtros aplicados."}>
            <button className="btn btn-chico" onClick={borrarFiltros}>Borrar filtros</button>
          </Alert>
        ) : (
          <div className="tabla-contenedor">
            <table className="tabla">
              <thead>
                <tr>
                  <th>Fecha y hora</th>
                  <th>Usuario</th>
                  <th>Tipo de acción</th>
                  <th>Entidad</th>
                  <th>Descripción</th>
                  <th>IP</th>
                  <th>Detalle</th>
                </tr>
              </thead>
              <tbody>
                {registros.map((r) => (
                  <Fragment key={r.idRegistro}>
                    <tr className="fila-clic" onClick={() => alternarDetalle(r.idRegistro)}>
                      <td className="texto-suave">{fechaHoraDeIso(r.fechaHora, true)}</td>
                      <td><strong>{r.usuario}</strong></td>
                      <td><Badge texto={r.tipoAccion} /></td>
                      <td className="texto-suave">{r.entidadAfectada}</td>
                      <td className="texto-suave">{r.descripcion}</td>
                      <td className="texto-suave">{r.direccionIp}</td>
                      <td>
                        <button className="btn btn-chico"><Eye size={12} /> Ver</button>
                      </td>
                    </tr>
                    {expandido === r.idRegistro && (
                      <tr>
                        <td colSpan={7} style={{ background: "#fafbfd" }}>
                          {!detalle ? (
                            <span className="texto-suave texto-chico">Cargando detalle…</span>
                          ) : (
                            <div className="texto-chico">
                              <div><strong>Antes:</strong> {detalle.datosAntes || "—"}</div>
                              <div><strong>Después:</strong> {detalle.datosDespues || "—"}</div>
                              <div><strong>Versión del contrato:</strong> {detalle.numeroVersion ? `v${detalle.numeroVersion}` : "—"}</div>
                              <div className="mono"><strong style={{ fontFamily: "inherit" }}>Hash:</strong> {detalle.hashVersion || "—"}</div>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {resultado && <Pagination pagina={pagina} totalPaginas={resultado.totalPaginas} onCambiar={setPagina} />}
      </div>

      {errorExportacion && (
        <Modal mensaje="El registro no pudo ser exportado en este momento.">
          <button className="btn" onClick={() => setErrorExportacion(false)}>Cancelar</button>
          <button className="btn btn-primario" onClick={exportar}>Reintentar</button>
        </Modal>
      )}
    </>
  );
}
