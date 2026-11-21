# Production Dockerfile for Render (Node.js Express + Python 3 ML Engine)
FROM node:20-bookworm-slim

# Install Python 3, pip, and essential build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    python3-venv \
    python-is-python3 \
    build-essential \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/* \
    && ln -sf /usr/bin/python3 /usr/bin/python

# Set working directory
WORKDIR /app

# Install Python ML dependencies
COPY requirements.txt ./
RUN pip3 install --no-cache-dir --break-system-packages -r requirements.txt

# Install Node dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy backend source code
COPY . .

# Environment defaults
ENV NODE_ENV=production
ENV PYTHON_BIN=python3
ENV PORT=8001

# Expose server port (Render injects $PORT at runtime)
EXPOSE 8001

# Start the Node.js API server
CMD ["node", "server.js"]
