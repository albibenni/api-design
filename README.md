# Reminders

## DB Connections

Postgres default port `5432` probably is used by default by pgAdmin or another container and generates hard to debug errors (not found user - rule not found `user-name`).

Check port first, then run:

- `pn compose`:
  - `docker compose down && docker compose up -d`
- check connection via:
  - `docker exec -it container-name -U user-name -d db-name`
    According to the current `.env.local`:
    - `docker exec -it api-db psql -U api -d design`
