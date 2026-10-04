// Cuadro de diálogo simple.
// Uso:
// <Modal titulo="Confirmar" mensaje="¿Está seguro?">
//   <button className="btn">Cancelar</button>
//   <button className="btn btn-primario">Confirmar</button>
// </Modal>

export default function Modal({ titulo, mensaje, children }) {
  return (
    <div className="modal-fondo">
      <div className="modal" role="dialog" aria-modal="true">
        {titulo && <h2>{titulo}</h2>}
        {mensaje && <p>{mensaje}</p>}
        <div className="botonera botonera-derecha">{children}</div>
      </div>
    </div>
  );
}
