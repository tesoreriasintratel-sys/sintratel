# SINTRATEL - Panel Administrativo

Panel de gestión para el Sindicato de Trabajadores de Telecomunicaciones de Colombia.

## Tecnologías

- **Next.js 14** (App Router)
- **Supabase** (base de datos PostgreSQL)
- **Tailwind CSS** + shadcn/ui
- **Resend** (envío de correos desde formulario de contacto)

## Variables de entorno

Copia `.env.example` a `.env.local` y completa los valores:

```bash
cp .env.example .env.local
```

| Variable | Descripción |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto en Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anon de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave service_role de Supabase (solo servidor) |
| `RESEND_API_KEY` | API Key de Resend para envío de correos |

### Obtener RESEND_API_KEY (gratis)

1. Regístrate en [resend.com](https://resend.com) (plan gratuito: 3 000 correos/mes)
2. Ve a **API Keys → Create API Key**
3. Copia la clave y agrégala como `RESEND_API_KEY` en:
   - `.env.local` para desarrollo local
   - Vercel → Project Settings → Environment Variables para producción

## Desarrollo local

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## Deploy en Vercel

1. Conecta el repositorio en [vercel.com](https://vercel.com)
2. Agrega las variables de entorno en **Project Settings → Environment Variables**
3. Haz push a `main` para desplegar automáticamente

## Acceso al panel admin

Ruta: `/admin/login`

El super admin inicial se configura con las variables `ADMIN_EMAIL` y `ADMIN_PASSWORD` (por defecto `tesoreriasintratel@gmail.com` / `Panel2026!`).
