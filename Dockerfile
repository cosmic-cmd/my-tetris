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

# OpenShift permissions fix
RUN chmod -R 775 /usr/src/app

EXPOSE 8080

CMD [ "npm", "start" ]