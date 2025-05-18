### 📂 Branch Purpose

This branch serves as the central repository for configuration files used by the Collaborative Text Editor project on the remote server. Key configurations include:

- **Docker Compose (`compose.yaml`)**: Orchestrates the application and monitoring services (e.g., Prometheus, Grafana, Loki).  
- **Prometheus Configuration (`prometheus.yml`)**: Defines scrape targets for metrics collection.  
- **Grafana Dashboards**: Pre-configured dashboards for visualizing application and server metrics.  

These files are deployed to `/root/project` on the remote server (`217.19.4.30`) to maintain consistency across deployments.

---
### 🚀 Deployment Workflow

On every push to this branch, a GitHub Actions workflow is triggered to automate the deployment of configuration files to the remote server. The workflow performs the following steps:

1. **Checkout Code**: Clones the latest version of this branch.  
2. **Copy Files via SSH**: Uses `appleboy/ssh-action` to securely copy updated configuration files to `/root/project` on `217.19.4.30`.  
   - SSH credentials are securely stored in GitHub Secrets (`SSH_HOST`, `SSH_USERNAME`, `SSH_KEY`).  
3. **Restart Services**: Restarts affected services (e.g., via `docker-compose up -d`) to apply the new configurations without downtime.  

This automation ensures that configuration updates are seamlessly applied to the production environment, maintaining the application’s stability and monitoring capabilities.

---
### 🔗 Relevant Links

Access the deployed application, monitoring dashboards, and Docker registry using the links below:

- **Running Application**: [http://217.19.4.30:4173](http://217.19.4.30:4173)  
  - The Collaborative Text Editor, accessible for real-time document editing.  
- **Prometheus Targets**: [http://217.19.4.30:9090/targets?search=](http://217.19.4.30:9090/targets?search=)  
  - Displays the status of scrape targets (e.g., `app`, `node-exporter`) for metrics collection.  
- **Grafana Dashboards**: [http://217.19.4.30:3000/dashboards](http://217.19.4.30:3000/dashboards)  
  - Visualize application metrics and logs.  
  - **Credentials**: Username: `admin`, Password: `admin`.  
- **Docker Registry**: [https://hub.docker.com/repository/docker/j0cos/collaborative-text-editor](https://hub.docker.com/repository/docker/j0cos/collaborative-text-editor)  
  - Hosts the Docker image (`j0cos/collaborative-text-editor:latest`) used for deployment.  

---
