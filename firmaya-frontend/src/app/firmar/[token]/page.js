"use client";

// CU-08 – Firmar contrato vía OTP
// Tokens de prueba: firma-juan, firma-carlos (contrato "Boleto de compraventa - Palermo").
// Código OTP correcto: 123456 · Código expirado: 000000 · Cualquier otro: incorrecto.

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { KeyRound, PenLine, Download } from "lucide-react";
import PageTitle from "@/components/PageTitle";
import PdfDownload from "@/components/PdfDownload";
import FormField from "@/components/FormField";
import Alert from "@/components/Alert";
import Badge from "@/components/Badge";
import { buscarPorTokenFirma, versionActual, firmantes } from "@/data/contracts";
import { registrarAuditoria } from "@/data/audit";
import { formatearFechaHora, hashSimulado } from "@/lib/utils";

const OTP_CORRECTO = "123456";
const OTP_EXPIRADO = "000000";
const VIGENCIA_OTP_MS = 10 * 60 * 1000; // 10 minutos
const MAX_INTENTOS = 3;

function BarraExterna({ children }) {
  return (
    <>
      <header style={{ background: "#fff", borderBottom: "1px solid var(--borde)" }}>
        <div className="pagina" style={{ paddingTop: 14, paddingBottom: 14, fontWeight: 700 }}>FirmaYA</div>
      </header>
      <main className="pagina">{children}</main>
    </>
  );
}

