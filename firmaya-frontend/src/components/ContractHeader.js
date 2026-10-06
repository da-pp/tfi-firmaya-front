// Tarjeta con los metadatos del contrato: CONTRATO · ESTADO · VERSIÓN · HASH.
// Se repite en casi todos los prototipos de los casos de uso.
// "extra" permite agregar más datos (ej. cantidad de comentarios).

import Badge from "./Badge";
import { hashCorto } from "@/lib/utils";

export default function ContractHeader({ contrato, extra = [] }) {
  return (
    <div className="card">
      <div className="contrato-header">
        <div className="contrato-header-dato">
          <span>Contrato</span>
          <strong>{contrato.nombre}</strong>
        </div>
        <div className="contrato-header-dato">
          <span>Estado</span>
          <Badge texto={contrato.estado} />
        </div>
        <div className="contrato-header-dato">
          <span>Versión</span>
          <strong>v{contrato.numeroVersion}</strong>
        </div>
        <div className="contrato-header-dato">
          <span>Hash</span>
          <span className="mono" title={contrato.hash} style={{ textTransform: "none", fontSize: 11, color: "var(--texto-suave)" }}>
            {hashCorto(contrato.hash, 40)}
          </span>
        </div>
        {extra.map((dato) => (
          <div className="contrato-header-dato" key={dato.etiqueta}>
            <span>{dato.etiqueta}</span>
            <strong>{dato.valor}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
