FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@latest --activate

# Build stage
FROM base AS build
WORKDIR /app/

# Set environment variables
ENV NODE_ENV=production

# Copy package files first for better layer caching
COPY pnpm-lock.yaml package.json ./

# Install production-only dependencies
RUN pnpm install --frozen-lockfile --prod=false

# Copy source files
COPY ./ ./

# Run svelte-kit sync to generate .svelte-kit/tsconfig.json
RUN pnpm prepare

# Build application
RUN pnpm build

CMD ["pnpm", "preview"]