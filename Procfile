# For Development only
# Used with [Hivemind](https://evilmartians.com/opensource/hivemind)
# Install Hivemind and run `hivemind` from the project root to start development
# frontend: npm -C web-frontend run dev

docker: docker run --rm --network host -v $(pwd)/Caddyfile.web-frontend.dev:/etc/caddy/Caddyfile:ro caddy:latest
frontend: npm -C web-frontend run dev
api: modd

