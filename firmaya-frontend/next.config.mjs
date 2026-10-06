// URL del backend (Spring Boot). Se puede cambiar con la variable de entorno BACKEND_URL.
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // El navegador llama a /api/... en el mismo origen y Next lo reenvía al backend.
  // Así no hace falta configurar CORS en el backend.
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${BACKEND_URL}/api/:path*` }];
  },
};

export default nextConfig;
