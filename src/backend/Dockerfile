FROM node:9

ENV NODE_ENV production

RUN apt-get update && \
        apt-get --yes install pdftk && \
        apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*
#RUN npm install -g swagger@0.7.x
#RUN npm install -g serve@6.4.e

# install frontend + backend
#COPY frontend/package-lock.json /app/frontend/package-lock.json
#COPY backend/package-lock.json /app/backend/package-lock.json
COPY package-lock.json package.json /app/backend/
RUN cd /app/backend && npm install

# Backend

COPY . /app/backend

ENV MONGODB_URL localhost:27017/loginapp
ENV PORT 3001
ENV CORS_DOMAIN https://fridolean.inf.tu-dresden.de
ENV SECRET must_be_set
ENV KEYCLOAK_URL https://linc.inf.tu-dresden.de
# NODE_ENV: https://reactjsnews.com/how-to-make-your-react-apps-10x-faster

WORKDIR /app/backend
EXPOSE 3001
CMD ["./node_modules/.bin/babel-node","server.js"]
