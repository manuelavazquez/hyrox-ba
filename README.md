# Hyrox Buenos Aires · Buscador de dupla

App chica para encontrar compañero o compañera de Doubles para el próximo
Hyrox de Buenos Aires (20 y 21 de marzo de 2027). Perfil corto, matching
automático por división, nivel, ritmo, edad, objetivo y disponibilidad,
contacto directo por mail o Instagram.

## Cómo funciona el matching

Al cargar tu perfil, el sistema busca entre los atletas ya anotados a los que:

1. Son elegibles: misma división (Open Hombres/Mujeres, Pro Hombres/Mujeres
   entre sí, Mixto Hombre con Mixto Mujer).
2. Después ordena por puntaje: mismo nivel, ritmo de running parecido, misma
   franja de edad, mismo objetivo (diversión o competitivo), y cada franja
   horaria en común suman puntos.
3. Te muestra los 5 mejores matches con el contacto que cada uno eligió
   mostrar (mail, Instagram o ambos).

La lógica está en `lib/matching.ts`.

## Correrlo en local

```bash
npm install
npm run dev
```

En local, sin ninguna configuración extra, los datos se guardan en memoria
(se pierden si reiniciás el servidor). Suficiente para probar el flujo antes
de deployar.

## Deployar con GitHub + Railway

1. Subí esta carpeta a un repo nuevo en GitHub.
2. Andá a railway.app, iniciá sesión con tu cuenta de GitHub.
3. "New Project" → "Deploy from GitHub repo" → elegí el repo que acabás de
   crear. Railway detecta que es Next.js solo, no hace falta tocar nada.
4. Andá a la pestaña "Settings" del servicio → "Networking" → "Generate
   Domain". Ahí te da la URL pública (algo como
   `hyrox-ba-production.up.railway.app`), esa es tu API.
5. Andá a upstash.com, creá una cuenta gratis, creá una base de datos Redis
   nueva (el plan gratis alcanza de sobra para esto).
6. En el panel de esa base, copiá los valores `UPSTASH_REDIS_REST_URL` y
   `UPSTASH_REDIS_REST_TOKEN`.
7. Volvé a Railway, a tu servicio → "Variables" → agregá esas dos variables
   con esos nombres exactos y esos valores.
8. Railway va a redeployar solo apenas guardés las variables.

Sin esas dos variables cargadas, la app funciona pero los datos no
persisten entre visitas (se guardan solo en memoria), así que para el
lanzamiento real es importante ese paso.

## Conectar el formulario de Framer

En tu componente de Framer (`HyroxPartnerFlow.tsx`), reemplazá la constante
`API_URL` al principio del archivo por la URL que te dio Railway en el
paso 4, con `https://` adelante.

## Ideas para una v2

- Reemplazar el mailto por un formulario de contacto interno, así nadie
  expone su mail hasta aceptar.
- Panel simple para vos como organizadora, ver cuántos anotados hay por
  división antes de escribirle a Hyrox.
