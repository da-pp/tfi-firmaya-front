// Campo de formulario: etiqueta (con * si es obligatorio), el control y el mensaje de error.
// Uso:
// <FormField etiqueta="Email" obligatorio error={errores.email}>
//   <input className="input" ... />
// </FormField>

export default function FormField({ etiqueta, obligatorio, error, ayuda, children }) {
  return (
    <div className="campo">
      {etiqueta && (
        <label>
          {etiqueta} {obligatorio && <span className="obligatorio">*</span>}
        </label>
      )}
      {children}
      {error && <div className="helper-error">{error}</div>}
      {!error && ayuda && <div className="helper">{ayuda}</div>}
    </div>
  );
}
