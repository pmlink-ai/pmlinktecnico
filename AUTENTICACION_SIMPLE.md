# 🚀 Sistema de Autenticación Simplificado - PMLink Admin

## ✅ **CAMBIO REALIZADO**

Hemos simplificado completamente el sistema de autenticación para usar **solo la tabla `usuario`** sin depender de `auth.users` de Supabase.

## 📋 **Pasos para implementar:**

### 1. **Ejecutar script de preparación:**
```sql
-- Ejecutar: database/create_users_simple.sql
```

Este script:
- ✅ Agrega columna `password` a la tabla `usuario`
- ✅ Elimina la dependencia de `auth.users`
- ✅ Crea usuarios de prueba directamente

### 2. **Sistema actualizado:**
- ✅ **AuthContextSimple.tsx**: Nueva autenticación simple
- ✅ **App.tsx**: Actualizado para usar el nuevo contexto
- ✅ **Login.tsx**: Actualizado para usar el nuevo contexto
- ✅ **ProtectedRoute.tsx**: Actualizado para usar el nuevo contexto

## 🔑 **Cómo funciona ahora:**

### **Login simplificado:**
1. Usuario ingresa email y password
2. App busca en tabla `usuario` con email
3. Verifica que `activo = true`
4. Compara password (por ahora simple, en producción usaría hash)
5. Si es correcto, guarda sesión en localStorage

### **Usuarios de prueba:**
- **Email**: `admin@pmlink.com` / **Password**: `admin123456`
- **Email**: `admin2@pmlink.com` / **Password**: `admin123456`

## 🎯 **Ventajas:**

- ✅ **Mucho más simple** - Sin dependencias de auth.users
- ✅ **Control total** - Manejamos toda la lógica nosotros
- ✅ **Sin errores** - No más problemas con triggers o Supabase Auth
- ✅ **Funciona inmediatamente** - Solo necesita la tabla usuario

## 📝 **Para probar:**

1. **Ejecuta**: `database/create_users_simple.sql`
2. **Reinicia** el servidor: `npm run dev`
3. **Ve a**: `http://localhost:3004/pmlinkadmin/`
4. **Login con**: `admin@pmlink.com` / `admin123456`

## 🔒 **Seguridad en producción:**

Para producción, necesitarías:
- Hash de passwords (bcrypt)
- Tokens JWT
- Sesiones más seguras
- Validación de roles más robusta

Pero para desarrollo y testing, este sistema es **perfecto y simple**.

## 🎉 **Resultado:**

**¡Ya no dependes de auth.users de Supabase!** Todo funciona con tu tabla `usuario` solamente.
