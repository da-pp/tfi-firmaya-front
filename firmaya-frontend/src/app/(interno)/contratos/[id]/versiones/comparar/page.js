"use client";

// CU-12 – Comparar versiones de contrato

import { Suspense, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { GitCompare } from "lucide-react";
import PageTitle from "@/components/PageTitle";
import ContractHeader from "@/components/ContractHeader";
import FormField from "@/components/FormField";
import Alert from "@/components/Alert";
import { getContrato } from "@/data/contracts";
import { compararTextos } from "@/lib/diff";
import { htmlATexto, hashCorto } from "@/lib/utils";

// useSearchParams necesita estar dentro de <Suspense>
export default function CompararPage() {
  return (
    <Suspense>
      <Comparar />
    </Suspense>
  );
}

function Comparar() {
  const { id } = useParams();
  const router = useRouter();
  const parametros = useSearchParams();
  const contrato = getContrato(id);
  const versiones = contrato.versiones;

  // Precargadas: A = la más antigua, B = la más reciente (o las que vienen en la URL desde el historial)
  const [numeroA, setNumeroA] = useState(Number(parametros.get("a")) || versiones[0].numero);
  const [numeroB, setNumeroB] = useState(Number(parametros.get("b")) || versiones[versiones.length - 1].numero);
  const [resultado, setResultado] = useState(null);
  const [cambioActual, setCambioActual] = useState(0);

  const iguales = numeroA === numeroB;
  const versionA = versiones.find((v) => v.numero === numeroA);
  const versionB = versiones.find((v) => v.numero === numeroB);

  function comparar() {
    setResultado(compararTextos(htmlATexto(versionA.contenido), htmlATexto(versionB.contenido)));
    setCambioActual(0);
  }

  // Pasos 13-14: navegar entre cambios y desplazar la vista
  function irACambio(indice) {
    setCambioActual(indice);
    const elemento = document.getElementById(`cambio-a-${indice}`) || document.getElementById(`cambio-b-${indice}`);
    if (elemento) elemento.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  // Columna A: texto igual + eliminado. Columna B: texto igual + agregado.
  function columna(lado) {
    return resultado.partes.map((parte, i) => {
      if (parte.tipo === "igual") return <span key={i}>{parte.texto}</span>;
      if (lado === "a" && parte.tipo === "agregado") return null;
      if (lado === "b" && parte.tipo === "eliminado") return null;
      const clase = parte.tipo === "eliminado" ? "diff-eliminado" : "diff-agregado";
      const esActual = parte.cambio === cambioActual;
      return (
        <span key={i} id={`cambio-${lado}-${parte.cambio}`} className={esActual ? `${clase} diff-actual` : clase}>
          {parte.texto}
        </span>
      );
    });
  }

  function encabezado(letra, version) {
    return (
      <div className="mb-16">
        <h2>Versión {letra} - v{version.numero}</h2>
        <div className="texto-suave texto-chico">{version.autor} · {version.fecha}</div>
        <div className="mono texto-tenue" title={version.hash}>{hashCorto(version.hash, 32)}</div>
      </div>
    );
  }

  return (
    <>
      <PageTitle icono={GitCompare} titulo="Comparar versiones del contrato" />
      <ContractHeader contrato={contrato} />

      {versiones.length < 2 ? (
        <div className="card">
          <Alert tipo="info" texto="Este contrato aún no tiene versiones anteriores." />
        </div>
      ) : (
        <div className="card">
          <div className="grilla" style={{ gridTemplateColumns: "1fr 1fr auto", alignItems: "end" }}>
            <FormField etiqueta="Versión base (Versión A)" obligatorio>
              <select className="select" value={numeroA} onChange={(e) => { setNumeroA(Number(e.target.value)); setResultado(null); }}>
                {versiones.map((v) => <option key={v.numero} value={v.numero}>v{v.numero}</option>)}
              </select>
            </FormField>
            <FormField etiqueta="Versión a comparar (Versión B)" obligatorio>
              <select className="select" value={numeroB} onChange={(e) => { setNumeroB(Number(e.target.value)); setResultado(null); }}>
                {versiones.map((v) => <option key={v.numero} value={v.numero}>v{v.numero}</option>)}
              </select>
            </FormField>
            <div className="campo">
              <button className="btn btn-primario" onClick={comparar} disabled={iguales}>
                <GitCompare size={14} /> Comparar
              </button>
            </div>
          </div>
          {iguales && <Alert tipo="aviso" texto="Seleccione dos versiones diferentes para realizar la comparación." />}
        </div>
      )}

      {resultado && (
        <>
          {resultado.cantidadCambios === 0 && (
            <div className="mt-16">
              <Alert tipo="info" texto="Las versiones seleccionadas no presentan diferencias en el contenido." />
            </div>
          )}

          <div className="grilla grilla-2 mt-16">
            <div className="card">
              {encabezado("A", versionA)}
              <div className="caja-gris contenido-contrato" style={{ whiteSpace: "pre-wrap" }}>{columna("a")}</div>
            </div>
            <div className="card">
              {encabezado("B", versionB)}
              <div className="caja-gris contenido-contrato" style={{ whiteSpace: "pre-wrap" }}>{columna("b")}</div>
            </div>
          </div>

          <div className="separado mt-16">
            <span className="badge badge-azul">
              {resultado.cantidadCambios} cambios detectados entre las versiones seleccionadas.
            </span>
            <div className="botonera">
              <button className="btn" onClick={() => router.push(`/contratos/${id}/versiones`)}>Volver al historial</button>
              <button className="btn" disabled={cambioActual <= 0} onClick={() => irACambio(cambioActual - 1)}>Cambio anterior</button>
              <button className="btn btn-primario" disabled={cambioActual >= resultado.cantidadCambios - 1} onClick={() => irACambio(cambioActual + 1)}>
                Siguiente cambio
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
