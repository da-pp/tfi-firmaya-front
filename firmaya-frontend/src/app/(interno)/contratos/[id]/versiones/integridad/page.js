"use client";

// CU-13 – Verificar integridad por hash

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ShieldCheck, CircleCheck, CircleX, History } from "lucide-react";
import PageTitle from "@/components/PageTitle";
import ContractHeader from "@/components/ContractHeader";
import FormField from "@/components/FormField";
import { getContrato, versionActual } from "@/data/contracts";
import { registrarAuditoria } from "@/data/audit";
import { useUsuario } from "@/data/session";
import { hashValido } from "@/lib/utils";

export default function IntegridadPage() {
  const { id } = useParams();
  const router = useRouter();
  const { usuario } = useUsuario();
  const contrato = getContrato(id);
  const almacenado = versionActual(contrato).hash;

  const [hash, setHash] = useState("");
  const [resultado, setResultado] = useState(null); // { coincide, ingresado }

  // Paso 7: validación en tiempo real
  const formatoInvalido = hash.trim() !== "" && !hashValido(hash);
  const puedeVerificar = hash.trim() !== "" && !formatoInvalido;

  // Pasos 9-12 y 16
  function verificar() {
    const ingresado = hash.trim().toLowerCase();
    const coincide = ingresado === almacenado;
    setResultado({ coincide, ingresado });
    registrarAuditoria({
      usuario: usuario.email,
      tipo: "Verificación",
      entidad: "Contrato",
      descripcion: `Verificación de integridad de ${contrato.nombre}: ${coincide ? "coincide" : "no coincide"}`,
      contrato: contrato.nombre,
      version: `v${versionActual(contrato).numero}`,
      hash: almacenado,
    });
  }

  return (
    <>
      <PageTitle icono={ShieldCheck} titulo="Verificar integridad por hash" />
      <ContractHeader contrato={contrato} />

      <div className="grilla grilla-2">
        <div className="card">
          <h2>Verificación de integridad</h2>
          <p className="card-subtitulo mb-16">Ingrese el hash que aparece en su copia del contrato o en la notificación que recibió.</p>

          <div className="campo">
            <label>Hash actual de la versión activa</label>
            <div className="caja-gris mono" style={{ padding: 10 }}>{almacenado}</div>
          </div>

          <FormField
            etiqueta="Hash a verificar"
            obligatorio
            error={formatoInvalido ? "El hash debe tener exactamente 64 caracteres hexadecimales (0-9, a-f)." : ""}
          >
            <textarea
              className={formatoInvalido ? "textarea mono con-error" : "textarea mono"}
              style={{ minHeight: 64 }}
              placeholder="64 caracteres hexadecimales"
              value={hash}
              onChange={(e) => {
                setHash(e.target.value);
                setResultado(null);
              }}
            />
          </FormField>

          <button className="btn btn-primario" onClick={verificar} disabled={!puedeVerificar}>
            <ShieldCheck size={14} /> Verificar
          </button>
        </div>

        <div className="card">
          <h2 className="mb-16">Resultado</h2>

          {resultado && (
            <>
              <div className={resultado.coincide ? "alerta alerta-exito" : "alerta alerta-error"} style={{ display: "block" }}>
                <div className="fila" style={{ fontWeight: 700 }}>
                  {resultado.coincide ? <CircleCheck size={16} /> : <CircleX size={16} />}
                  {resultado.coincide ? "Integridad verificada" : "Los hashes no coinciden"}
                </div>
                <div className="mt-8">
                  {resultado.coincide
                    ? "Integridad verificada. El documento no ha sido alterado."
                    : "Los hashes no coinciden. El documento puede haber sido modificado o está examinando una versión diferente."}
                </div>
              </div>

              <div className="caja-gris mb-16" style={{ padding: 12 }}>
                <div className="texto-chico texto-suave">Hash ingresado</div>
                <div className="mono mb-8">{resultado.ingresado}</div>
                <div className="texto-chico texto-suave">Hash almacenado</div>
                <div className="mono">{almacenado}</div>
              </div>
            </>
          )}

          <button className="btn btn-bloque" onClick={() => router.push(`/contratos/${id}/versiones`)}>
            <History size={14} /> Ver historial de versiones
          </button>
        </div>
      </div>
    </>
  );
}
