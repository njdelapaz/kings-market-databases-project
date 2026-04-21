# Kings Market Databases Project

Database Systems class project for Kings Market: a pre-order and pickup workflow backed by MySQL.

## Current Schema Source

- Main schema file: `hgr9ba_b.sql`
- Use this file as the source of truth when setting up the database.

## Setup (Local MySQL)

1. Create a database:
   - `CREATE DATABASE hgr9ba_b;`
2. Import schema and seed data:
   - `mysql -u <username> -p hgr9ba_b < hgr9ba_b.sql`

## Migrations Folder Note

- Files in `migrations/` are kept as **documentation only** for the SQL optimization sprint.
- Do not execute those files directly unless the team explicitly changes workflow.


## to run cloud proxy
download cloud proxy to somewhere
run it with this: `.\cloud-sql-proxy.exe kings-market-491600:us-east4:kings-market-db --port 3306`