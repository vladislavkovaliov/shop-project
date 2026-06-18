FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npx ng build --configuration production

FROM node:22-alpine
WORKDIR /app
COPY --from=build /app/dist/shop-ui-angular ./dist
EXPOSE 4000
CMD ["node", "dist/server/server.mjs"]
