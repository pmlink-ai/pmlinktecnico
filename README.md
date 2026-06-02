# PMLink Técnico — App Móvil

React Native / Expo SDK 54 · Supabase · iOS & Android

---

## Inicio rápido

```powershell
# Desarrollo — conecta a BD dev (ebdkswqleygseytxtuap)
npm run start-clear

# Producción — conecta a BD prod (mwtdoidrjuahsejfctlm), solo para validación
$env:NODE_ENV="production" ; npx expo start --port 8086 --clear
```

> El entorno es **temporal por terminal**. `npm run start-clear` siempre apunta a dev.  
> No hay ningún archivo que revertir al cambiar entre entornos.

Escanear QR con **Expo Go** en iOS o con la cámara del iPhone.  
URL manual en Expo Go: `exp://192.168.100.5:8085` (dev) o `exp://192.168.100.5:8086` (prod).

| Entorno | Puerto | Usuario de prueba |
|---------|--------|-------------------|
| Dev | 8085 | `pmlinkapp@gmail.com / tecnico123` |
| Prod | 8086 | `pmlinkapp@gmail.com / tecnico123` |

---

## Entornos

| Archivo | Entorno | Supabase |
|---------|---------|---------|
| `.env.development` | Dev (pruebas) | `ebdkswqleygseytxtuap.supabase.co` |
| `.env.production` | Prod | `mwtdoidrjuahsejfctlm.supabase.co` |

Expo carga automáticamente `.env.development` al correr `expo start`.  
Las variables deben tener prefijo `EXPO_PUBLIC_` para ser accesibles en el bundle.

---

## Arquitectura

```
index.js
└── App.js  ← Punto de entrada activo (monolítico)
    ├── LoginScreen        (componente interno de App.js)
    ├── HomeScreen         (lista de órdenes de trabajo)
    ├── OrderDetailScreen  (detalle + formularios)
    └── ...

lib/supabase.js            ← Cliente Supabase (lee de .env)
services/                  ← PDF, email, archivos
forms/                     ← Formularios por tipo de servicio
components/                ← Componentes reutilizables
src/                       ← Refactorización en progreso (no activo aún)
```

> **Nota:** `src/` contiene una refactorización con navegación separada, pero **no está activa**. El entry point es `index.js → App.js`.

---

## Deploy — Guía para builds futuros

### Prerequisitos
- Estar logueado en EAS: `npx eas login` (cuenta: `gracecid`)
- `.env.production` presente en el proyecto (no está en git)
- Apple Developer Account activa (`grace.cid@gmail.com`, Team ID: `C722539ZG3`)

---

### Android — Generar nuevo APK

```powershell
cd "D:\Visual Studio Code\PMLINK\pmlinktecnico"
$env:EAS_NO_VCS=1
$env:EAS_SKIP_AUTO_FINGERPRINT=1
npx eas build --platform android --profile production-apk --clear-cache
```

- El build tarda ~10 minutos en la nube de EAS
- Al terminar entrega un link `.apk` descargable
- Se distribuye directamente a técnicos Android por WhatsApp o cable

> **IMPORTANTE:** `@supabase/supabase-js` debe estar pineado a `"2.51.0"` exacto (sin `^`) en `package.json`. Si se actualiza a versiones `2.106+` el build falla con error Hermes por dependencias de OpenTelemetry.

---

### iOS — Generar nuevo .ipa y subir a TestFlight

```powershell
cd "D:\Visual Studio Code\PMLINK\pmlinktecnico"
$env:EAS_NO_VCS=1
$env:EAS_SKIP_AUTO_FINGERPRINT=1
npx eas build --platform ios --profile production --clear-cache
```

Cuando termine el build, subir a TestFlight:

```powershell
npx eas submit --platform ios --latest
```

- Apple procesa el build en ~10 minutos
- Para **pruebas externas**: el enlace público `https://testflight.apple.com/join/bfxx5KSJ` se activa cuando Apple aprueba la build (1-2 días)
- Para **pruebas internas** (sin esperar aprobación): agregar al técnico en App Store Connect → Usuarios y acceso → rol Customer Support → luego agregarlo al grupo **Team (Expo)** en TestFlight

