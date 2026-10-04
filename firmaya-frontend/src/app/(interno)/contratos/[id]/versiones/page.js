"use client";

// CU-11 – Ver historial de versiones
// CU-14 – Restaurar una versión anterior

import { Fragment, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { History, Copy, Eye, GitCompare, RefreshCw } from "lucide-react";
import PageTitle from "@/components/PageTitle";
import ContractHeader from "@/components/ContractHeader";
import HashText from "@/components/HashText";
import Alert from "@/components/Alert";
import Badge from "@/components/Badge";
import Modal from "@/components/Modal";
import FormField from "@/components/FormField";
import { getContrato, versionActual, agregarVersion } from "@/data/contracts";
import { registrarAuditoria } from "@/data/audit";
import { useUsuario } from "@/data/session";
import { nombreCompleto } from "@/data/users";
import { copiarAlPortapapeles } from "@/lib/utils";

export default function HistorialPage() {
  const { id } = useParams();
  const router = useRouter();
  const { usuario } = useUsuario();
  const contrato = getContrato(id);

  const [expandida, setExpandida] = useState(null); // número de versión expandida
  const [viendo, setViendo] = useState(null); // versión que se está viendo en solo lectura
  const [aRestaurar, setARestaurar] = useState(null); // versión elegida para restaurar
  const [razon, setRazon] = useState("");
  const [confirmando, setConfirmando] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  if (!usuario) return null;

  const actual = versionActual(contrato);
  // Más reciente primero
  const versiones = [...contrato.versiones].reverse();
  const unaSolaVersion = versiones.length === 1;

  const estadoNoEditable = contrato.estado === "Firmado" || contrato.estado === "Archivado";
  const tienePermisoEdicion = usuario.rol === "Abogado" || usuario.rol === "Agente Inmobiliario";
  const puedeRestaurar = tienePermisoEdicion && !estadoNoEditable;

  function copiarHashActual() {
    copiarAlPortapapeles(actual.hash);
    setMensaje({ tipo: "exito", texto: "Hash copiado al portapapeles." });
  }

  function comparar(numero) {
    router.push(`/contratos/${id}/versiones/comparar?a=${numero}&b=${actual.numero}`);
  }

  function abrirRestauracion(version) {
    setViendo(null);
    setARestaurar(version);
    setRazon("");
    setMensaje(null);
  }

  // CU-14 pasos 14-19
  function restaurar() {
    setConfirmando(false);
    const nueva = agregarVersion(contrato, aRestaurar.contenido, `Restauración de la versión ${aRestaurar.numero}`, nombreCompleto(usuario));
    nueva.razonRestauracion = razon.trim();
    registrarAuditoria({
      usuario: usuario.email,
      tipo: "Edición",
      entidad: "Contrato",
      descripcion: `Restauración de la versión ${aRestaurar.numero} como v${nueva.numero} en ${contrato.nombre}`,
      contrato: contrato.nombre,
      version: `v${nueva.numero}`,
      hash: nueva.hash,
    });
    setMensaje({ tipo: "exito", texto: `La versión ${aRestaurar.numero} fue restaurada exitosamente como la nueva versión ${nueva.numero}.` });
    setARestaurar(null);
  }

  // ---------- Ver una versión en solo lectura (CU-11 pasos 14-19) ----------
  if (viendo) {
    return (
      <>
        <PageTitle icono={History} titulo="Ver historial de versiones" />
        <ContractHeader contrato={contrato} />
        <div className="card">
          <Alert tipo="info" texto={`Está viendo la versión ${viendo.numero}, solo lectura.`} />
          <div className="caja-gris contenido-contrato mb-16" dangerouslySetInnerHTML={{ __html: viendo.contenido }} />
          <div className="botonera">
            <button className="btn" onClick={() => setViendo(null)}>Volver al historial</button>
            {puedeRestaurar && viendo.numero !== actual.numero && (
              <button className="btn btn-primario" onClick={() => abrirRestauracion(viendo)}>
                <RefreshCw size={14} /> Restaurar esta versión
              </button>
            )}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageTitle icono={History} titulo="Ver historial de versiones" />
      {mensaje && <Alert tipo={mensaje.tipo} texto={mensaje.texto} />}
      <ContractHeader contrato={contrato} />

      {/* Panel de confirmación de restauración (CU-14 pasos 4-11) */}
      {aRestaurar && (
        <div className="card">
          <h2 className="mb-16">Restaurar una versión anterior</h2>
          <div className="grilla grilla-2" style={{ gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <div className="contrato-header-dato"><span>Versión a restaurar</span><strong>v{aRestaurar.numero}</strong></div>
            <div className="contrato-header-dato"><span>Fecha de la versión</span><strong>{aRestaurar.fecha}</strong></div>
            <div className="contrato-header-dato"><span>Autor de la versión</span><strong>{aRestaurar.autor}</strong></div>
          </div>
          <div className="mt-16">
            <Alert tipo="info" texto="Esta acción creará una nueva versión con el contenido de la versión seleccionada. El historial no se perderá." />
          </div>
          <FormField etiqueta="Razón de la restauración">
            <textarea className="textarea" maxLength={500} value={razon} onChange={(e) => setRazon(e.target.value)} />
          </FormField>
          <div className="botonera botonera-derecha">
            <button className="btn" onClick={() => setARestaurar(null)}>Cancelar</button>
            <button className="btn btn-primario" onClick={() => setConfirmando(true)}>Confirmar restauración</button>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-titulo">
          <h2>Historial de versiones</h2>
          <div className="botonera">
            <button className="btn btn-chico" onClick={() => router.push(`/contratos/${id}/versiones/comparar`)} disabled={unaSolaVersion}>
              <GitCompare size={12} /> Comparar versiones
            </button>
            <button className="btn btn-chico" onClick={copiarHashActual}>
              <Copy size={12} /> Copiar hash actual
            </button>
          </div>
        </div>

        {unaSolaVersion && <Alert tipo="info" texto="Este contrato aún no tiene versiones anteriores." />}
        {estadoNoEditable && tienePermisoEdicion && (
          <Alert tipo="aviso" texto="La restauración de versiones no está disponible en el estado actual del contrato." />
        )}

        <div className="tabla-contenedor">
          <table className="tabla">
            <thead>
              <tr>
                <th>Versión</th>
                <th>Autor</th>
                <th>Fecha</th>
                <th>Comentario</th>
                <th>Hash</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {versiones.map((v) => {
                const esActual = v.numero === actual.numero;
                const abierta = expandida === v.numero;
                return (
                  <Fragment key={v.numero}>
                    <tr className="fila-clic" onClick={() => setExpandida(abierta ? null : v.numero)}>
                      <td>
                        <span className="fila">
                          <strong>v{v.numero}</strong>
                          {esActual && <Badge texto="Actual" />}
                        </span>
                      </td>
                      <td className="texto-suave">{v.autor}</td>
                      <td className="texto-suave">{v.fecha}</td>
                      <td className="texto-suave" style={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {v.comentario}
                      </td>
                      <td><HashText hash={v.hash} /></td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div className="botonera" style={{ flexWrap: "nowrap" }}>
                          <button className="btn btn-chico" onClick={() => setViendo(v)}>
                            <Eye size={12} /> Ver
                          </button>
                          {!esActual && (
                            <button className="btn btn-chico" onClick={() => comparar(v.numero)}>
                              <GitCompare size={12} /> Comparar
                            </button>
                          )}
                          {!esActual && puedeRestaurar && (
                            <button className="btn btn-chico btn-primario" onClick={() => abrirRestauracion(v)}>
                              <RefreshCw size={12} /> Restaurar esta versión
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {abierta && (
                      <tr>
                        <td colSpan={6} style={{ background: "#fafbfd" }}>
                          <div className="texto-chico">
                            <strong>Comentario de la versión:</strong> {v.comentario || "—"}
                          </div>
                          {v.razonRestauracion && (
                            <div className="texto-chico texto-suave">Razón de la restauración: {v.razonRestauracion}</div>
                          )}
                          <div className="mono texto-suave mt-8">Hash SHA-256: {v.hash}</div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {confirmando && (
        <Modal mensaje={`¿Confirma la restauración de la versión ${aRestaurar.numero}?`}>
          <button className="btn" onClick={() => { setConfirmando(false); setARestaurar(null); }}>Cancelar</button>
          <button className="btn btn-primario" onClick={restaurar}>Confirmar</button>
        </Modal>
      )}
    </>
  );
}
