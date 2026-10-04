import "./globals.css";

export const metadata = {
  title: "FirmaYA",
  description: "Plataforma Centralizada de Gestión de Contratos",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
