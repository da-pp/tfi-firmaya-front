"use client";

// CU-18 – Registro de acciones de auditoría

import { Fragment, useState } from "react";
import { Search, Download, Eye } from "lucide-react";
import PageTitle from "@/components/PageTitle";
import FormField from "@/components/FormField";
import Alert from "@/components/Alert";
import Badge from "@/components/Badge";
import Modal from "@/components/Modal";
import Pagination from "@/components/Pagination";
import { registrosAuditoria, TIPOS_ACCION, simularExportacion } from "@/data/audit";
import { leerFecha, leerFechaHora, sumarDias, generarCsv, descargarArchivo } from "@/lib/utils";

const POR_PAGINA = 50;
const SIN_FILTROS = { desde: "", hasta: "", usuario: "", tipo: "", contrato: "" };

export default function AuditoriaPage() {
  const [form, setForm] = useState(SIN_FILTROS);
  const [filtros, setFiltros] = useState(SIN_FILTROS); // filtros aplicados al presionar "Buscar"
  const [errores, setErrores] = useState({});
  const [pagina, setPagina] = useState(1);
  const [expandido, setExpandido] = useState(null);
  const [errorExportacion, setErrorExportacion] = useState(false);
  const [mensaje, setMensaje] = useState("");

  function buscar() {
    const nuevos = {};
    if (form.desde && !leerFecha(form.desde)) nuevos.desde = "La fecha debe tener el formato DD/MM/AAAA";
    if (form.hasta && !leerFecha(form.hasta)) nuevos.hasta = "La fecha debe tener el formato DD/MM/AAAA";
    setErrores(nuevos);
    if (Object.keys(nuevos).length > 0) return;
    setFiltros(form);
    setPagina(1);
    setMensaje("");
  }

  function borrarFiltros() {
    setForm(SIN_FILTROS);
    setFiltros(SIN_FILTROS);
    setPagina(1);
  }

  // Paso 15: filtros combinados
  const desde = filtros.desde ? leerFecha(filtros.desde) : null;
  const hasta = filtros.hasta ? sumarDias(leerFecha(filtros.hasta), 1) : null;
  const encontrados = registrosAuditoria.filter((r) => {
    const fecha = leerFechaHora(r.fecha);
    if (desde && fecha < desde) return false;
    if (hasta && fecha >= hasta) return false;
    if (filtros.usuario && !r.usuario.toLowerCase().includes(filtros.usuario.toLowerCase())) return false;
    if (filtros.tipo && r.tipo !== filtros.tipo) return false;
    if (filtros.contrato && !r.contrato.toLowerCase().includes(filtros.contrato.toLowerCase())) return false;
    return true;
  });

  const totalPaginas = Math.ceil(encontrados.length / POR_PAGINA);
  const registrosPagina = encontrados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  // Pasos 21-25
  function exportar() {
    setErrorExportacion(false);
    if (!simularExportacion()) {
      setErrorExportacion(true);
      return;
    }
    const columnas = [
      { titulo: "Fecha y hora", campo: "fecha" },
      { titulo: "Usuario", campo: "usuario" },
      { titulo: "Tipo de acción", campo: "tipo" },
      { titulo: "Entidad afectada", campo: "entidad" },
      { titulo: "Descripción", campo: "descripcion" },
      { titulo: "Dirección IP", campo: "ip" },
    ];
    descargarArchivo("registro_auditoria.csv", generarCsv(columnas, encontrados), "text/csv;charset=utf-8");
    setMensaje("Registro exportado exitosamente.");
  }

  function cambiar(campo, valor) {
    setForm({ ...form, [campo]: valor });
  }

  return (
    <>
      <PageTitle icono={Search} titulo="Auditar log de acciones" />
      {mensaje && <Alert tipo="exito" texto={mensaje} />}

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
            <p className="card-subtitulo">{encontrados.length} registros encontrados.</p>
          </div>
          <button className="btn" onClick={exportar}>
            <Download size={14} /> Exportar Registro
          </button>
        </div>

        {encontrados.length === 0 ? (
          <Alert tipo="info" texto="No se encontraron registros con los filtros aplicados.">
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
                {registrosPagina.map((r) => (
                  <Fragment key={r.id}>
                    <tr className="fila-clic" onClick={() => setExpandido(expandido === r.id ? null : r.id)}>
                      <td className="texto-suave">{r.fecha}</td>
                      <td><strong>{r.usuario}</strong></td>
                      <td><Badge texto={r.tipo} /></td>
                      <td className="texto-suave">{r.entidad}</td>
                      <td className="texto-suave">{r.descripcion}</td>
                      <td className="texto-suave">{r.ip}</td>
                      <td>
                        <button className="btn btn-chico"><Eye size={12} /> Ver</button>
                      </td>
                    </tr>
                    {expandido === r.id && (
                      <tr>
                        <td colSpan={7} style={{ background: "#fafbfd" }}>
                          <div className="texto-chico">
                            <div><strong>Antes:</strong> {r.antes || "—"}</div>
                            <div><strong>Después:</strong> {r.despues || "—"}</div>
                            <div><strong>Versión del contrato:</strong> {r.version || "—"}</div>
                            <div className="mono"><strong style={{ fontFamily: "inherit" }}>Hash:</strong> {r.hash || "—"}</div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination pagina={pagina} totalPaginas={totalPaginas} onCambiar={setPagina} />
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
