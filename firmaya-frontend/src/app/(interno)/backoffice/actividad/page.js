"use client";

// CU-17 – Ver Panel de Actividad Global

import { useState } from "react";
import { LayoutGrid, Filter, Download } from "lucide-react";
import PageTitle from "@/components/PageTitle";
import FormField from "@/components/FormField";
import Alert from "@/components/Alert";
import Badge from "@/components/Badge";
import Pagination from "@/components/Pagination";
import { contratosReporte } from "@/data/activity";
import { ESTADOS_CONTRATO } from "@/data/contracts";
import { leerFecha, formatearFecha, hoy, sumarDias, generarCsv, descargarArchivo } from "@/lib/utils";

const POR_PAGINA = 20;

// Cada métrica: título y cómo filtrar los contratos que la componen
const METRICAS = [
  { clave: "activos", titulo: "Contratos activos", filtro: (c) => c.estado !== "Archivado" },
  { clave: "pendientes", titulo: "Pendientes de firma", filtro: (c) => c.estado === "Listo para firmar" },
  { clave: "firmados", titulo: "Firmados", filtro: (c) => c.estado === "Firmado" },
  {
    clave: "vencer",
    titulo: "Próximos a vencer",
    filtro: (c) => c.vence >= hoy() && c.vence <= sumarDias(hoy(), 7) && c.estado !== "Archivado",
  },
];

