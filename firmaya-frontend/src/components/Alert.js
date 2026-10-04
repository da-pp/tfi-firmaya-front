// Mensaje de éxito, error, aviso o información.
// tipo: "exito" | "error" | "aviso" | "info"
// children: botones opcionales que se muestran a la derecha

export default function Alert({ tipo = "info", texto, children }) {
  return (
    <div className={`alerta alerta-${tipo}`}>
      <span>{texto}</span>
      {children && <div className="botonera">{children}</div>}
    </div>
  );
}
