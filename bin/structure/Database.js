class Table {

    /**
     * @param {String} name
     * @param {String[]} primaryKeys
     * @param {ForeignKey[]} foreignKeys
     * @constructor
     */
    constructor(name, primaryKeys = [], foreignKeys = []) {
        this.name = name.trim();
        this.primaryKeys = primaryKeys;
        this.foreignKeys = foreignKeys;
    }

    getInsert() {
        let str = "";
        let first = true;
        const self = this;
        Object.keys(databaseStructure[self.name].columns).forEach(key => {
            const column = databaseStructure[self.name].columns[key];
            if (column.type.toLowerCase().indexOf("default") >= 0)
                return;
            if (!first) str += ", ";
            str += '?';
            first = false;
        });
        return str;
    };

    /**
     * @param {Boolean} withKeys
     * @returns {string}
     */
    getColumns(withKeys = true) {
        let str = "";
        let first = true;
        const self = this;
        Object.keys(databaseStructure[self.name].columns).forEach(key => {
            const column = databaseStructure[self.name].columns[key];
            if (!first) str += ", ";
            str += column.create();
            first = false;
        });

        if (withKeys) {
            const keys = this.keysCreate();
            if (keys.length > 0)
                str += ", " + keys;
        }
        return str;
    };

    /**
     * @returns {string}
     */
    keysCreate() {
        const self = this;
        if (Object.keys(databaseStructure[self.name].columns).length === 0) return "";
        let primary = this.primaryKeysCreate();
        let foreign = this.foreignKeysCreate();
        if (foreign.length === 0) return primary;
        if (primary.length === 0) return foreign;
        return foreign + ", " + primary;
    };

    foreignKeysCreate() {
        if (this.foreignKeys.length === 0) return '';
        return this.foreignKeys.map(key => key.create()).join(', ');
    }

    primaryKeysCreate() {
        if (this.primaryKeys.length === 0) return '';
        return `PRIMARY KEY(${this.primaryKeys.join(', ')})`;
    }

    keysWhere() {
        let str = "";
        let first = true;
        this.primaryKeys.forEach(key => {
            if (!first) str += " AND ";
            str += `${key} = ?`;
            first = false;
        });
        return str;
    };
}

class Column {

    /**
     * @param {String} name
     * @param {String} type
     * @constructor
     */
    constructor(name, type = "TEXT NOT NULL") {
        this.name = name.trim();
        this.type = type.trim();
    }

    /**
     * @returns {string}
     */
    create() {
        return `${this.name} ${this.type}`;
    };

    where() {
        return `${this.name} = ?`
    };

    like() {
        return `${this.name} LIKE ?`
    };
}

class ForeignKey {

    constructor(column, referenceTable, referenceColumn) {
        this.column = column;
        this.referenceTable = referenceTable;
        this.referenceColumn = referenceColumn;
    }

    create() {
        return `FOREIGN KEY(${this.column}) REFERENCES ${this.referenceTable}(${this.referenceColumn})`
    }
}

const databaseStructure = {
    "permissions": {
        columns: {
            user: new Column("user", "TEXT NOT NULL"),
            type: new Column("type", "TEXT NOT NULL"),
        },
        table: new Table("permissions", ["user", "type"], [new ForeignKey('user', 'users', 'name')])
    },
    "users": {
        columns: {
            name: new Column("name", "TEXT NOT NULL"),
            lastonline: new Column("lastonline", "INTEGER DEFAULT 0"),
            disallow: new Column("disallow", "INTEGER DEFAULT 0"),
            rank: new Column("rank", "INTEGER DEFAULT 0"),
            ignore: new Column("ignore", "INTEGER DEFAULT 0"),
            currency: new Column("currency", "INTEGER DEFAULT 0")
        },
        table: new Table("users", ["name"])
    },
    "videos": {
        columns: {
            title: new Column("title", "TEXT"),
            fulltitle: new Column("fulltitle", "TEXT"),
            year: new Column("year", "INTEGER"),
            duration: new Column("duration", "INTEGER"),
            id: new Column("id", "TEXT NOT NULL"),
            type: new Column("type", "TEXT NOT NULL"),
            quality: new Column("quality", "TEXT"),
            validateBy: new Column("validateBy", "INTEGER DEFAULT 0")
        },
        table: new Table("videos", ["id", "type"])
    },
    "patterns": {
        columns: {
            regex: new Column("regex", "TEXT"),
            command: new Column("command", "TEXT"),
            rest: new Column("rest", "TEXT"),
        },
        table: new Table("patterns")
    },
    /* Kept for easily lookup on links we don't have to validate again */
    "deadlinks": {
        columns: {
            id: new Column("id", "TEXT NOT NULL"),
            type: new Column("type", "TEXT NOT NULL")
        },
        table: new Table("deadlinks", ["id", "type"])
    },
    "nominate": {
        columns: {
            user: new Column("user", "TEXT NOT NULL"),
            title: new Column("title", "TEXT NOT NULL"),
            year: new Column("year", "TEXT NOT NULL"),
        },
        table: new Table("nominate", ["user", "title", "year"])
    }
};

module.exports = {
    Table: Table,
    Column: Column,
    structure: databaseStructure
};