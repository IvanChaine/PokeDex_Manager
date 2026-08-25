# PokéDex Manager

Aplicación web full-stack para gestionar una colección personal de Pokémon. Permite registrarse, buscar Pokémon con la PokéAPI (por nombre exacto, coincidencia parcial o autocompletado), guardarlos en una colección propia con apodo, y tambien identificar un Pokémon a partir de una foto (carta TCG, sprite, dibujo) usando un modelo multimodal de IA.

## Features

- Registro e inicio de sesión de usuario con JWT.
- Rutas protegidas: solo un usuario autenticado accede a su colección.
- Búsqueda de Pokémon en PokéAPI por nombre exacto o parcial (ej. `art` devuelve Articuno y Articuno de Galar).
- Autocompletado en vivo mientras se escribe.
- Colección personal: agregar, listar y eliminar Pokémon, con apodo opcional por entrada.
- Identificación de Pokémon a partir de una imagen subida por el usuario.
- Interfaz responsive (mobile, tablet, desktop) con animaciones en la búsqueda (Framer Motion).

## Tecnologías

### Backend

- Node.js
- TypeScript
- Express
- Prisma ORM 7 (con adapter `@prisma/adapter-better-sqlite3`)
- SQLite
- JWT (`jsonwebtoken`) + `bcryptjs` para autenticación
- Multer para manejo de uploads de imagen
- `@google/genai` (Gemini API)

### Frontend

- React + Vite
- TypeScript
- React Router 7 (modo declarativo)
- Tailwind CSS
- Framer Motion
- Axios

### Servicios externos

