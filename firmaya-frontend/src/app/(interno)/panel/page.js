"use client";

// Panel principal: lista de contratos y botón "Nuevo Contrato" (entrada a CU-01 y CU-02).

import { useEffect, useState } from "react";
import Link from "next/link";
import { LayoutGrid, Plus } from "lucide-react";
import PageTitle from "@/components/PageTitle";
import Badge from "@/components/Badge";
import Alert from "@/components/Alert";
import { contratos, versionActual } from "@/data/contracts";
import { useUsuario, tomarFlash } from "@/data/session";

export default function PanelPage() {
  const { usuario } = useUsuario();
  const [mensaje, setMensaje] = useState(null);

  // Mensaje que viene de otra pantalla (ej. "Bienvenido, ...")
  useEffect(() => {
    const flash = tomarFlash();
    if (flash) setMensaje(flash);
  }, []);

  // CU-01: solo Abogado o Agente Inmobiliario crean contratos
  const puedeCrear = usuario && usuario.rol !== "Administrador";

  return (
    <>
      <PageTitle icono={LayoutGrid} titulo="Panel principal" />

      {mensaje && <Alert tipo={mensaje.tipo} texto={mensaje.texto} />}

      <div className="card">
        <div className="card-titulo">
          <h2>Contratos</h2>
          {puedeCrear && (
            <Link href="/contratos/nuevo" className="btn btn-primario">
              <Plus size={14} /> Nuevo Contrato
            </Link>
          )}
        </div>

        <div className="tabla-contenedor">
          <table className="tabla">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Estado</th>
                <th>Versión</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {contratos.map((c) => (
                <tr key={c.id}>
                  <td><strong>{c.nombre}</strong></td>
                  <td><Badge texto={c.estado} /></td>
                  <td>v{versionActual(c).numero}</td>
                  <td>
                    <Link href={`/contratos/${c.id}/editar`} className="btn btn-chico">Editar</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
