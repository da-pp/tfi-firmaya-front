// Título de pantalla con el cuadrado oscuro e icono (como en los prototipos).
// Uso: <PageTitle icono={FileText} titulo="Crear contrato desde plantilla" />

export default function PageTitle({ icono: Icono, titulo }) {
  return (
    <div className="titulo-pagina">
      <div className="titulo-pagina-icono">
        <Icono size={18} />
      </div>
      <h1>{titulo}</h1>
    </div>
  );
}
