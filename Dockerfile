FROM node:18-alpine

WORKDIR /usr/saint-streamer/src

COPY package.json .

RUN npm install\
    && npm install typescript -g

COPY . .

RUN tsc

CMD ["node", "./dist/index.js"]
