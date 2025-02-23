# Frontend Dockerfile
FROM node:alpine

WORKDIR /src

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps

# Copy the entire app source code
COPY . .

# Build the Next.js app
RUN npm run build

# Expose the port Next.js runs on
EXPOSE 3000

# Start the production server
CMD ["npm", "start"]
