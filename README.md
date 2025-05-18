### Overview

Welcome to the **Collaborative Text Editor** project! This repository contains the source code for a real-time collaborative text editing application, designed to enable seamless document editing for remote teams. The application leverages **SvelteKit** for a reactive frontend, **Express** with **Socket.IO** for real-time backend communication, and is containerized using **Docker** for consistent deployment. A robust CI/CD pipeline ensures automated testing, building, and deployment to a remote server.

### 🚀 CI/CD Pipeline

The CI/CD pipeline is defined in `.github/workflows/ci-cd.yml` and is triggered on every push to the `main` branch. It consists of three jobs: **test-lint**, **build-push**, and **deploy**, ensuring code quality, containerization, and deployment to the remote server.

#### Workflow Details

- **Trigger**:  
  - On push to the `main` branch.

- **Jobs**:
  1. **Test and Lint (`test-lint`)**:  
     - **Runs On**: `Ubuntu-latest`  
     - **Steps**:
       - Check out the code using `actions/checkout@v4`.
       - Set up Node.js (version 22) with `actions/setup-node@v4`.
       - Install `pnpm` globally.
       - Install dependencies with `pnpm install --frozen-lockfile`.
       - Run linters (`pnpm lint`) to ensure code quality.
       - Run tests (`pnpm test`) to validate functionality.

  2. **Build and Push Docker Image (`build-push`)**:  
     - **Runs On**: `Ubuntu-latest`  
     - **Dependencies**: Runs after `test-lint` succeeds.  
     - **Steps**:
       - Check out the code.
       - Log in to Docker Hub using `docker/login-action@v3` with credentials stored in GitHub Secrets (`DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`).
       - Build and push the Docker image using `docker/build-push-action@v6`, tagged as `j0cos/collaborative-text-editor:latest`.

  3. **Deploy to Remote Server (`deploy`)**:  
     - **Runs On**: `Ubuntu-latest`  
     - **Dependencies**: Runs after `build-push` succeeds.  
     - **Steps**:
       - Deploy to the remote server via SSH using `appleboy/ssh-action@v1.0.3`.
       - SSH credentials (`SSH_HOST`, `SSH_USERNAME`, `SSH_KEY`) are securely stored in GitHub Secrets.
       - Script:
         ```bash
         docker pull j0cos/collaborative-text-editor:latest
         docker-compose -f /root/project/compose.yaml down
         docker-compose -f /root/project/compose.yaml up -d

Application link and monitoring infrastructure details can be found in server branch.         


         
