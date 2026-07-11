# syntax=docker/dockerfile:1.7

FROM node:20-alpine AS portfolio-build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG PORTFOLIO_VITE_API_BASE_URL=/api
ARG PORTFOLIO_VITE_SITE_URL=https://adriaholiday.hu
ARG PORTFOLIO_VITE_ANALYTICS_ENABLED=true
ARG PORTFOLIO_VITE_ANALYTICS_DEBUG=false
ARG PORTFOLIO_VITE_ANALYTICS_SESSION_COOKIE=ah_session_id
ARG PORTFOLIO_VITE_META_PIXEL_ENABLED=false
ARG PORTFOLIO_VITE_META_PIXEL_ID=
ENV VITE_API_BASE_URL=${PORTFOLIO_VITE_API_BASE_URL}
ENV VITE_SITE_URL=${PORTFOLIO_VITE_SITE_URL}
ENV VITE_ANALYTICS_ENABLED=${PORTFOLIO_VITE_ANALYTICS_ENABLED}
ENV VITE_ANALYTICS_DEBUG=${PORTFOLIO_VITE_ANALYTICS_DEBUG}
ENV VITE_ANALYTICS_SESSION_COOKIE=${PORTFOLIO_VITE_ANALYTICS_SESSION_COOKIE}
ENV VITE_META_PIXEL_ENABLED=${PORTFOLIO_VITE_META_PIXEL_ENABLED}
ENV VITE_META_PIXEL_ID=${PORTFOLIO_VITE_META_PIXEL_ID}
RUN npm run build

FROM node:20-alpine AS admin-build
WORKDIR /app
COPY adria-admin/package.json adria-admin/package-lock.json ./adria-admin/
RUN npm ci --prefix ./adria-admin
COPY adria-admin ./adria-admin
ARG ADMIN_VITE_API_BASE_URL=/api/admin
ENV VITE_API_BASE_URL=${ADMIN_VITE_API_BASE_URL}
RUN npm run build --prefix ./adria-admin

FROM nginx:1.29-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=portfolio-build /app/backend/public /var/www/backend/public
# adria-admin's vite.config.ts outDir resolves to backend/public/admin (not
# adria-admin/dist), so that's what actually exists after the build above.
COPY --from=admin-build /app/backend/public/admin /var/www/backend/public/admin
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD wget -qO- http://127.0.0.1/health >/dev/null || exit 1
CMD ["nginx", "-g", "daemon off;"]
