# syntax=docker/dockerfile:1

FROM node:24.16.0-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

ARG BUILD_CONFIGURATION=production
RUN npx ng build --configuration=${BUILD_CONFIGURATION}

FROM node:24.16.0-alpine AS production

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

COPY --from=build /app/dist/admin-panel-web ./dist/admin-panel-web

EXPOSE 4000

USER node

CMD ["node", "dist/admin-panel-web/server/server.mjs"]
