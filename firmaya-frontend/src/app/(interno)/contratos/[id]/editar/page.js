"use client";

// CU-02 – Editar contrato en línea

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Pencil, Save } from "lucide-react";
import PageTitle from "@/components/PageTitle";
import ContractHeader from "@/components/ContractHeader";
import RichEditor from "@/components/RichEditor";
import Alert from "@/components/Alert";
import Badge from "@/components/Badge";
import Modal from "@/components/Modal";
import { getContrato, versionActual, esEditable, agregarVersion } from "@/data/contracts";
import { registrarAuditoria } from "@/data/audit";
import { useUsuario, tomarFlash } from "@/data/session";
import { nombreCompleto } from "@/data/users";

export default function EditarContratoPage() {
  const { id } = useParams();
  const router = useRouter();
  const { usuario } = useUsuario();
  const contrato = getContrato(id);

  const [html, setHtml] = useState(versionActual(contrato).contenido);
  const [texto, setTexto] = useState("");
  const [hayCambios, setHayCambios] = useState(false);
  const [comentario, setComentario] = useState("");
  const [errorContenido, setErrorContenido] = useState("");
  const [mensaje, setMensaje] = useState(null);
  const [modoLectura, setModoLectura] = useState(false);
  // Destino al que el usuario quiso ir con cambios sin guardar
  const [destino, setDestino] = useState(null);

  // Mensaje que viene de CU-01 ("Contrato creado exitosamente")
  useEffect(() => {
    const flash = tomarFlash();
    if (flash) setMensaje(flash);
  }, []);

  // Camino alternativo: el usuario intenta salir sin guardar.
  // Interceptamos los clics en enlaces y el cierre/recarga de la pestaña.
  useEffect(() => {
    if (!hayCambios) return;

    function alHacerClic(evento) {
      const enlace = evento.target.closest("a");
      if (!enlace || !enlace.getAttribute("href")) return;
      evento.preventDefault();
      evento.stopPropagation();
      setDestino(enlace.getAttribute("href"));
    }
    function antesDeSalir(evento) {
      evento.preventDefault();
    }

    document.addEventListener("click", alHacerClic, true);
    window.addEventListener("beforeunload", antesDeSalir);
    return () => {
      document.removeEventListener("click", alHacerClic, true);
      window.removeEventListener("beforeunload", antesDeSalir);
    };
  }, [hayCambios]);

  // Pasos 13-20: guardar una nueva versión. Devuelve true si se guardó.
  function guardarVersion() {
    // El texto se toma del editor; si todavía no se tocó, del HTML actual
    const textoActual = hayCambios ? texto : html.replace(/<[^>]+>/g, "").trim();
    if (textoActual.length < 100) {
      setErrorContenido("El contenido del contrato debe tener al menos 100 caracteres");
      return false;
    }
    const nueva = agregarVersion(contrato, html, comentario.trim(), nombreCompleto(usuario));
    registrarAuditoria({
      usuario: usuario.email,
      tipo: "Edición",
      entidad: "Contrato",
      descripcion: `Nueva versión v${nueva.numero} de ${contrato.nombre}`,
      contrato: contrato.nombre,
      version: `v${nueva.numero}`,
      hash: nueva.hash,
    });
    setHayCambios(false);
    setComentario("");
    setErrorContenido("");
    setMensaje({ tipo: "exito", texto: `Versión guardada exitosamente. Versión: v${nueva.numero} · Hash: ${nueva.hash}` });
    return true;
  }

  // Botones del diálogo "¿Desea guardar los cambios antes de salir?"
  function dialogoGuardar() {
    const ir = destino;
    setDestino(null);
    if (guardarVersion()) router.push(ir);
  }

  function dialogoDescartar() {
    const ir = destino;
    setHayCambios(false);
    setDestino(null);
    router.push(ir);
  }

  // ---------- Contrato no editable (Firmado / Archivado) ----------
  if (!esEditable(contrato) && !modoLectura) {
    return (
      <>
        <PageTitle icono={Pencil} titulo="Editar contrato en línea" />
        <ContractHeader contrato={contrato} />
        <div className="card">
          <Alert tipo="aviso" texto="Este contrato no puede ser editado en su estado actual.">
            <button className="btn btn-primario btn-chico" onClick={() => setModoLectura(true)}>Ver Contrato</button>
          </Alert>
        </div>
      </>
    );
  }

  // ---------- Modo solo lectura ----------
  if (modoLectura) {
    return (
      <>
        <PageTitle icono={Pencil} titulo="Ver contrato" />
        <ContractHeader contrato={contrato} />
        <div className="card">
          <p className="texto-suave texto-chico mb-8">Solo lectura</p>
          <div className="caja-gris contenido-contrato" dangerouslySetInnerHTML={{ __html: versionActual(contrato).contenido }} />
        </div>
      </>
    );
  }

  // ---------- Editor ----------
  return (
    <>
      <PageTitle icono={Pencil} titulo="Editar contrato en línea" />

      {mensaje && <Alert tipo={mensaje.tipo} texto={mensaje.texto} />}

      <ContractHeader contrato={contrato} />

      <div className="grilla grilla-2-1">
        <div className="card">
          {errorContenido && <div className="helper-error mb-8">{errorContenido}</div>}
          <RichEditor
            valorInicial={html}
            conError={!!errorContenido}
            onCambio={(nuevoHtml, nuevoTexto) => {
              setHtml(nuevoHtml);
              setTexto(nuevoTexto);
              setHayCambios(true);
              setMensaje(null);
            }}
            derecha={hayCambios && <Badge texto="Cambios sin guardar" color="amarillo" />}
          />
        </div>

        <div className="card">
          <h2 className="mb-16">Guardar nueva versión</h2>
          <div className="campo">
            <label>Comentario de versión</label>
            <textarea
              className="textarea"
              placeholder="Ej: Se ajustó la cláusula de vencimiento y se agregó descripción del inmueble."
              maxLength={500}
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
            />
          </div>

          <div className="caja-gris mb-16">
            <strong className="texto-chico">Validaciones</strong>
            <ul className="texto-chico texto-suave" style={{ marginLeft: 16, marginTop: 6 }}>
              <li>El cuerpo del contrato no puede estar vacío.</li>
              <li>Debe superar los 100 caracteres.</li>
              <li>Se generará un nuevo hash SHA-256.</li>
            </ul>
          </div>

          <button className="btn btn-primario btn-bloque mb-8" onClick={guardarVersion}>
            <Save size={14} /> Guardar Versión
          </button>
          <button
            className="btn btn-bloque"
            onClick={() => (hayCambios ? setDestino("/panel") : router.push("/panel"))}
          >
            Salir sin guardar
          </button>
        </div>
      </div>

      {destino && (
        <Modal mensaje="¿Desea guardar los cambios antes de salir?">
          <button className="btn" onClick={() => setDestino(null)}>Cancelar</button>
          <button className="btn" onClick={dialogoDescartar}>Descartar</button>
          <button className="btn btn-primario" onClick={dialogoGuardar}>Guardar</button>
        </Modal>
      )}
    </>
  );
}
