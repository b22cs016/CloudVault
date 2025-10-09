# Use any supported Node.js version you prefer
FROM node:22-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and install deps
COPY package*.json ./
RUN npm install --production

# Copy the rest of the app
COPY . .

# Expose the port App Engine uses
EXPOSE 8080

# Start the app
CMD ["npm", "start"]
