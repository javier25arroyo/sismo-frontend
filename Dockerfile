# Etapa de construcción
FROM node:20-alpine AS build

# Instalar pnpm
RUN npm install -g pnpm@10.29.3

WORKDIR /app

# Copiar archivos de definición de paquetes
COPY package.json ./

# Instalar dependencias
RUN pnpm install

# Copiar el resto del código fuente
COPY . .

# Construir la aplicación para producción
RUN pnpm build

# Etapa de ejecución (Nginx)
FROM nginx:alpine

# Copiar los archivos construidos desde la etapa anterior
COPY --from=build /app/dist/sismo-frontend /usr/share/nginx/html

# Copiar una configuración personalizada de nginx para manejar rutas de Angular (opcional pero recomendado)
# RUN echo 'server { listen 80; location / { root /usr/share/nginx/html; index index.html; try_files $uri $uri/ /index.html; } }' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