export default function FirmarPage() {
  const { token } = useParams();
  const encontrado = buscarPorTokenFirma(token);

  const [paso, setPaso] = useState(1); // 1 = lectura, 2 = verificación OTP
  const [leido, setLeido] = useState(false);
  const [codigo, setCodigo] = useState("");
  const [enviadoEn, setEnviadoEn] = useState(null);
  const [intentosFallidos, setIntentosFallidos] = useState(0);
  const [error, setError] = useState("");
  const [expirado, setExpirado] = useState(false);
  const [verPdf, setVerPdf] = useState(false);
  const [, setActualizar] = useState(0);
  const contenidoRef = useRef(null);

  // Si el contrato es corto y no hay scroll, se considera leído
  useEffect(() => {
    const caja = contenidoRef.current;
    if (caja && caja.scrollHeight <= caja.clientHeight) setLeido(true);
  }, [paso]);

  // Token inválido, expirado, o contrato que no está "Listo para firmar" (paso 2)
  const valido = encontrado && (encontrado.contrato.estado === "Listo para firmar" || encontrado.parte.estadoFirma === "Firmado");
  if (!valido) {
    return (
      <BarraExterna>
        <Alert tipo="error" texto="El enlace de firma no es válido o ha expirado. Solicite un nuevo enlace al dueño del contrato." />
      </BarraExterna>
    );
  }

  const { contrato, parte } = encontrado;
  const version = versionActual(contrato);

  // Enlace bloqueado tras 3 intentos fallidos
  if (parte.bloqueado) {
    return (
      <BarraExterna>
        <Alert tipo="error" texto="El enlace de firma ha sido bloqueado por seguridad. Contacte al dueño del contrato." />
      </BarraExterna>
    );
  }

  // Paso 8: el botón se habilita al llegar al final del documento
  function alDesplazar(evento) {
    const caja = evento.target;
    if (caja.scrollTop + caja.clientHeight >= caja.scrollHeight - 4) setLeido(true);
  }

  // Paso 10: se envía un OTP de 6 dígitos al correo del firmante
  function enviarCodigo() {
    setEnviadoEn(Date.now());
    setCodigo("");
    setError("");
    setExpirado(false);
    setPaso(2);
  }

  // Pasos 14-21
  function verificar() {
    if (!/^\d{6}$/.test(codigo)) {
      setError("El código debe tener exactamente 6 dígitos numéricos.");
      return;
    }
    if (codigo === OTP_EXPIRADO || Date.now() - enviadoEn > VIGENCIA_OTP_MS) {
      setError("");
      setExpirado(true);
      return;
    }
    if (codigo !== OTP_CORRECTO) {
      const fallidos = intentosFallidos + 1;
      setIntentosFallidos(fallidos);
      if (fallidos >= MAX_INTENTOS) {
        parte.bloqueado = true;
        setActualizar((n) => n + 1);
        return;
      }
      setError(`El código ingresado es incorrecto. Verifique el código e intente nuevamente. Intentos restantes: ${MAX_INTENTOS - fallidos}.`);
      return;
    }

    // Firma registrada
    parte.estadoFirma = "Firmado";
    parte.fechaEvento = formatearFechaHora(new Date());
    parte.ip = "181.44.10.25";
    parte.hashFirma = hashSimulado(token + Date.now());
    registrarAuditoria({
      usuario: parte.email,
      tipo: "Firma",
      entidad: "Contrato",
      descripcion: `Firma registrada en ${contrato.nombre}`,
      contrato: contrato.nombre,
      version: `v${version.numero}`,
      hash: version.hash,
      ip: parte.ip,
    });
    // Si todos firmaron, el contrato pasa a "Firmado"
    if (firmantes(contrato).every((f) => f.estadoFirma === "Firmado")) {
      contrato.estado = "Firmado";
    }
    setActualizar((n) => n + 1);
  }

  // ---------- Firma completada ----------
  if (parte.estadoFirma === "Firmado") {
    return (
      <BarraExterna>
        <PageTitle icono={KeyRound} titulo="Firmar contrato mediante OTP" />
        <Alert tipo="exito" texto="Su firma ha sido registrada exitosamente. Puede descargar el contrato firmado." />
        <button className="btn btn-primario mb-16" onClick={() => setVerPdf(true)}>
          <Download size={14} /> Descargar PDF
        </button>
        {verPdf && <PdfDownload contrato={contrato} usuario={parte.email} />}
      </BarraExterna>
    );
  }

  return (
    <BarraExterna>
      <PageTitle icono={KeyRound} titulo="Firmar contrato mediante OTP" />

      <div className="card separado">
        <div>
          <Badge texto="Firma segura OTP" color="azul" />
          <h2 className="mt-8" style={{ fontSize: 18 }}>{contrato.nombre}</h2>
          <p className="texto-suave texto-chico">Versión v{version.numero} · Hash visible antes de confirmar la firma.</p>
        </div>
        <Badge texto={`Paso ${paso} de 2`} color="amarillo" />
      </div>

      {paso === 1 && (
        <div className="card">
          <div className="caja-gris">
            <h3>Lectura del contrato</h3>
            <p className="texto-suave texto-chico mt-8">
              El firmante debe leer el contenido completo del contrato antes de avanzar al paso de verificación.
            </p>
            <p className="mono texto-suave mt-8 mb-16">Hash: {version.hash}</p>
            <div
              ref={contenidoRef}
              onScroll={alDesplazar}
              className="contenido-contrato"
              style={{ maxHeight: 320, overflowY: "auto", background: "#fff", border: "1px solid var(--borde)", borderRadius: 10, padding: 16 }}
              dangerouslySetInnerHTML={{ __html: version.contenido }}
            />
          </div>
          <div className="botonera botonera-derecha mt-16">
            <button className="btn btn-primario" disabled={!leido} onClick={enviarCodigo}>
              <PenLine size={14} /> Leer y firmar el contrato
            </button>
          </div>
        </div>
      )}

      {paso === 2 && (
        <div className="card">
          <Alert tipo="info" texto={`Ingrese el código de 6 dígitos enviado a ${parte.email}. El código expira en 10 minutos`} />

          {expirado ? (
            <Alert tipo="aviso" texto="El código ha expirado. ¿Desea recibir un nuevo código?">
              <button className="btn btn-primario btn-chico" onClick={enviarCodigo}>Reenviar código</button>
            </Alert>
          ) : (
            <>
              <FormField etiqueta="Código OTP" obligatorio error={error}>
                <input
                  className={error ? "input con-error" : "input"}
                  style={{ maxWidth: 220, letterSpacing: 6, fontSize: 18 }}
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  value={codigo}
                  onChange={(e) => {
                    setCodigo(e.target.value);
                    setError("");
                  }}
                />
              </FormField>
              <button className="btn btn-primario" onClick={verificar}>
                <PenLine size={14} /> Firmar contrato
              </button>
            </>
          )}
        </div>
      )}
    </BarraExterna>
  );
}
