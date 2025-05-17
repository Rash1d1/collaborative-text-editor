# Project Setup Guide

You should be able to access the service with these URL:

- Website: http://localhost:4713

## Docker (Recommended)

This command will launch the services from [`compose.yaml`](`/compose.yaml`):

```bash
docker compose up --build
```

## Manual Setup (Fallback)

### Requirements

- [pnpm](https://github.com/pnpm/pnpm) (Node.js package manager)

#### Developing

Once you've created a project and installed dependencies  with `pnpm install`,
start a development server:

```bash

pnpm run dev

# or start the server and open the app in a new browser tab
pnpm run dev -- --open
```

#### Building

To create a production version of your app:

```bash
pnpm run build
```

You can preview the production build with `pnpm run preview`.

> To deploy your app, you may need to install an
> [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
