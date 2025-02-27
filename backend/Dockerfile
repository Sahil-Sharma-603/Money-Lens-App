# Backend Dockerfile
FROM node:18

WORKDIR /app

COPY package.json ./
RUN rm -rf node_modules/
RUN npm install

COPY . .

EXPOSE 5001
CMD ["npm", "start"]
