FROM node:20-slim AS development

# Create the working directory and set ownership
RUN mkdir -p /app/frontend && \
    addgroup --system appgroup && adduser --system --ingroup appgroup appuser && \
    chown -R appuser:appgroup /app/frontend

WORKDIR /app/frontend

USER appuser

# Set NPM cache directory to a writable location
ENV NPM_CONFIG_CACHE=/app/frontend/.npm-cache
# Set Cypress cache directory to a writable location
ENV CYPRESS_CACHE_FOLDER=/app/frontend/.cypress-cache
ENV NEXT_PUBLIC_RUNNING_IN_DOCKER=true

# Copy package.json and package-lock.json first to leverage Docker cache
COPY --chown=appuser:appgroup frontend/package.json ./
COPY --chown=appuser:appgroup frontend/package-lock.json ./

RUN npm install

# Copy the rest of the frontend application
COPY --chown=appuser:appgroup frontend/ ./

EXPOSE 3000

CMD ["npm", "run", "dev"]
