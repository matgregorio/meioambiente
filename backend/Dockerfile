FROM node:20-alpine
WORKDIR /usr/src/app
COPY package.json package-lock.json* ./
RUN npm install --production
COPY . .
RUN mkdir -p uploads
EXPOSE 8080
CMD ["npm", "run", "start"]
