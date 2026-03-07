# Lightweight Node image
FROM node:18-alpine

# Install build tools for sqlite3
RUN apk add --no-cache python3 make g++

WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install --production

# Copy game files
COPY . .

# OpenShift standard for writable volumes
RUN chgrp -R 0 /usr/src/app && chmod -R g=u /usr/src/app

EXPOSE 8080

# More efficient than 'npm start'
CMD [ "node", "server.js" ]