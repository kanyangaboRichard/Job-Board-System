#light image node:18-alpine
FROM node:18-alpine

#a dir
WORKDIR /app

#copy package*.json ./
COPY package*.json ./
RUN npm install

#copy all files
COPY . .
#EXPOSE port
EXPOSE 3005

#start command
CMD ["npm", "run", "dev"]