# Stage 1: Build React Frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Python Runtime
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies if any, then python requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt gunicorn

# Copy Flask backend files
COPY . .

# Copy the compiled React assets from stage 1
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Expose the default container port
EXPOSE 10000

# Start app using Gunicorn binding to PORT env var (Render default)
CMD ["sh", "-c", "gunicorn --bind 0.0.0.0:${PORT:-10000} app:app"]
