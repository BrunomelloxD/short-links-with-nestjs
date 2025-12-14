#!/bin/sh
set -e

echo "=== Environment Check ==="
echo "DATABASE_URL is set: ${DATABASE_URL:+YES}"
echo "PORT is set: ${PORT:+YES}"

if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL environment variable is not set!"
  exit 1
fi

echo "Running Prisma migrations..."
npx prisma migrate deploy

echo "Starting application..."
exec node dist/app/main.js
