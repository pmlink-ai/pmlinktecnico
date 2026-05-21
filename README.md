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
