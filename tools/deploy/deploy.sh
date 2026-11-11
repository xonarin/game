#!/usr/bin/env bash
#
# Reference deploy script, run by the deploy agent (src/deployagent) on a VPS.
# Wraps the game deploy in maintenance mode and rolls back if the health check fails.
# Customize the DEPLOY_* variables for your production setup (compose file, service, health URL).
#
#   DEPLOY_ROLE      game | admin | auth   (only "game" toggles maintenance)
#   DEPLOY_COMPOSE   docker compose command (default: docker compose -f docker-compose.prod.yml)
#   DEPLOY_SERVICE   compose service to rebuild (default: $DEPLOY_ROLE)
#   DEPLOY_HEALTH_URL health endpoint to poll (default per role)
#   DEPLOY_BRANCH    git branch to deploy (default: plant)
#   REDIS_URL        redis for the maintenance flag (game only)
#
set -euo pipefail

ROLE="${DEPLOY_ROLE:-game}"
COMPOSE="${DEPLOY_COMPOSE:-docker compose -f docker-compose.prod.yml}"
SERVICE="${DEPLOY_SERVICE:-$ROLE}"
HEALTH_URL="${DEPLOY_HEALTH_URL:-http://localhost:3000/health}"
BRANCH="${DEPLOY_BRANCH:-plant}"
REDIS_URL="${REDIS_URL:-redis://localhost:6379}"

log() { echo "[deploy:$ROLE] $*"; }

maintenance() { # $1 = 1|0 — only the public game closes the site
    if [ "$ROLE" = "game" ]; then
        redis-cli -u "$REDIS_URL" set maintenance "$1" >/dev/null && log "maintenance=$1"
    fi
}

health() {
    for _ in $(seq 1 30); do
        if curl -fsS "$HEALTH_URL" >/dev/null 2>&1; then return 0; fi
        sleep 2
    done
    return 1
}

PREV_SHA="$(git rev-parse HEAD 2>/dev/null || echo '')"
log "start (prev=$PREV_SHA, branch=$BRANCH)"

rollback() {
    log "ROLLBACK to $PREV_SHA"
    [ -n "$PREV_SHA" ] && git reset --hard "$PREV_SHA" || true
    GIT_SHA="$PREV_SHA" $COMPOSE up -d --build "$SERVICE" || true
    maintenance 0
}
trap 'rollback; exit 1' ERR

# Close the site (game) while we swap in the new build.
maintenance 1

git fetch --all --prune
git reset --hard "origin/$BRANCH"
GIT_SHA="$(git rev-parse HEAD)"
export GIT_SHA
log "building $SERVICE at $GIT_SHA"

$COMPOSE build "$SERVICE"
$COMPOSE up -d "$SERVICE"

if health; then
    maintenance 0
    log "deploy OK ($GIT_SHA)"
else
    log "HEALTH CHECK FAILED"
    rollback
    exit 1
fi
