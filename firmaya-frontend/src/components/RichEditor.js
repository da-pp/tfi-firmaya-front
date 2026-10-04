"use client";

// Editor de texto enriquecido muy simple (CU-02 y CU-16).
// Usa un <div contentEditable> y los comandos del navegador para
// negrita, cursiva, lista, título y cita (barra del prototipo de CU-02).

import { useEffect, useRef } from "react";

const BOTONES = [
  { texto: "B", comando: "bold" },
  { texto: "I", comando: "italic" },
  { texto: "Lista", comando: "insertUnorderedList" },
  { texto: "Título", comando: "formatBlock", valor: "h3" },
  { texto: "Cita", comando: "formatBlock", valor: "blockquote" },
];

// valorInicial: HTML con el que arranca el editor
// onCambio(html, texto): se llama cada vez que el usuario escribe
// derecha: elementos opcionales a la derecha de la barra (ej. badge "Cambios sin guardar")
export default function RichEditor({ valorInicial, onCambio, conError, derecha, alto = 280 }) {
  const editorRef = useRef(null);

  // Cargamos el contenido inicial una sola vez
  useEffect(() => {
    editorRef.current.innerHTML = valorInicial || "";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function avisarCambio() {
    const html = editorRef.current.innerHTML;
    const texto = editorRef.current.innerText.trim();
    onCambio(html, texto);
  }

  function aplicar(boton) {
    editorRef.current.focus();
    document.execCommand(boton.comando, false, boton.valor);
    avisarCambio();
  }

  return (
    <div>
      <div className="separado" style={{ paddingBottom: 12, borderBottom: "1px solid #edf1f5", marginBottom: 14 }}>
        <div className="botonera">
          {BOTONES.map((b) => (
            <button key={b.texto} type="button" className="btn btn-chico" onClick={() => aplicar(b)}>
              {b.texto}
            </button>
          ))}
        </div>
        {derecha}
      </div>
      <div
        ref={editorRef}
        className={conError ? "caja-gris contenido-contrato con-error" : "caja-gris contenido-contrato"}
        contentEditable
        suppressContentEditableWarning
        onInput={avisarCambio}
        style={{ minHeight: alto, outline: "none" }}
      />
    </div>
  );
}
