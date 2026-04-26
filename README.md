# Kings Market Databases Project

Database Systems class project for Kings Market: a pre-order and pickup workflow backed by MySQL.

<img width="1512" height="823" alt="image" src="https://github.com/user-attachments/assets/e5ad9089-f270-45cd-b242-3f460e2182bb" />

&nbsp;

<img width="1512" height="823" alt="image" src="https://github.com/user-attachments/assets/bf0a485c-7bfa-4018-8862-9eb4d6cb0775" />

&nbsp;

<img width="1512" height="823" alt="image" src="https://github.com/user-attachments/assets/8ebef7c1-67e1-455c-bc12-9a4ba6630835" />

&nbsp;

<img width="1512" height="823" alt="image" src="https://github.com/user-attachments/assets/39148ffa-8853-4e7d-978a-e93e406eb562" />

## Current Schema Source

- Main schema file: `hgr9ba_b.sql`
- Use this file as the source of truth when setting up the database.

## Setup (Local MySQL)

1. Create a database:
   - `CREATE DATABASE hgr9ba_b;`
2. Import schema and seed data:
   - `mysql -u <username> -p hgr9ba_b < hgr9ba_b.sql`

## Default Storekeeper Login

Created by `km-app/db/migrations/013_seed_default_storekeeper.sql`.

- Role: `storekeeper`
- Email: `storekeeper1@gmail.com`
- Username: `johnstorekeeper`
- Password: `Password`

## Migrations Folder Note

- Files in `migrations/` are kept as **documentation only** for the SQL optimization sprint.
- Do not execute those files directly unless the team explicitly changes workflow.

## to run cloud proxy

first download gcloud and login with `gcloud auth application-default login`
this logs you into your google account and should let you access the gcloud stuff from your computer

then download cloud proxy to somewhere (anywhere really)
run it with this:

for windows: `.\cloud-sql-proxy.exe kings-market-491600:us-east4:kings-market-db --port 3306`

for macOS: `./cloud-sql-proxy kings-market-491600:us-east4:kings-market-db --port 3306`

for linux: `idk man good luck`

this will have the proxy running in that terminal, which is good, and you should be able to access the database now

live GCP link: <https://kings-market-app-1078601567030.us-east4.run.app/>
