FROM node:20-alpine

RUN mkdir -p /var/www/html
WORKDIR /var/www/html
COPY . .
RUN npm install
RUN npm run build

EXPOSE 8000 

CMD ["npm", "start"]