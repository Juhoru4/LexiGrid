# LexiGrid - Portal Web

Prototipo web para analistas y administradores de LexiGrid. Permite revisar formularios OCR, resolver duplicados e incontactables, preparar envíos y consultar el historial. El alcance de este repositorio se limita a la plataforma web; no incluye una aplicación móvil ni operaciones exclusivas de embajadores.

## Requisitos

- Windows 10/11, macOS o Linux
- Node.js 20 o superior
- Corepack habilitado para usar pnpm 12.3.4, la versión fijada por el proyecto

## Ejecutar por primera vez

1. Abre una terminal en la raíz del proyecto.
2. Instala las dependencias:
   ```powershell
   corepack pnpm install
   ```
3. Inicia el servidor de desarrollo:
   ```powershell
   corepack pnpm dev
   ```
4. Abre `http://localhost:3000`.
5. En la pantalla de inicio usa una de las cuentas de demostración mostradas por la interfaz.

Cuentas disponibles:

| Usuario | Rol | Correo | Contraseña |
|---|---|---|---|
| Laura Mejía | Analista | `laura.mejia@lexigrid.edu.co` | `Lexi-Laura#2026` |
| Camilo Ortiz | Analista | `camilo.ortiz@lexigrid.edu.co` | `Lexi-Camilo#2026` |
| Paola Restrepo | Administradora | `paola.restrepo@lexigrid.edu.co` | `Lexi-Paola#2026` |

## Compilar

```powershell
corepack pnpm build
corepack pnpm start
```

## Persistencia de demostración

Los datos, filtros, historial y cambios se guardan en `localStorage` del navegador. Para restablecerlos, usa **Enviar al CRM > Restablecer datos demo** o elimina los datos de sitio para `localhost:3000`.

## Alcance de seguridad

Es un prototipo frontend. La autenticación de demostración usa sesión firmada, hash scrypt y bloqueo temporal en memoria. No sustituye autenticación, cifrado de datos reales, autorización de servidor ni integración CRM productiva.
