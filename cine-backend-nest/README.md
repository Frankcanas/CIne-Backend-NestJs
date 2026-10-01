# Riwi Cine - Backend NestJS

Este es el backend para el sistema **Riwi Cine**, desarrollado utilizando **NestJS**, el framework progresivo de Node.js. Provee una API robusta para la gestión de usuarios, membresías, películas (integración con TMDB) y más.

## 🚀 Características Principales

*   **Autenticación y Autorización**: Sistema seguro basado en JWT, incluyendo refresh tokens, recuperación de contraseñas y verificación de cuentas.
*   **Gestión de Usuarios**: Administración de perfiles, roles y estados de membresía.
*   **Integración con TMDB**: Consumo de la API de *The Movie Database* para obtener catálogos externos, estrenos, películas populares y búsquedas.
*   **Gestión de Películas y Cartelera**: Administración del catálogo local de películas y recomendaciones.
*   **Membresías**: Creación, consulta y beneficios del sistema de suscripciones del cine.
*   **Correos y Marketing**: Envío de correos transaccionales y campañas de marketing promocionales (integración con NodeMailer/SMTP).
*   **Ubicaciones**: Gestión de países, ciudades y ubicaciones preferidas de los usuarios.
*   **Documentación Interactiva**: Documentación de la API generada automáticamente con **Swagger** / OpenAPI.
*   **Dockerizado**: Configuración lista para entornos de desarrollo y producción usando Docker y Docker Compose.

## 🛠️ Tecnologías Utilizadas

*   **Framework**: [NestJS](https://nestjs.com/) v12
*   **Base de Datos**: PostgreSQL
*   **Autenticación**: JWT (JSON Web Tokens), bcrypt
*   **Validación**: class-validator, class-transformer
*   **Mailing**: @nestjs-modules/mailer, Nodemailer
*   **Documentación**: Swagger (@nestjs/swagger)
*   **Testing**: Vitest (Unitario y E2E)
*   **Linting & Formateo**: Oxlint, Prettier
*   **Infraestructura**: Docker, Docker Compose

## 📋 Requisitos Previos

*   [Node.js](https://nodejs.org/) (v20 o superior recomendado)
*   [Docker](https://www.docker.com/) y [Docker Compose](https://docs.docker.com/compose/) (Recomendado para levantar la base de datos fácilmente)
*   Una clave de API de [TMDB (The Movie Database)](https://developer.themoviedb.org/docs)
*   Una cuenta de correo para envío SMTP (ej. Gmail con contraseña de aplicación)

## ⚙️ Configuración del Entorno

1.  Clona este repositorio:
    ```bash
    git clone <URL_DEL_REPOSITORIO>
    cd CIne-Backend-NestJs/cine-backend-nest
    ```

2.  Copia el archivo `.env.example` y renómbralo a `.env`:
    ```bash
    cp .env.example .env
    ```

3.  Ajusta las variables de entorno en el archivo `.env` según tu configuración local:
    ```env
    # Base de Datos
    DB_CONTAINER_NAME=riwi-cine-db
    POSTGRES_USER=nodejs
    POSTGRES_PASSWORD=123456
    POSTGRES_DB=postgres
    POSTGRES_PORT=5432
    POSTGRES_HOST=localhost # Usar 'localhost' si ejecutas NestJS local y la BD en Docker
    DATABASE_URL=postgres://nodejs:123456@localhost:5432/postgres

    # JWT
    JWT_SECRET=tu_secreto_aqui
    JWT_EXPIRES_IN=30m

    # TMDB API
    TMDB_BASE_URL=https://api.themoviedb.org/3
    TMDB_API_KEY=tu_api_key_de_tmdb
    TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p/w500

    # SMTP (Correos)
    SMTP_HOST=smtp.gmail.com
    SMTP_PORT=465
    SMTP_USER=tu_correo@gmail.com
    SMTP_PASS=tu_password_de_aplicacion
    SMTP_FROM=tu_correo@gmail.com
    ```

## 🚀 Instalación y Ejecución

El proyecto está dentro de la carpeta `cine-backend-nest`, asegúrate de estar allí antes de ejecutar los comandos:

```bash
cd cine-backend-nest
```

### Opción 1: Desarrollo Local (Node.js)

1.  Instala las dependencias:
    ```bash
    npm install
    ```

2.  Levanta únicamente la base de datos con Docker:
    ```bash
    npm run docker:dev
    ```

3.  Ejecuta la aplicación en modo desarrollo:
    ```bash
    npm run start:dev
    ```

### Opción 2: Todo con Docker (Producción / Completo)

Si deseas levantar tanto la base de datos como la aplicación usando Docker de forma simultánea:

```bash
# Entorno de desarrollo
docker compose up -d

# Entorno de producción (usando docker-compose.prod.yml)
npm run docker:prod
```

## 📖 Documentación de la API (Swagger)

Una vez que la aplicación esté en ejecución, puedes acceder a la documentación interactiva de la API (Swagger UI) configurada automáticamente en:

*   **Swagger UI:** [http://localhost:3000/api/docs](http://localhost:3000/api/docs)
*   **OpenAPI JSON:** [http://localhost:3000/api/docs-json](http://localhost:3000/api/docs-json)

## 🧪 Pruebas (Testing)

El proyecto utiliza **Vitest** para las pruebas, configurado para testing unitario y de extremo a extremo (E2E).

```bash
# Ejecutar pruebas unitarias
npm run test

# Ejecutar pruebas unitarias en modo watch
npm run test:watch

# Ver cobertura de código
npm run test:cov

# Ejecutar pruebas E2E
npm run test:e2e
```

## 🧹 Linting y Formateo

Para mantener la calidad y consistencia del código:

```bash
# Formatear el código con Prettier
npm run format

# Ejecutar el linter (Oxlint)
npm run lint
```

## 📝 Estructura del Proyecto

El código fuente principal se encuentra en `cine-backend-nest/src/` y está organizado en módulos siguiendo las mejores prácticas de NestJS:

*   `auth/` & `authentication/`: Lógica de autenticación, JWT y validaciones de acceso.
*   `user/`: Gestión de usuarios, perfiles y estados de sistema.
*   `movie/`: Interacción con The Movie Database (TMDB) y gestión de la cartelera de películas local.
*   `location/`: Gestión de países y ciudades.
*   `email/`: Servicio de notificaciones por correo electrónico transaccionales.
*   `main.ts`: Punto de entrada de la aplicación y configuración de Swagger.

---
