# Usar una imagen base de Node.js 20.10.0
FROM node:20.10.0

# Crear un directorio para la aplicación
WORKDIR /app

# Copiar los archivos del paquete.json y el paquete-lock.json
COPY package*.json ./

# Instalar dependencias adicionales
RUN apt-get update && \
    apt-get install -y gconf-service libgbm-dev libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 \
                       libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 \
                       libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 \
                       libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 \
                       libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release \
                       xdg-utils wget
# Instalar las dependencias
RUN npm install

# Copiar el resto de los archivos de la aplicación
COPY . .
# Exponer el puerto que usa la aplicación
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["node", "server"]
