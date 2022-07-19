FROM node:lts-alpine

WORKDIR /app
COPY . .

RUN npm install --force

EXPOSE 3000

CMD ["npm", "start"]