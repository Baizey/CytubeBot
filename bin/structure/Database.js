class Table {

    /**
     * @param {String} name
     * @param {String[]} keys
     * @constructor
     */
    constructor(name, keys) {
        this.name = name.trim();
        this.keys = keys;
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

        if (withKeys && this.keys.length > 0)
            str += `, ${self.keysCreate()}`;
        return str;
    };
    /**
     * @returns {string}
     */
    keysCreate() {
        const self = this;
        if (Object.keys(databaseStructure[self.name].columns).length === 0) return "";
        let str = "primary key(";
        let first = true;
        this.keys.forEach(key => {
            if (!first) str += ", ";
            str += key;
            first = false;
        });
        return str + ")";
    };

    keysWhere() {
        let str = "";
        let first = true;
        this.keys.forEach(key => {
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

const databaseStructure = {
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
        table: new Table("patterns", [])
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