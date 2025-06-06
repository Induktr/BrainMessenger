FROM node:20-alpine AS development

WORKDIR /usr/src/app

# Create non-root user and set ownership of the working directory
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser && \
    chown -R appuser:appgroup /usr/src/app

USER appuser

# Set NPM cache directory to a writable location
ENV NPM_CONFIG_CACHE=/usr/src/app/.npm-cache

# Copy package.json and package-lock.json (or yarn.lock) with correct ownership
COPY --chown=appuser:appgroup package*.json ./

# Install dependencies
RUN npm install --only=development

# Copy the rest of the application code with correct ownership
COPY --chown=appuser:appgroup . .

# Удаляем старый schema.gql из корневой директории, чтобы избежать конфликтов с разрешениями
RUN rm -f schema.gql

# Generate Prisma client (still needed for type generation, etc.)
RUN npx prisma generate

# Create the dist directory and set its ownership before building
RUN mkdir -p dist && chown appuser:appgroup dist

# Build the application (compile TypeScript in JavaScript)
RUN npm run build

# --- Production Stage (no changes needed here for now) ---
FROM node:20-alpine AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --only=production

COPY --from=development /usr/src/app/dist ./dist
COPY --from=development /usr/src/app/node_modules/.prisma ./node_modules/.prisma
COPY --from=development /usr/src/app/prisma/schema.prisma ./prisma/schema.prisma
# COPY --from=development /usr/src/app/schema.gql ./schema.gql
COPY --from=development /usr/src/app/dist/schema.gql ./dist/schema.gql

EXPOSE 4000

CMD ["node", "dist/main"]
