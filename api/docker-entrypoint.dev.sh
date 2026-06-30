#!/bin/sh
set -e

echo "Applying database migrations..."
npm run db:migration:deploy

if [ "${SEED_DATABASE:-false}" = "true" ]; then
  echo "Seeding database..."
  npm run db:seed
fi

exec "$@"
