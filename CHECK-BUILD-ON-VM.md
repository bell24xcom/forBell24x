# Check Docker Build Progress on Oracle VM

## Step 1: SSH into Oracle VM

```bash
# Use your SSH client (PuTTY, Windows Terminal, or WSL)
ssh ubuntu@<YOUR_ORACLE_VM_IP>
# Or if you have a key:
ssh -i ~/.ssh/your-key.pem ubuntu@<YOUR_ORACLE_VM_IP>
```

## Step 2: Check Build Status

Once connected to the VM, run these commands:

```bash
# Check if Docker build process is running
ps aux | grep "docker build" | grep -v grep

# Check Docker daemon status
sudo systemctl status docker | head -15

# Check if container is building
docker ps -a

# Check Docker build logs (if build is in progress)
docker events --since 5m

# Check system resources
top -bn1 | head -20
```

## Step 3: Monitor Build Progress

If the build is still running, you can:

```bash
# Watch Docker processes
watch -n 2 'ps aux | grep docker'

# Check disk I/O
sudo iostat -x 1 3

# Check Docker build cache
docker system df
```

## Step 4: If Build Appears Frozen

```bash
# Check if it's actually frozen (wait 30 seconds, then check again)
ps aux | grep docker

# If truly frozen, you may need to:
# 1. Go back to the build terminal
# 2. Press Ctrl+C to cancel
# 3. Check logs: docker logs bell24h (if container exists)
# 4. Restart build: docker build -t bell24h:latest -f Dockerfile .
```

