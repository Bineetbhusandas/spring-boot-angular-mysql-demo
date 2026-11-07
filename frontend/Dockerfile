# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# Stage 1 - build the Angular application
# Node 26 is the current LTS line and is supported by Angular 22.
# ---------------------------------------------------------------------------
FROM node:26-alpine AS build

WORKDIR /app

# Copy the lockfile first so `npm ci` is cached until dependencies change.
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .
RUN npm run build

# ---------------------------------------------------------------------------
# Stage 2 - serve the static files with nginx
# The unprivileged image runs as a non-root user and listens on port 8080.
# ---------------------------------------------------------------------------
FROM nginxinc/nginx-unprivileged:1.30-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html

EXPOSE 8080

# The image's entrypoint starts nginx in the foreground.
