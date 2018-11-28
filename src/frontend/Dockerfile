FROM node:9 as build-stage

# NODE_ENV: https://reactjsnews.com/how-to-make-your-react-apps-10x-faster
ENV NODE_ENV production
# GENERATE_SOURCEMAP https://github.com/facebook/create-react-app/issues/2763#issuecomment-322673465
ENV GENERATE_SOURCEMAP true

RUN yarn global add swagger@0.7.x -T
# RUN yarn global add serve@9.4.x -T

COPY yarn.lock package.json /frontend/
WORKDIR /frontend/
RUN yarn install

COPY . /frontend

RUN eval $(docker/reset_env.sh) \
    && yarn build



FROM nginx:1.15

RUN apt-get update && \
        apt-get --yes install file pdftk && \
        apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

ENV PUBLIC_URL http://localhost:3000
ENV REACT_APP_BACKEND_URL http://localhost:3001
ENV REACT_APP_KEYCLOAK Y
ENV REACT_APP_KC_CLIENT fridolean
ENV REACT_APP_KC_REALM linc
ENV REACT_APP_KC_URL https://linc.inf.tu-dresden.de/auth
ENV REACT_APP_SOCKETIO_URL http://localhost:3001
ENV REACT_APP_API_ROUTE /api/v1

COPY --from=build-stage /frontend/docker /frontend/docker
COPY --from=build-stage /frontend/build /frontend/build
WORKDIR /frontend
#COPY --from=build-stage /frontend/docker/ /docker/

# Copy the default nginx.conf provided by tiangolo/node-frontend
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf


EXPOSE 3000

ENTRYPOINT ["/bin/bash", "/frontend/docker/entrypoint.sh"]
