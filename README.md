# knex-sql-migration-source

Custom `MigrationSource` for Knex which loads SQL migrations from `.sql` files and pass it's content to [`knex.raw`](https://knexjs.org/guide/raw.html).

Only up migrations currently supported.

```sh
npm install yoursdearboy/knex-sql-migration-source
```

In you `knexfile.js`:

```js
module.exports = {
    migrations: {
        migrationSource: require("knex-sql-migration-source")({
            migrationDirectories: "migrations",
            sortDirsSeparately: false,
            loadExtensions: [".js", ".ts", ".sql"]
        })
    }
};
```

See more on Knex [custom migration sources in docs](https://knexjs.org/guide/migrations.html#custom-migration-sources).
