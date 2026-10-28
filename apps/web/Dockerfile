FROM node:24.22.1-bookworm-slim

WORKDIR /app

RUN npm install --global npm@12.2.1

COPY packages/browser-sdk/ /app/packages/browser-sdk/

WORKDIR /app/packages/browser-sdk

RUN npm ci \
    && npm run build

COPY apps/web/ /app/apps/web/

WORKDIR /app/apps/web

RUN npm ci

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

ARG NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
ARG NEXT_PUBLIC_ANALYTICS_WRITE_KEY=local-demo-write-key

ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
ENV NEXT_PUBLIC_ANALYTICS_WRITE_KEY=${NEXT_PUBLIC_ANALYTICS_WRITE_KEY}

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start", "--", "--hostname", "0.0.0.0"]