FROM node:latest
WORKDIR /app

ENV ONIONVALE_PRODUCTION=1
COPY . /app
RUN npm install

EXPOSE 80
CMD ["npm", "start"]
