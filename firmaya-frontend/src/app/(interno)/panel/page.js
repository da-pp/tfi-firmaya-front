"use client";

// Panel principal: lista de contratos del usuario y botón "Nuevo Contrato" (entrada a CU-01 y CU-02).

import { useEffect, useState } from "react";
import Link from "next/link";
import { LayoutGrid, Plus } from "lucide-react";
import PageTitle from "@/components/PageTitle";
import Badge from "@/components/Badge";
import Alert from "@/components/Alert";
import { useUsuario, tomarFlash } from "@/data/session";
import { useDatos } from "@/lib/api";
import { fechaHoraDeIso } from "@/lib/utils";

export default function PanelPage() {
  const { usuario } = useUsuario();
  const [mensaje, setMensaje] = useState(null);
  const { datos: contratos, error, cargando } = useDatos("/contratos");

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

        {cargando && <p className="texto-suave">Cargando contratos…</p>}
        {error && <Alert tipo="error" texto={error.message} />}
        {contratos && contratos.length === 0 && <Alert tipo="info" texto="Todavía no tenés contratos." />}

        {contratos && contratos.length > 0 && (
          <div className="tabla-contenedor">
            <table className="tabla">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Estado</th>
                  <th>Última modificación</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {contratos.map((c) => (
                  <tr key={c.idContrato}>
                    <td><strong>{c.nombre}</strong></td>
                    <td><Badge texto={c.estado} /></td>
                    <td className="texto-suave">{fechaHoraDeIso(c.ultimaModificacion)}</td>
                    <td>
                      <Link href={`/contratos/${c.idContrato}/editar`} className="btn btn-chico">Editar</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
