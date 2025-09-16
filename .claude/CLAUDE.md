# GitLab CI/CD Documentation for Grafana Project

## Repository Information
- **GitLab Remote**: `nexiona` → `git@gitlab.com:nexiona/codebase/miimetiq-x/grafana.git`
- **Project Path**: `nexiona/codebase/miimetiq-x/grafana`
- **Default Branch**: `nexiona-customizations`

## GitLab CLI (`glab`) Configuration

### Authentication
The GitLab CLI is authenticated with a personal access token stored in `~/.config/glab-cli/config.yml`.
- **User**: oriol.rius
- **Host**: gitlab.com

### Common `glab` Commands for CI/CD

#### Pipeline Management
```bash
# List pipelines
glab ci list --per-page 5

# Check pipeline status for a branch
glab ci status --branch nexiona-customizations

# Trigger a new pipeline
glab ci run --branch nexiona-customizations

# View pipeline details (use pipeline ID)
glab ci view <pipeline-id>
```

#### Job Inspection
```bash
# Get jobs from a pipeline
glab api /projects/nexiona%2Fcodebase%2Fmiimetiq-x%2Fgrafana/pipelines/<pipeline-id>/jobs

# Get job logs/trace
glab api /projects/nexiona%2Fcodebase%2Fmiimetiq-x%2Fgrafana/jobs/<job-id>/trace

# Get specific job ID from pipeline
glab api /projects/nexiona%2Fcodebase%2Fmiimetiq-x%2Fgrafana/pipelines/<pipeline-id>/jobs | jq -r '.[] | select(.name=="build-grafana") | .id'
```

## GitLab Runner Configuration

### Runner Details
- **Name**: docker-runner
- **ID**: 49822926
- **Tags**: `wsl2`
- **Executor**: Docker
- **Platform**: WSL2 on Windows 11

### Known Issues & Solutions

#### 1. Docker Socket Mounting
**Issue**: The runner uses Docker executor but initially couldn't access Docker daemon.

**Attempted Solutions**:
1. **Docker socket mount** (didn't work): Runner configuration would need:
   ```toml
   [[runners]]
     [runners.docker]
       volumes = ["/var/run/docker.sock:/var/run/docker.sock", "/cache"]
       privileged = true
   ```

2. **Docker-in-Docker** (WORKING): Using DinD service with TLS disabled:
   ```yaml
   services:
     - name: docker:27-dind
       alias: docker
       command: ["--tls=false"]

   variables:
     DOCKER_HOST: tcp://docker:2375
     DOCKER_TLS_CERTDIR: ""
   ```

## Build Process

### Grafana Docker Build
The project uses `make build-docker-full` to build the complete Grafana Docker image.

#### Build Requirements
- **Go**: 1.24.4+ (specified in `go.work`)
- **Node.js**: For frontend build
- **Docker**: For containerization
- **Dependencies**: make, git, bash, gcc, g++, musl-dev, nodejs, npm, go, yarn

#### Common Build Issues

1. **Go Version Mismatch**
   - **Error**: `go.work lists go 1.24.3` but modules require `go >= 1.24.4`
   - **Fix**: Update `go.work` first line to `go 1.24.4`

2. **Missing `pkg/apis/folder`**
   - **Error**: Docker build fails with "pkg/apis/folder not found"
   - **Fix**: Copy from apps directory: `cp -r apps/folder/pkg/apis/folder pkg/apis/folder`

## Working CI/CD Configuration

### `.gitlab-ci.yml`
```yaml
# Using Docker-in-Docker service
image: docker:27

services:
  - name: docker:27-dind
    alias: docker
    command: ["--tls=false"]

variables:
  DOCKER_HOST: tcp://docker:2375
  DOCKER_TLS_CERTDIR: ""
  DOCKER_DRIVER: overlay2
  GRAFANA_IMAGE: grafana/grafana-oss:dev

stages:
  - build
  - push

build-grafana:
  stage: build
  tags: [wsl2]
  rules:
    - if: $CI_PIPELINE_SOURCE == 'web'
    - if: $CI_PIPELINE_SOURCE == 'merge_request_event'
    - if: $CI_COMMIT_TAG
    - if: $CI_PIPELINE_SOURCE == 'push'
  before_script:
    - until docker info; do echo "Waiting for Docker..."; sleep 2; done
    - echo "Docker is ready!"
    - docker version
    - apk add --no-cache make git bash gcc g++ musl-dev nodejs npm go yarn
    - docker buildx create --driver docker-container --use || true
  script:
    - echo "Building Grafana Docker image with make build-docker-full"
    - make build-docker-full
    - docker images | grep grafana

push-to-registry:
  stage: push
  tags: [wsl2]
  needs: ["build-grafana"]
  before_script:
    - echo "$QA_REGISTRY_PASSWORD" | docker login -u "$QA_REGISTRY_USER" --password-stdin "$QA_REGISTRY"
  script:
    - docker tag ${GRAFANA_IMAGE} "$QA_REGISTRY/$CUSTOMER/$SERVICE:$CI_COMMIT_REF_SLUG"
    - docker push "$QA_REGISTRY/$CUSTOMER/$SERVICE:$CI_COMMIT_REF_SLUG"
```

## Debugging Tips

### Check Pipeline Failures
1. Get pipeline status: `glab ci status --branch <branch>`
2. Get pipeline ID from the output
3. Get job list: `glab api /projects/nexiona%2Fcodebase%2Fmiimetiq-x%2Fgrafana/pipelines/<pipeline-id>/jobs`
4. Extract failed job ID and get logs: `glab api /projects/nexiona%2Fcodebase%2Fmiimetiq-x%2Fgrafana/jobs/<job-id>/trace`

### Common Error Patterns
- **"Cannot connect to Docker daemon"**: Docker-in-Docker service not ready or socket not mounted
- **"go.work lists go X.X.X"**: Go version mismatch, update go.work
- **"failed to compute cache key"**: Missing directory in Docker build context

## Registry Information
The CI pushes built images to the Nexiona registry using these variables:
- `$QA_REGISTRY`: Registry URL
- `$QA_REGISTRY_USER`: Registry username
- `$QA_REGISTRY_PASSWORD`: Registry password
- `$CUSTOMER`: Customer identifier
- `$SERVICE`: Service name

## Local Testing
To test the Docker build locally:
```bash
make build-docker-full
```

This creates `grafana/grafana-oss:dev` Docker image locally.