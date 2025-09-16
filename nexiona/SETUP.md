# Grafana Docker Build Fix

## Problem
The Docker build was failing with the following error:
```
ERROR: failed to solve: failed to compute cache key: failed to calculate checksum of ref dffaa3fd-91c8-4002-a355-6813fb59b256::fhzbgp3pugx9gvyhohevs6wnv: "/pkg/apis/folder": not found
```

The issue was at line 73 of the Dockerfile:
```dockerfile
COPY pkg/apis/folder pkg/apis/folder
```

## Root Cause
The `pkg/apis/folder` was a broken symbolic link pointing to `/docker-data/build/grafana/apps/folder/pkg/apis/folder`, which didn't exist. The actual folder API code exists in `apps/folder/pkg/apis/folder`.

## Solution
Removed the broken symlink and copied the actual folder API code from its correct location:

1. **Removed broken symlink**:
   ```bash
   rm pkg/apis/folder
   ```

2. **Copied the actual folder API code**:
   ```bash
   cp -r apps/folder/pkg/apis/folder pkg/apis/folder
   ```

## Verification
After applying the fix, the Docker build completed successfully using:
```bash
make build-docker-full
```

## Technical Details
- The Grafana codebase has been restructured to use an `apps` directory for application-specific code
- The `pkg/apis/folder` directory is still referenced in the Dockerfile for backwards compatibility
- The symlink was pointing to a non-existent location, likely from a previous build environment
- Copying the actual folder API code resolves the build issue while maintaining the expected directory structure for the Docker build process

## Build System Context
Grafana's build system consists of:
- **Frontend**: Built using Node.js and Yarn
- **Backend**: Built using Go
- The Dockerfile expects certain directories to exist in specific locations for the multi-stage build process
- The `apps` directory contains modular application code that gets compiled into the main Grafana binary