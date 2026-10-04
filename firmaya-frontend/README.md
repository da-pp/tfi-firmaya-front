# FirmaYA – Frontend

Frontend navegable de los 21 casos de uso. Next.js (App Router) + React + JavaScript + CSS.
No hay backend: todos los datos son mocks en memoria (`src/data/`) y se reinician al recargar la página.

## Ejecutar

```bash
npm install
npm run dev
```

Abrir http://localhost:3000 (redirige a `/login`).

## Usuarios de prueba (CU-19)

Contraseña de todos: `Password1!`

| Email | Rol | Estado |
|---|---|---|
| daniel@mail.com | Administrador | Activo |
| maria@mail.com | Abogado | Activo |
| pablo@mail.com | Agente Inmobiliario | Activo |
| laura@mail.com | Agente Inmobiliario | Inactivo (no puede ingresar) |

## Rutas

| Ruta | Casos de uso |
|---|---|
| `/login` | CU-19 |
| `/recuperar-password` y `/recuperar-password/[token]` | CU-21 |
| `/panel` | Panel principal (lista de contratos) |
| `/contratos/nuevo` | CU-01 |
| `/contratos/[id]/editar` | CU-02 |
| `/contratos/[id]/comentarios` | CU-06 |
| `/contratos/[id]/invitar` | CU-03 |
| `/contratos/[id]/estado` | CU-05 |
| `/contratos/[id]/firmas` y `/firmas/solicitar` | CU-09 y CU-07 |
| `/contratos/[id]/versiones` | CU-11 y CU-14 |
| `/contratos/[id]/versiones/comparar` | CU-12 |
| `/contratos/[id]/versiones/integridad` | CU-13 |
| `/contratos/[id]/pdf` | CU-10 |
| `/perfil` | CU-20 |
| `/backoffice/usuarios` · `plantillas` · `actividad` · `auditoria` | CU-15 · CU-16 · CU-17 · CU-18 |
| `/acceso/[token]` | CU-04 (parte invitada, sin cuenta) |
| `/firmar/[token]` | CU-08 |

## Contratos de prueba

| Id | Contrato | Estado | Útil para |
|---|---|---|---|
| 1 | Locación - Av. Corrientes 1240 | En Revisión | Edición, comentarios, invitar, 4 versiones, comparar, restaurar. Su hash actual es el del prototipo (`a3f91c24…9c44`) |
| 2 | Boleto de compraventa - Palermo | Listo para firmar | Estado de firmas (1 de 3), reenvío, firma OTP |
| 3 | Mandato administración - Local Centro | Firmado | No editable, PDF firmado (la 1.ª generación falla) |
| 4 | Locación - Belgrano | Borrador | Una sola versión, sin partes |
| 5 | Mandato - Recoleta | En Revisión | Pasar a "Listo para firmar" sin firmantes |
| 6 | Locación - San Telmo | Archivado | Contrato no disponible para partes |

## Cómo provocar los caminos alternativos

| Escenario | Cómo |
|---|---|
| Error al enviar un correo (CU-03, CU-07, CU-09) | Cualquier email que contenga `fallo` falla la **primera** vez; el reintento funciona. Ej.: reenviar a Carlos Ruiz en el contrato 2 |
| Error de conexión en login (CU-19) | Email que contenga `sinconexion` (falla la primera vez) |
| Bloqueo por intentos (CU-19) | 5 contraseñas incorrectas para la misma cuenta |
| No hay plantillas (CU-01) | Dejar todas las plantillas "Inactiva" en BackOffice y luego ir a "Nuevo Contrato" |
| Token de acceso (CU-04) | `/acceso/acc-juan` (Firmante, puede firmar), `/acceso/acc-carlos` (Revisor), `/acceso/acc-lucia` (Solo lectura), `/acceso/acc-archivado` (archivado), cualquier otro → enlace inválido |
| Firma OTP (CU-08) | `/firmar/firma-juan` o `/firmar/firma-carlos`. OTP correcto `123456`, expirado `000000`, otro → incorrecto (3 intentos y se bloquea). Cualquier otro token → enlace inválido |
| Recuperar contraseña (CU-21) | `/recuperar-password/valido` (cuenta maria@mail.com, se puede usar una vez). Cualquier otro token → expirado |
| Error al generar PDF (CU-10) | Contrato 3: la primera generación falla |
| Error al exportar auditoría (CU-18) | La primera exportación de la sesión falla |
| Sesión por inactividad (CU-04) | 60 minutos sin actividad (constante `INACTIVIDAD_MS` en `src/app/acceso/[token]/page.js`) |

## Estructura

```
src/
  app/            páginas (App Router). "(interno)" agrupa las pantallas con sesión.
  components/     componentes reutilizables (ContractHeader, Modal, Badge, ...)
  data/           datos mock en memoria
  lib/            utilidades (fechas, validaciones, hash simulado, diff, PDF)
```
