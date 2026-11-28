FROM mcr.microsoft.com/playwright:v1.64.1-noble@sha256:47b510dd9230bf0b9bfc9b20102241e577ea7a99334ab4c3ca19f19770e9b8ea

ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0

# Node.js 25 and later no longer ship Corepack, so install it from its own
# lockfile, which pins the version and its integrity hash. Its bin directory
# provides the pnpm shim.
COPY docker/corepack/package.json docker/corepack/package-lock.json /opt/corepack/
RUN npm ci --prefix /opt/corepack --ignore-scripts --no-audit --no-fund
ENV PATH="/opt/corepack/node_modules/.bin:$PATH"

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --config.updateNotifier=false
