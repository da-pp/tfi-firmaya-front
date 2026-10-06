"use client";

// Contrato + panel lateral de comentarios (CU-06).
// Se usa en la pestaña Comentarios.

import { useState } from "react";
import { MessageSquare } from "lucide-react";
import Alert from "./Alert";
import { versionActual } from "@/data/contracts";
import { formatearFechaHora } from "@/lib/utils";

const MAXIMO = 1000;

// puedeComentar: false para el rol Solo lectura o contratos archivados
// mensajeSinPermiso: texto a mostrar cuando no puede comentar
export default function CommentsPanel({ contrato, autor, puedeComentar, mensajeSinPermiso, onPublicado }) {
  const [fragmento, setFragmento] = useState("");
  const [formularioVisible, setFormularioVisible] = useState(false);
  const [texto, setTexto] = useState("");
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  // Paso 3-4: el usuario selecciona un texto del contrato
  function alSeleccionar() {
    const seleccion = window.getSelection().toString().trim();
    if (seleccion && puedeComentar) setFragmento(seleccion);
  }

  function publicar() {
    if (texto.trim() === "") {
      setError("El comentario no puede estar vacío");
      return;
    }
    contrato.comentarios.push({
      autor,
      fecha: formatearFechaHora(new Date()),
      texto: texto.trim(),
      fragmento,
    });
    setTexto("");
    setFragmento("");
    setError("");
    setFormularioVisible(false);
    setExito("Comentario publicado con éxito");
    onPublicado();
  }

  const restantes = MAXIMO - texto.length;

  return (
    <div className="grilla grilla-2-1">
      <div className="card">
        <h2 className="mb-16">Contrato</h2>
        <div
          className="caja-gris contenido-contrato"
          style={{ minHeight: 300 }}
          onMouseUp={alSeleccionar}
          dangerouslySetInnerHTML={{ __html: versionActual(contrato).contenido }}
        />
        {fragmento && (
          <div className="alerta alerta-info mt-16">
            <span>Fragmento seleccionado: “{fragmento}”</span>
          </div>
        )}
      </div>

      <div className="card">
        <h2 className="mb-16">Comentarios</h2>

        {exito && <Alert tipo="exito" texto={exito} />}

        {!puedeComentar && mensajeSinPermiso && <Alert tipo="info" texto={mensajeSinPermiso} />}

        {puedeComentar && !formularioVisible && (
          <button className="btn btn-primario btn-bloque" onClick={() => { setFormularioVisible(true); setExito(""); }}>
            <MessageSquare size={14} /> Añadir comentario
          </button>
        )}

        {puedeComentar && formularioVisible && (
          <div>
            {fragmento && (
              <div className="campo">
                <label>Texto seleccionado</label>
                <input className="input" value={fragmento} readOnly />
              </div>
            )}
            <div className="campo">
              <label>
                Nuevo comentario <span className="obligatorio">*</span>
              </label>
              <textarea
                className={error ? "textarea con-error" : "textarea"}
                placeholder="Escribí una observación sobre el contrato."
                maxLength={MAXIMO}
                value={texto}
                onChange={(e) => {
                  setTexto(e.target.value);
                  setError("");
                }}
              />
              {error && <div className="helper-error">{error}</div>}
              <div className={restantes === 0 ? "helper-error" : "helper"}>{restantes} caracteres restantes</div>
            </div>
            <button className="btn btn-primario btn-bloque" onClick={publicar}>
              <MessageSquare size={14} /> Publicar comentario
            </button>
          </div>
        )}

        <div style={{ borderTop: "1px solid #edf1f5", marginTop: 16, paddingTop: 16 }}>
          {contrato.comentarios.map((c, i) => (
            <div key={i} className="caja-gris mb-8" style={{ padding: 12 }}>
              <strong style={{ fontSize: 13 }}>{c.autor}</strong>
              <div className="texto-tenue texto-chico">{c.fecha}</div>
              {c.fragmento && <div className="texto-chico texto-suave mt-8">Sobre: “{c.fragmento}”</div>}
              <p className="texto-chico mt-8" style={{ color: "#334155" }}>{c.texto}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
