FROM node:16.13.1
# Define work drirectory
WORKDIR /app
# Copy package.json
COPY package.json /app
COPY package-lock.json /app
# Install dependencies in production mode only
RUN npm ci --only=production && npm cache clean --force
# Copy app files
COPY . /app

EXPOSE 8081

# Command to execute
CMD node index.js
