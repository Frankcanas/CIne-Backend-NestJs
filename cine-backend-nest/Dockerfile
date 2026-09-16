# ==========================================
# Etapa 1: Base con Node.js Alpine y herramientas nativas
# ==========================================
FROM node:20-alpine AS base

WORKDIR /usr/src/app

# Instalar herramientas para módulos nativos (como bcrypt en Alpine)
RUN apk add --no-cache python3 make g++

# Copiar manifiestos de paquetes
COPY package*.json ./

# ==========================================
# Etapa 2: Desarrollo (hot-reload con nest start --watch)
# ==========================================
FROM base AS development

# Instalar todas las dependencias (incluyendo devDependencies)
RUN npm install

# Copiar el código fuente completo
COPY . .

EXPOSE 3000

# Ejecución en modo desarrollo con recarga automática
CMD ["npm", "run", "start:dev"]

# ==========================================
# Etapa 3: Build para producción
# ==========================================
FROM base AS build

# Instalar todas las dependencias necesarias para compilar
RUN npm install

# Copiar el código fuente
COPY . .

# Compilar a TypeScript -> JavaScript en /dist
RUN npm run build

# Dejar únicamente las dependencias de producción
RUN npm prune --omit=dev

# ==========================================
# Etapa 4: Imagen final para Producción (liviana y segura)
# ==========================================
FROM node:20-alpine AS production

WORKDIR /usr/src/app

ENV NODE_ENV=production

# Usar usuario no-root para mejores prácticas de seguridad
USER node

# Copiar dependencias de producción y artefactos compilados
COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/dist ./dist
COPY --chown=node:node --from=build /usr/src/app/package*.json ./

EXPOSE 3000

# Comando para iniciar la aplicación en producción
CMD ["node", "dist/main.js"]
