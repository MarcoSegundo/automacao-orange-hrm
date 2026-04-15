# syntax=docker/dockerfile:1.7
FROM mcr.microsoft.com/playwright:v1.59.1-noble

WORKDIR /app
ENV CI=true \
	NODE_ENV=development

COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --prefer-offline

COPY . .

RUN npm run lint
RUN npm run build

CMD ["npm", "run", "test:smoke"]
