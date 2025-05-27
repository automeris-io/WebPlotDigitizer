# syntax=docker/dockerfile:1
ARG NODE_VERSION=23.10.0

FROM node:${NODE_VERSION}-alpine

# Set working directory for all build stages.
WORKDIR /usr/src/app

RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev

RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci

COPY . .

RUN apk update && apk add python3 py3-jinja2 py3-babel

# Run the build script.
RUN npm run build

# Use production node environment by default.
ENV NODE_ENV development

# Run the application as a non-root user.
# USER node

# Expose the port that the application listens on.
EXPOSE 8080

# Run the application.
CMD npm start
