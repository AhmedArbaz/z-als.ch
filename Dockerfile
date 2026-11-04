# z-als.ch: static pages plus a dependency-free Node server that
# creates Stripe Checkout sessions. public/ is compiled from design/ by
# `npm run build` and committed, so there is no build step here.
#
# Runtime env (Dokploy panel): STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, SITE_URL, RESEND_API_KEY,
# NOTIFY_TO (default info@z-als.ch), MAPBOX_TOKEN. Never bake a secret
# into the image.
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=3000
COPY --chown=node:node server.mjs ./
COPY --chown=node:node public/ ./public/
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:3000/ || exit 1
CMD ["node", "server.mjs"]
