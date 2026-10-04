// Paginación simple: "Anterior · Página X de Y · Siguiente"

export default function Pagination({ pagina, totalPaginas, onCambiar }) {
  if (totalPaginas <= 1) return null;

  return (
    <div className="botonera botonera-derecha mt-16">
      <button className="btn btn-chico" disabled={pagina === 1} onClick={() => onCambiar(pagina - 1)}>
        Anterior
      </button>
      <span className="texto-suave texto-chico">
        Página {pagina} de {totalPaginas}
      </span>
      <button className="btn btn-chico" disabled={pagina === totalPaginas} onClick={() => onCambiar(pagina + 1)}>
        Siguiente
      </button>
    </div>
  );
}
