# ---- Build stage ----
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Vite inlines VITE_* env vars into the client bundle at BUILD time (they end
# up in the shipped JS regardless of how they're supplied — same as any
# static-hosting provider's build step). So they must be passed as build args
# here, not left as plain container-runtime env vars, which would have no
# effect after the image is built.
ARG VITE_GEMINI_API_KEY
ARG VITE_OPENAI_API_KEY
ENV VITE_GEMINI_API_KEY=${VITE_GEMINI_API_KEY}
ENV VITE_OPENAI_API_KEY=${VITE_OPENAI_API_KEY}

RUN npm run build

# ---- Serve stage ----
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
