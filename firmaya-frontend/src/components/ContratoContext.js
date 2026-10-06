"use client";

// Contrato cargado por el layout de /contratos/[id] y compartido con sus pestañas.

import { createContext, useContext } from "react";

export const ContratoContext = createContext(null);

// { contrato, recargar }: recargar vuelve a pedir el contrato (ej. después de guardar una versión)
export function useContrato() {
  return useContext(ContratoContext);
}