export default function ActividadPage() {
  // Período predeterminado: últimos 30 días
  const [desde, setDesde] = useState(formatearFecha(sumarDias(hoy(), -30)));
  const [hasta, setHasta] = useState(formatearFecha(hoy()));
  const [estados, setEstados] = useState([]);
  const [errores, setErrores] = useState({});
  // Filtros aplicados (solo cambian al presionar "Aplicar" con datos válidos)
  const [aplicado, setAplicado] = useState({ desde: sumarDias(hoy(), -30), hasta: hoy(), estados: [] });
  const [metrica, setMetrica] = useState(null);
  const [pagina, setPagina] = useState(1);

  function cambiarEstado(estado) {
    setEstados(estados.includes(estado) ? estados.filter((e) => e !== estado) : [...estados, estado]);
  }

  // Pasos 14-17
  function aplicar() {
    const nuevos = {};
    const fechaDesde = leerFecha(desde);
    const fechaHasta = leerFecha(hasta);
    if (desde.trim() === "") nuevos.desde = "Este campo es obligatorio";
    else if (!fechaDesde) nuevos.desde = "La fecha debe tener el formato DD/MM/AAAA";
    if (hasta.trim() === "") nuevos.hasta = "Este campo es obligatorio";
    else if (!fechaHasta) nuevos.hasta = "La fecha debe tener el formato DD/MM/AAAA";
    if (fechaDesde && fechaHasta && fechaDesde >= fechaHasta) {
      nuevos.hasta = "La fecha de inicio debe ser anterior a la fecha de fin.";
    }
    setErrores(nuevos);
    if (Object.keys(nuevos).length > 0) return;

    setAplicado({ desde: fechaDesde, hasta: fechaHasta, estados });
    setPagina(1);
  }

  // Contratos del período y estados aplicados
  const finDelDia = sumarDias(aplicado.hasta, 1);
  const filtrados = contratosReporte.filter(
    (c) =>
      c.modificacion >= aplicado.desde &&
      c.modificacion < finDelDia &&
      (aplicado.estados.length === 0 || aplicado.estados.includes(c.estado))
  );
  const sinDatos = filtrados.length === 0;

  // Gráfico: cantidad por estado
  const porEstado = ESTADOS_CONTRATO.map((estado) => ({
    estado,
    cantidad: filtrados.filter((c) => c.estado === estado).length,
  }));
  const maximo = Math.max(1, ...porEstado.map((e) => e.cantidad));

  // 10 contratos más recientemente activos
  const recientes = [...filtrados].sort((a, b) => b.modificacion - a.modificacion).slice(0, 10);

  // Detalle de la métrica elegida (pasos 18-21)
  const metricaElegida = METRICAS.find((m) => m.clave === metrica);
  const detalle = metricaElegida ? filtrados.filter(metricaElegida.filtro) : [];
  const totalPaginas = Math.ceil(detalle.length / POR_PAGINA);
  const detallePagina = detalle.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  // Pasos 22-24: exportar CSV
  function exportar() {
    const columnas = [
      { titulo: "Nombre", campo: "nombre" },
      { titulo: "Estado", campo: "estado" },
      { titulo: "Responsable", campo: "responsable" },
      { titulo: "Última modificación", campo: "ultimaModificacion" },
    ];
    descargarArchivo(`actividad_${metricaElegida.clave}.csv`, generarCsv(columnas, detalle), "text/csv;charset=utf-8");
  }

  return (
    <>
      <PageTitle icono={LayoutGrid} titulo="Ver panel de actividad global" />

      <div className="card">
        <div className="grilla" style={{ gridTemplateColumns: "1fr 1fr 2fr auto", alignItems: "start" }}>
          <FormField etiqueta="Fecha de inicio" error={errores.desde}>
            <input className={errores.desde ? "input con-error" : "input"} placeholder="DD/MM/AAAA" value={desde} onChange={(e) => setDesde(e.target.value)} />
          </FormField>
          <FormField etiqueta="Fecha de fin" error={errores.hasta}>
            <input className={errores.hasta ? "input con-error" : "input"} placeholder="DD/MM/AAAA" value={hasta} onChange={(e) => setHasta(e.target.value)} />
          </FormField>
          <div className="campo">
            <span className="etiqueta">Estado</span>
            <div className="opciones-radio" style={{ gap: 10 }}>
              {ESTADOS_CONTRATO.map((e) => (
                <label key={e} className="texto-chico">
                  <input type="checkbox" checked={estados.includes(e)} onChange={() => cambiarEstado(e)} /> {e}
                </label>
              ))}
            </div>
          </div>
          <div className="campo" style={{ paddingTop: 22 }}>
            <button className="btn btn-primario" onClick={aplicar}>
              <Filter size={14} /> Aplicar
            </button>
          </div>
        </div>
      </div>

      {sinDatos && (
        <div className="mt-16">
          <Alert tipo="info" texto="No se registró actividad en el período seleccionado." />
        </div>
      )}

      {/* Métricas principales (pasos 3-7). Clic para ver el detalle. */}
      <div className="grilla grilla-4 mt-16">
        {METRICAS.map((m) => (
          <button
            key={m.clave}
            className="card"
            style={{ textAlign: "left", cursor: "pointer", font: "inherit", outline: metrica === m.clave ? "2px solid var(--primario)" : "none" }}
            onClick={() => { setMetrica(m.clave); setPagina(1); }}
          >
            <div className="texto-suave texto-chico">{m.titulo}</div>
            <div style={{ fontSize: 26, fontWeight: 700 }}>{filtrados.filter(m.filtro).length}</div>
          </button>
        ))}
      </div>

      <div className="grilla grilla-1-2 mt-16">
        <div className="card">
          <h2 className="mb-16">Contratos por estado</h2>
          {porEstado.map((e) => (
            <div key={e.estado} className="mb-8">
              <div className="separado texto-chico">
                <span>{e.estado}</span>
                <span>{e.cantidad}</span>
              </div>
              <div className="barra">
                <div className="barra-relleno" style={{ width: `${(e.cantidad / maximo) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <h2 className="mb-16">Actividad reciente</h2>
          {recientes.map((c) => (
            <div key={c.id} className="caja-gris separado mb-8" style={{ background: "#fff", padding: 12 }}>
              <div>
                <strong className="texto-chico">{c.nombre}</strong>
                <div className="texto-tenue" style={{ fontSize: 11 }}>Responsable: {c.responsable} · {c.ultimaModificacion}</div>
              </div>
              <Badge texto={c.estado} />
            </div>
          ))}
        </div>
      </div>

      {metricaElegida && (
        <div className="card mt-16">
          <div className="card-titulo">
            <h2>{metricaElegida.titulo} ({detalle.length})</h2>
            <button className="btn" onClick={exportar}>
              <Download size={14} /> Exportar Lista
            </button>
          </div>
          <div className="tabla-contenedor">
            <table className="tabla">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Estado</th>
                  <th>Responsable</th>
                  <th>Última modificación</th>
                </tr>
              </thead>
              <tbody>
                {detallePagina.map((c) => (
                  <tr key={c.id}>
                    <td>{c.nombre}</td>
                    <td><Badge texto={c.estado} /></td>
                    <td className="texto-suave">{c.responsable}</td>
                    <td className="texto-suave">{c.ultimaModificacion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination pagina={pagina} totalPaginas={totalPaginas} onCambiar={setPagina} />
        </div>
      )}
    </>
  );
}
