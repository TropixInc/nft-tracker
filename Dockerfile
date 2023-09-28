FROM bitnami/node:16.13.2 as builder

RUN npm i -g npm@">=8.1.2 <9.0.0"
RUN npm i -g zx

# Set node environment
ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}
ARG GITHUB_TOKEN
ENV GITHUB_TOKEN=${GITHUB_TOKEN}

# Set working directory
WORKDIR /app

COPY package*.json ./
COPY scripts ./scripts

# Check required building variables
RUN ./scripts/check-build-env.mjs

# Install dependencies
RUN npm ci --ignore-scripts

COPY . .

# Run typescript compiler
RUN npm run build

# Remove node modules folder to prevent caching
RUN rm -rf node_modules

# Install only production dependencies
RUN npm ci --only=production --omit=dev --ignore-scripts
RUN npm cache verify && npm cache clean --force
RUN npm uninstall bcrypt && npm install bcrypt@5.1.0 --save

# --------------> The production image
FROM node:16.13.2-alpine3.14 as production
# Set node environment
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

RUN mkdir /app && chown node:node /app
# Set non root user
USER node

# Set working directory
WORKDIR /app

# Add package.json to WORKDIR
COPY package*.json ./

COPY newrelic.js ./

# Application port
# default to port 3000 for node, and 9229 and 9230 (tests) for debug
ARG PORT=3000
ENV PORT $PORT
EXPOSE $PORT 9229 9230

# EXPOSE 9229
COPY --from=builder --chown=node:node ./app/dist ./dist
COPY --from=builder --chown=node:node ./app/node_modules ./node_modules

ENTRYPOINT ["docker-entrypoint.sh"]

CMD ["npm", "run", "start:prod"]