- [PokéAPI](https://pokeapi.co/) — datos, sprites y tipos de cada Pokémon.
- [Google Gemini API](https://ai.google.dev/) — identificación de Pokémon a partir de imágenes.

## Estructura del repositorio

```
pokedex-manager/
├── client/                        Frontend (React + Vite)
│   └── src/
│       ├── pages/                 Login, Register, Home, Safari
│       ├── components/            Navbar, ProtectedRoute
│       ├── context/                AuthContext (estado de sesión)
│       ├── hooks/                  useAuth
│       └── services/                Clientes de API: backend, PokéAPI, identificación por imagen
└── server/                        Backend (Node + Express)
    ├── prisma/
    │   ├── migrations/             Migraciones de la base de datos
    │   └── schema.prisma            Modelos User y PokemonEntry
    └── src/
        ├── controllers/            auth, collection, identify
        ├── routes/                  Definición de endpoints
        ├── middleware/              Autenticación JWT
        ├── services/                 Cliente de Prisma, cliente de Gemini
        └── db/
```

## Requisitos previos

- Node.js 18 o superior
- pnpm (`npm install -g pnpm` si no lo tienes)

## Instalación y ejecución local

El proyecto está dividido en dos carpetas independientes, `client/` y `server/`, que deben correr **simultáneamente** en dos terminales distintas.

### 1. Clonar el repositorio

```bash
git clone https://github.com/IvanChaine/PokeDex_Manager.git
cd PokeDex_Manager/pokedex-manager
```

### 2. Backend

```bash
cd server
pnpm install
```

Crea un archivo `.env` dentro de `server/`:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="tu-cadena-secreta-aqui"
GEMINI_API_KEY="tu-api-key-de-gemini-aqui"
PORT=3000
```

> `JWT_SECRET` puede ser cualquier cadena larga y aleatoria. Generar una:
> `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

Aplica las migraciones (crea el archivo SQLite local):

```bash
pnpm prisma migrate dev
```

Levanta el servidor:

```bash
pnpm dev
```

La API queda disponible en `http://localhost:3000`.

### 3. Frontend

En una **segunda terminal**:

```bash
cd client
pnpm install
pnpm dev
```

La aplicación queda disponible en `http://localhost:5173` (Vite confirma la URL exacta en consola).

### 4. Usar la aplicación

Abre `http://localhost:5173`, regístrate con cualquier email/contraseña, y explora la colección.

## Variables de entorno

| Variable         | Ubicación     | Requerida           | Descripción                               |
| ---------------- | ------------- | ------------------- | ----------------------------------------- |
| `DATABASE_URL`   | `server/.env` | Sí                  | Ruta del archivo SQLite local             |
| `JWT_SECRET`     | `server/.env` | Sí                  | Cadena secreta para firmar los tokens JWT |
| `GEMINI_API_KEY` | `server/.env` | Solo para el bonus  | API key de Google Gemini                  |
| `PORT`           | `server/.env` | No (default `3000`) | Puerto del backend                        |

## Autenticación

El registro requiere un email y una contraseña (mínimo 6 caracteres). Al iniciar sesión, la API devuelve un JWT que el frontend guarda en `localStorage` y adjunta automáticamente a cada request mediante un interceptor de Axios.

Todas las rutas de colección e identificación por imagen requieren:

```
Authorization: Bearer <token>
```

Las páginas `Home` (`/`) y `Safari` (`/safari`) están además protegidas en el frontend mediante un componente `ProtectedRoute` de React Router.

## Base de datos

SQLite almacena únicamente la información propia de cada usuario. Los datos generales de cada especie (nombre, sprites, tipos) se obtienen en vivo desde PokéAPI, no se duplican en la base local.

### Tabla `User`

| Campo       | Tipo       | Descripción                    |
| ----------- | ---------- | ------------------------------ |
| `id`        | `String`   | Identificador único (cuid)     |
| `email`     | `String`   | Email único del usuario        |
| `password`  | `String`   | Contraseña hasheada con bcrypt |
| `createdAt` | `DateTime` | Fecha de registro              |

### Tabla `PokemonEntry`

| Campo       | Tipo       | Descripción                           |
| ----------- | ---------- | ------------------------------------- |
| `id`        | `String`   | Identificador único (cuid)            |
| `pokemonId` | `Int`      | ID del Pokémon en PokéAPI             |
| `nickname`  | `String?`  | Apodo opcional puesto por el usuario  |
| `addedAt`   | `DateTime` | Fecha en que se agregó a la colección |
| `userId`    | `String`   | Usuario dueño de la entrada           |

```
User (1) ──────────< (N) PokemonEntry
```

## Endpoints principales

| Método   | Ruta                  | Protegida | Descripción                                  |
| -------- | --------------------- | --------- | -------------------------------------------- |
| `POST`   | `/api/auth/register`  | No        | Registra un usuario nuevo                    |
| `POST`   | `/api/auth/login`     | No        | Inicia sesión, devuelve un JWT               |
| `GET`    | `/api/collection`     | Sí        | Lista la colección del usuario autenticado   |
| `POST`   | `/api/collection`     | Sí        | Agrega un Pokémon a la colección             |
| `DELETE` | `/api/collection/:id` | Sí        | Elimina una entrada de la colección          |
| `POST`   | `/api/identify`       | Sí        | Identifica un Pokémon a partir de una imagen |

Ejemplo de registro:

```json
{
  "email": "trainer@example.com",
  "password": "pokemon123"
}
```

Ejemplo de respuesta al agregar a la colección:

```json
{
  "id": "clx1a2b3c4d5",
  "pokemonId": 25,
  "nickname": "Sparky",
  "addedAt": "2026-08-24T10:00:00.000Z",
  "userId": "clx0z9y8x7w6"
}
```

`POST /api/identify` usa `multipart/form-data` con un campo llamado `image`.

## Identificación de Pokémon por foto

En la pestaña **Safari**, además de la búsqueda por texto, se puede subir una imagen. El flujo es:

1. El frontend arma un `FormData` con la imagen y lo envía a `POST /api/identify`.
2. El backend recibe el archivo en memoria (Multer), lo codifica en base64, y lo envía al modelo `gemini-3.6-flash` con un prompt que pide el nombre del Pokémon en el formato exacto de PokéAPI.
3. El nombre identificado se reutiliza automáticamente en el mismo flujo de búsqueda por texto ya existente, mostrando la tarjeta con imagen oficial, tipos, campo de apodo, y botón de agregar.

## Reglas principales

- Un email no puede registrarse dos veces (`409 Conflict`).
- Las contraseñas nunca se almacenan ni se devuelven en texto plano.
- Cada entrada de la colección pertenece a un único usuario; un usuario no puede ver ni eliminar entradas de otro (`403 Forbidden` si lo intenta).
- Todas las rutas de colección e identificación requieren un JWT válido (`401 Unauthorized` si falta o expiró).
- Una imagen sin un Pokémon identificable por Gemini no agrega nada a la colección; el usuario puede reintentar con otra foto o buscar por nombre.
