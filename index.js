const fs = require("fs").promises;
const path = require("path");
const { FsMigrations } = require("knex/lib/migrations/migrate/sources/fs-migrations");
const { DEFAULT_LOAD_EXTENSIONS } = require("knex/lib/migrations/common/MigrationsLoader");

const DEFAULT_LOAD_EXTENSIONS_PLUS_SQL = Object.freeze(
    DEFAULT_LOAD_EXTENSIONS.concat([
        ".sql"
    ])
);

class SqlMigrationSource extends FsMigrations {
    constructor(migrationDirectories, sortDirsSeparately, loadExtensions) {
        super(migrationDirectories, sortDirsSeparately, loadExtensions || DEFAULT_LOAD_EXTENSIONS_PLUS_SQL);
    }

    async getMigrations() {
        return filterMigrations(this, await super.getMigrations());
    }

    parseMigrationName(migration) {
        const name = this.getMigrationName(migration);
        const ext = path.extname(name);
        const base = path.basename(name, ext);
        return { name, ext, base };
    }

    isSql(migration) {
        const { ext } = this.parseMigrationName(migration);
        return ext === ".sql";
    }

    async getSqlMigration(migrationInfo) {
        const absoluteDir = path.resolve(process.cwd(), migrationInfo.directory);
        const name = this.getMigrationName(migrationInfo);
        const _path = path.join(absoluteDir, name);
        const query = await fs.readFile(_path, "utf-8");

        return {
            up(knex) {
                return knex.raw(query);
            },
            down() {
            }
        };
    }

    getMigration(migrationInfo) {
        if (!this.isSql(migrationInfo))
            return super.getMigration(migrationInfo);
        return this.getSqlMigration(migrationInfo);
    }
}

function filterMigrations(migrationSource, migrations) {
    return migrations.filter(migration1 => {
        const { name: name1, base: base1, ext } = migrationSource.parseMigrationName(migration1);
        return ext !== ".sql" || migrations.every(migration2 => {
            const { name: name2, base: base2 } = migrationSource.parseMigrationName(migration2);
            return name1 === name2 || base1 !== base2;
        });
    });
}

module.exports = ({
    migrationDirectories,
    sortDirsSeparately,
    loadExtensions
} = {
    migrationDirectories: "migrations",
    sortDirsSeparately: false,
    loadExtensions: DEFAULT_LOAD_EXTENSIONS_PLUS_SQL
}) => {
    return new SqlMigrationSource(migrationDirectories, sortDirsSeparately, loadExtensions)
};
