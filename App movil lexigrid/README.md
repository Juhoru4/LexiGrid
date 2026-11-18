# Ejecutar el prototipo

## Primera vez

Requisito: tener Node.js instalado. Abre PowerShell y entra a la carpeta del proyecto:

```powershell
cd "C:\Users\DELL\OneDrive\Desktop\1\app-lexigrid-prototipo"
```

Instala las dependencias:

```powershell
npx --yes pnpm@12.3.4 install
```

Inicia el prototipo:

```powershell
npx --yes pnpm@12.3.4 dev
```

Cuando aparezca `Ready` en la terminal, abre [http://localhost:3000](http://localhost:3000). Deja la terminal abierta mientras uses la aplicación.

## Próximas veces

Abre PowerShell, vuelve a la carpeta del proyecto y ejecuta:

```powershell
cd "C:\Users\DELL\OneDrive\Desktop\1\app-lexigrid-prototipo"
npx --yes pnpm@12.3.4 dev
```

Para detener el servidor, presiona `Ctrl+C` en la terminal.
