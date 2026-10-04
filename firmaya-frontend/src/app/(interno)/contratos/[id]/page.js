import { redirect } from "next/navigation";

// /contratos/[id] abre directamente la pestaña Editor
export default async function ContratoPage({ params }) {
  const { id } = await params;
  redirect(`/contratos/${id}/editar`);
}