> Si EAS pide login de Apple durante el build, ingresar `grace.cid@gmail.com` y la contraseña. Sesión guardada en `C:\Users\diego\.app-store\auth\grace.cid@gmail.com\cookie`.

---

### Ambas plataformas a la vez

```powershell
$env:EAS_NO_VCS=1
$env:EAS_SKIP_AUTO_FINGERPRINT=1
npx eas build --platform all --profile production-apk --clear-cache
```

---

### Builds actuales en producción (1 Junio 2026)

| Plataforma | Versión | Build | Archivo |
|-----------|---------|-------|---------|
| Android | 1.5.0 | versionCode 1 | [APK](https://expo.dev/artifacts/eas/rj7499MU7KvLJCas9bCgpe.apk) |
| iOS | 1.5.0 | buildNumber 3 | TestFlight: `https://testflight.apple.com/join/bfxx5KSJ` |

App Store Connect: https://appstoreconnect.apple.com/apps/6775684488/testflight/ios  
EAS Dashboard: https://expo.dev/accounts/gracecid/projects/pmlinktecnico/builds

---

## Sesión 1 Junio 2026 — Lo que se hizo y en qué quedamos

### ✅ Completado

#### Build APK Android — EXITOSO ✅
- **Causa del fallo anterior**: `@supabase/supabase-js` con `^2.51.0` hacía que EAS instalara `2.106+` que trae `@opentelemetry` con comentarios `/* webpackIgnore: true */` dentro de `import()` dinámico. Hermes (motor JS de Android) rechaza esa sintaxis.
- **Fix aplicado**: pinear Supabase a `"2.51.0"` exacto (sin `^`) en `package.json`
- **Resultado**: Build `ccfb95da` exitoso — APK descargable

#### Build iOS — EXITOSO ✅
- Aceptar contrato Apple Developer Program License Agreement (estaba vencido) desbloqueó el build
- Build `f2967942` generado correctamente, buildNumber bumpeado a 3
- Subido a TestFlight con `eas submit --platform ios --latest`

#### TestFlight configurado
- Grupo **Técnicos PMLink** (pruebas externas) creado con enlace público
- Enlace público: `https://testflight.apple.com/join/bfxx5KSJ` (activo cuando Apple apruebe)
- Grupo **Team (Expo)** (pruebas internas) disponible para distribución inmediata

### ⏳ Pendiente
- Esperar aprobación de Apple para el enlace público de pruebas externas (1-2 días)
- Agregar técnicos con iPhone al grupo interno si se necesita acceso inmediato

---

## Sesión 31 Mayo 2026 — Lo que se hizo y en qué quedamos

### Objetivo del día
Generar el APK de Android para instalación directa en celulares de los técnicos (sin Expo Go).

---

### ✅ Completado

#### Bug crítico: Logger recursivo en App.js
`loadOrders` no mostraba órdenes aunque la BD tenía 33 filas.  
Causa: el logger estaba definido así → `log: (...args) => logger.log(...args)` → bucle infinito → crash silencioso antes de llamar `setOrders(data)`.  
Fix: `log: (...args) => isDev && console.log(...args)`

#### Bug crítico: Auth token vencido al abrir la app
`[AuthApiError: Invalid Refresh Token]` al iniciar → la app quedaba en blanco.  
Fix en `src/contexts/AuthContext.js`: si `getSession()` retorna error, se hace `signOut()` automático y el usuario ve la pantalla de login.

#### App validada funcionando ✅
- 33 órdenes cargando correctamente en pantalla principal
- Login / logout funcional
- Formularios operando

#### Configuración Android para EAS Build
- `android/gradle.properties`: `reactNativeArchitectures=arm64-v8a` (era 4 arqs → OOM en EAS), `newArchEnabled=false` (incompatible con react-native-mail 6.1.1)
- `.easignore` creado para excluir `android/.gradle/` (causaba error `EBUSY: resource busy or locked` al subir el archivo)

#### Babel plugin para fix de Hermes / webpackIgnore
El error de build era:
```
index.android.bundle:107538:57: error: Invalid expression encountered
otelModulePromise = import(/* webpackIgnore: true */
```
OpenTelemetry (dependencia transitiva) usa comentarios `/* webpackIgnore: true */` dentro de `import()` dinámicos. Hermes (JS engine de Android) no los acepta.  
Se agregó un plugin Babel en `babel.config.js` que recorre el AST y elimina esos comentarios de todos los `CallExpression` con callee `Import`.

#### metro.config.js simplificado
Se quitó el `resolveRequest` para `@opentelemetry/*` (enfoque incorrecto — impedía resolver el módulo pero el comentario seguía en el bundle del código llamador).

---

### ✅ Resuelto en sesión 1 Junio 2026

El problema raíz era que `@supabase/supabase-js` sin versión fija (`^2.51.0`) hacía que EAS instalara la última `2.x` (con OpenTelemetry). Solución: pinear a `2.51.0` exacto en `package.json` (sin `^`).

---

### 🔴 Plan para mañana — Resolver el build APK

**Opción A (más rápida) — Pinear supabase a una versión anterior sin el problema**

Cambiar en `package.json`:
```json
"@supabase/supabase-js": "2.51.0"
```
La versión `2.51.x` no tiene `iceberg-js` ni OpenTelemetry. Esto eliminaría el problema de raíz.
```powershell
npm install @supabase/supabase-js@2.51.0 --legacy-peer-deps
```
Verificar que la app sigue funcionando, luego buildear.

**Opción B — Forzar que Metro transforme node_modules con Babel**

Agregar en `metro.config.js`:
```js
config.transformer.unstable_allowRequireContext = true;
config.resolver.unstable_enablePackageExports = false;

// Forzar transform de los paquetes problemáticos
const defaultTransformIgnorePatterns = config.resolver.sourceExts;
```
O la solución más directa con `transformerPath` + `babelTransformerPath` que incluya node_modules.

**Opción C — Parchear el archivo directamente (patch-package)**

Instalar `patch-package`, modificar el `.mjs` del paquete ofensor para quitar `/* webpackIgnore: true */`, y commitear el patch para que EAS lo aplique después del `npm install`.

**Orden recomendado de intento: A → C → B**

---

### Builds EAS realizados hoy (todos fallidos)

| Build ID | Motivo del fallo |
|----------|-----------------|
| `6230ac75` | Babel plugin aplicado pero error Hermes persiste |
| Builds anteriores | `resolveRequest` @opentelemetry vacío — no resolvía el problema raíz |

**URL para seguimiento**: https://expo.dev/accounts/gracecid/projects/pmlinktecnico/builds

---

### Comandos para retomar mañana

```powershell
cd "D:\Visual Studio Code\PMLINK\pmlinktecnico"

# Opción A: pinear supabase
npm install @supabase/supabase-js@2.51.0 --legacy-peer-deps

# Verificar app sigue funcionando
npm run start-clear

# Nuevo build con cache limpia
$env:EAS_NO_VCS=1 ; $env:EAS_SKIP_AUTO_FINGERPRINT=1 ; npx eas build --platform android --profile production-apk --clear-cache
```

---

## Sesión 21 Mayo 2026 — Lo que se hizo y en qué quedamos

### ✅ Completado

#### App conectada a entornos correctos (dev/prod)
`App.js` tenía la URL de Supabase de **producción hardcodeada**. Se reemplazó por `process.env.EXPO_PUBLIC_SUPABASE_URL` para que lea del `.env.development` o `.env.production` según el entorno.

#### Credenciales de login limpiadas
`LoginScreen` tenía `admin@pmlink.com / admin123456` como valores por defecto. Cambiados a vacío con placeholders genéricos.

#### RPC `get_table_structure` creado en dev y prod
La app usa este RPC para renderizar dinámicamente los campos de cada formulario (Limpieza de Ductos, ANSUL, Electromecánico). Retorna `column_name`, `data_type` e `is_nullable` de `information_schema.columns`. Desplegado con `SECURITY DEFINER` en ambas BDs.

#### Formulario Limpieza de Ductos — validado funcionando en dev
Órdenes cargan, formulario renderiza campos y fluye correctamente.

#### SQL aplicado en producción (`mwtdoidrjuahsejfctlm`) ✅ VALIDADO
Confirmado funcionando en prod: 28 órdenes cargan, formulario Limpieza de Ductos opera correctamente.
- `get_ordenes_activas` con `prosecdef = true`
- `get_table_structure` con `prosecdef = true`
- GRANTs en `servicios`, `local`, `zona`, `empresa`, `formularios`, `estados_orden_trabajo`, `prioridades`
- Políticas RLS de lectura para todas las tablas de catálogo

#### Versiones React alineadas con Expo SDK 54
Conflicto entre `react@19.1.4` y `react-native@0.81.6` vs las esperadas por Expo SDK 54.  
Corregido con `npm install --legacy-peer-deps`:
- `react`: `19.1.0`
- `react-dom`: `19.1.0`
- `react-native`: `0.81.5`

#### `console.log` silenciados en producción
655 llamadas a `console.log/error/warn` reemplazadas por `logger.*` que se silencia automáticamente cuando `NODE_ENV=production`. Evita filtrar datos sensibles en logs de dispositivos en producción.

#### Auditoría de seguridad — credenciales hardcodeadas eliminadas
Se encontraron y limpiaron 3 archivos con credenciales incrustadas en el código:

| Archivo | Problema | Fix aplicado |
|---|---|---|
| `app.json` | URL + anon key de Supabase PROD en sección `extra` | Eliminadas |
| `config/environments.js` | Anon key de PROD hardcodeada | Reemplazada por `process.env.EXPO_PUBLIC_*` |
| `test-connection-debug.js` | `superadmin@pmlink.co / superadmin123` | Reemplazados por variables de entorno |
| `.gitignore` | No ignoraba scripts `test-*.js` | Agregado patrón `test-*.js` |

---

### ⏳ Para mañana — Deploy a producción

**Paso 1 — Mergear rama a `main` en GitHub**  
Marcelo necesita tomar el código de la rama actual y hacer el build.  
```bash
# En GitHub: crear Pull Request → mergear a main
# O por consola:
git checkout main
git merge <rama-actual>
git push origin main
```

**Paso 2 — Build APK Android (distribución directa a técnicos)**
```powershell
npm run build:android
# equivale a: eas build --platform android --profile production-apk
# Genera un .apk descargable desde el dashboard de EAS
```

**Paso 3 — Build iOS (si aplica)**
```powershell
npm run build:ios
# equivale a: eas build --platform ios --profile production
```

> Los builds se ejecutan en la nube de EAS. Requiere estar logueado con `eas login`.  

> ### 🔴 RECORDATORIO — `.env.production` no está en GitHub
> El archivo `.env.production` está en `.gitignore` por seguridad y **no se sube al repositorio**.  
> Contiene las credenciales de Supabase PROD:
> ```
> EXPO_PUBLIC_SUPABASE_URL=https://mwtdoidrjuahsejfctlm.supabase.co
> EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...QtKVhvZiY...
> ```
> **Marcelo lo necesita antes de buildear.** Dos opciones:
> - Enviarle el archivo `.env.production` directamente
> - Configurar las variables como **secrets en EAS** en [eas.expo.dev](https://eas.expo.dev)

---

## Sesión 19 Mayo 2026 — Lo que se hizo y en qué quedamos

### ✅ Completado

#### Entornos separados dev/prod
- Creados `.env.development` y `.env.production`
- `lib/supabase.js` actualizado para leer de `process.env.EXPO_PUBLIC_*`

#### Fix AsyncStorageAdapter
- `setItem` y `removeItem` no retornaban Promises → race condition al guardar sesión
- Corregido en `lib/supabase.js`

#### Fix de carga de órdenes (error 42501 en cascada)
El query original usaba joins anidados (`servicios!inner → local!inner → zona!inner → empresa`). PostgREST fallaba con `permission denied` al resolver permisos en cada tabla del join.

**Evolución del error:**
1. `42501 for table prioridades` → eliminamos join de prioridades
2. `42501 for table servicios` → eliminamos todos los joins anidados
3. `42501 for function es_superadmin_uid` → el problema real: RLS llama funciones sin permiso

**Solución final — RPC Multi-Tenant Seguro:**

```sql
CREATE OR REPLACE FUNCTION public.get_ordenes_activas()
RETURNS SETOF public.orden_trabajo
LANGUAGE plpgsql
SECURITY DEFINER  -- corre como postgres, bypasea cascada de permisos
STRICT            -- si auth.uid() es NULL, retorna vacío sin tocar tablas
SET search_path = public
AS $$
BEGIN
    IF auth.uid() IS NULL THEN RETURN; END IF;

    RETURN QUERY
    SELECT ot.* FROM public.orden_trabajo ot
    WHERE ot.activa = true
      AND (
        public.es_superadmin_uid(auth.uid())
        OR public.usuario_tiene_alcance_orden(auth.uid(), ot.id)
      )
    ORDER BY ot.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_ordenes_activas() TO authenticated;
```

**Por qué funciona:**
- `SECURITY DEFINER` (owner = postgres) resuelve el problema de permisos en cascada
- Reutiliza `es_superadmin_uid` y `usuario_tiene_alcance_orden` → mantiene lógica multi-tenant
- No toca ninguna política RLS existente de la web

**En `App.js`, `loadOrders` ahora:**
1. Verifica sesión con `supabase.auth.getUser()` (valida JWT contra servidor)
2. Llama a `.rpc('get_ordenes_activas')` para las órdenes
3. Carga catálogos en paralelo: `prioridades`, `estados_orden_trabajo`, `servicios`, `local`, `zona`, `empresa`
4. Construye jerarquía `servicios → local → zona → empresa` en memoria

#### Fix de dependencias
- Instalado `react-native-webview` (requerido por `react-native-signature-canvas`)
- `react` y `react-dom` actualizados de `19.1.0` a `19.1.4` (match con `react-native-renderer`)

---

### ⏳ Para mañana — Continuar aquí

**1. Verificar que las órdenes cargan en la app (prioridad máxima)**

Abrir la app y revisar logs. Posibles escenarios:

| Resultado | Causa probable | Acción |
|-----------|----------------|--------|
| ✅ Lista con órdenes | Todo funciona | Pasar al punto 2 |
| Lista vacía, sin error | `pmlinkapp@gmail.com` no tiene `es_superadmin=true` en BD dev | Verificar en Supabase: `SELECT es_superadmin FROM usuario WHERE email='pmlinkapp@gmail.com'` |
| Error en el RPC | PK de `orden_trabajo` no se llama `id` | Revisar: puede ser `orden_trabajo_id`. Ajustar `ot.id` en el RPC |
| Nuevo error 42501 | Falta GRANT en otra tabla | Ejecutar `GRANT SELECT ON <tabla> TO authenticated` |

**2. Aplicar los mismos fixes en Supabase PROD**

Una vez validado en dev, ejecutar el mismo SQL del RPC en la BD de producción.

**3. Limpiar credenciales hardcodeadas en App.js**

El `LoginScreen` dentro de `App.js` tiene valores por defecto `admin@pmlink.com / admin123456`. Cambiar a vacío o al usuario de prueba para no confundir.

**4. Evaluar versión de React**

Expo SDK 54 espera `react@19.1.0` pero instalamos `19.1.4`. Verificar si hay problemas de compatibilidad o revertir con:
```powershell
npx expo install react@19.1.0 react-dom@19.1.0 -- --legacy-peer-deps
```

---

## Archivos clave modificados

| Archivo | Descripción |
|---------|-------------|
| `App.js` | Entry point activo. `loadOrders` usa RPC + catálogos separados |
| `lib/supabase.js` | Cliente Supabase con env vars y AsyncStorage corregido |
| `sql/fix_rls_ordenes_tecnico.sql` | Historial de todos los fixes SQL del día |
| `.env.development` | Credenciales BD dev (no commitear) |
| `.env.production` | Credenciales BD prod (no commitear) |

---

## SQL útil para debug

```sql
-- Verificar si el usuario es superadmin en dev
SELECT usuario_id, email, es_superadmin
FROM public.usuario
WHERE email = 'pmlinkapp@gmail.com';

-- Ver PK real de orden_trabajo
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'orden_trabajo' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Probar el RPC directamente en Supabase
SELECT * FROM public.get_ordenes_activas();
```
