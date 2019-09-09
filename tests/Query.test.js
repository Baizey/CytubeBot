import InsertQuery from "../src/database/sql/InsertQuery.js";
import SelectQuery from "../src/database/sql/SelectQuery.js";
import UpdateQuery from "../src/database/sql/UpdateQuery.js";
import DeleteQuery from "../src/database/sql/DeleteQuery.js";
import CreateQuery from "../src/database/sql/CreateQuery.js";
// noinspection ES6UnusedImports
import should from "should";

describe("SQL Linq tests", () => {

    describe('where tests', () => {
        it('Parsing where none', () => {
            // Setup
            const expected = ``;
            const query = new InsertQuery('table_name');

            // Act
            const actual = query._generateWhereSql;

            // Assert
            actual.should.equal(expected);
        });

        it('Parsing where basic', () => {
            // Setup
            const expected = `WHERE id = 5 AND name LIKE "%banana%" OR value < 5`;
            const query = new InsertQuery('table_name')
                .where(e => e.id === 5 && e.name == "%banana%" || e.value < 5);

            // Act
            const actual = query._generateWhereSql;

            // Assert
            actual.should.equal(expected);
        });

        it('Parsing where variables', () => {
            // Setup
            const expected = 'WHERE id = ${auto_param_0} AND id = ${auto_param_1}';
            const query = new SelectQuery('table_name')
                .where(e => e.id === $ && e.id === $, true, true);

            // Act
            const actual = query._generateWhereSql;

            // Assert
            actual.should.equal(expected);
        });

        it('Parsing where array variables', () => {
            // Setup
            const expected = 'WHERE id IN (${auto_param_0_0}, ${auto_param_0_1}, ${auto_param_0_2}) AND id = ${auto_param_1}';
            const query = new SelectQuery('table_name')
                .where(e => e.id in $ && e.id === $, ['a', 'b', 'c'], true);

            // Act
            const actual = query._generateWhereSql;

            // Assert
            actual.should.equal(expected);
        });
    });

    describe('select tests', () => {
        it('Select multiple columns', () => {
            // Setup
            const expected = `SELECT id, name FROM table_name WHERE id = 5 AND name LIKE "%banana%" OR value < 5`;
            const query = new SelectQuery('table_name')
                .where(e => e.id === 5 && e.name == "%banana%" || e.value < 5)
                .select(['id', 'name']);

            // Act
            const actual = query.generateSql;

            // Assert
            actual.should.equal(expected);
        });

        it('Select one column', () => {
            // Setup
            const expected = `SELECT id FROM table_name WHERE id = 5 AND name LIKE "%banana%" OR value < 5`;
            const query = new SelectQuery('table_name')
                .where(e => e.id === 5 && e.name == "%banana%" || e.value < 5)
                .select(['id']);

            // Act
            const actual = query.generateSql;

            // Assert
            actual.should.equal(expected);
        });

        it('Select all columns', () => {
            // Setup
            const expected = `SELECT * FROM table_name WHERE id = 5 AND name LIKE "%banana%" OR value < 5`;
            const query = new SelectQuery('table_name')
                .where(e => e.id === 5 && e.name == "%banana%" || e.value < 5);

            // Act
            const actual = query.generateSql;

            // Assert
            actual.should.equal(expected);
        });
    });

    it('Insert query', () => {
        // Setup
        const expected = `INSERT INTO table_name (id, name) values (\${id}, \${name})`;
        const query = new InsertQuery('table_name')
            .insert({
                id: 'id',
                name: 'name'
            });

        // Act
        const actual = query.generateSql;

        // Assert
        actual.should.equal(expected);
    });

    it('Update query', () => {
        // Setup
        const expected = `UPDATE table_name SET id = \${id}, name = \${name} WHERE id = 5 AND name LIKE "%banana%" OR value < 5`;
        const query = new UpdateQuery('table_name')
            .where(e => e.id === 5 && e.name == "%banana%" || e.value < 5)
            .update({
                id: 'id',
                name: 'name'
            });

        // Act
        const actual = query.generateSql;

        // Assert
        actual.should.equal(expected);
    });

    it('Delete query', () => {
        // Setup
        const expected = `DELETE FROM table_name WHERE id = 5 AND name LIKE "%banana%" OR value < 5`;
        const query = new DeleteQuery('table_name')
            .where(e => e.id === 5 && e.name == "%banana%" || e.value < 5);

        // Act
        const actual = query.generateSql;

        // Assert
        actual.should.equal(expected);
    });

    describe('Create tests', () => {
        it('Create empty table', () => {
            const expected = 'CREATE TABLE IF NOT EXISTS table_name ()';
           const query = new CreateQuery('table_name');
           const sql = query.generateSql;
           sql.should.equal(expected);
        });
        it('Create int column', () => {
            const expected = 'CREATE TABLE IF NOT EXISTS table_name (column int)';
            const query = new CreateQuery('table_name');
            query.int('column');
            const sql = query.generateSql;
            sql.should.equal(expected);
        });
        it('Create string column', () => {
            const expected = 'CREATE TABLE IF NOT EXISTS table_name (column text)';
            const query = new CreateQuery('table_name');
            query.text('column');
            const sql = query.generateSql;
            sql.should.equal(expected);
        });
        it('Create number column', () => {
            const expected = 'CREATE TABLE IF NOT EXISTS table_name (column real)';
            const query = new CreateQuery('table_name');
            query.real('column');
            const sql = query.generateSql;
            sql.should.equal(expected);
        });
        it('Create boolean column', () => {
            const expected = 'CREATE TABLE IF NOT EXISTS table_name (column boolean)';
            const query = new CreateQuery('table_name');
            query.bool('column');
            const sql = query.generateSql;
            sql.should.equal(expected);
        });

        it('Create 1 primary', () => {
            const expected = 'CREATE TABLE IF NOT EXISTS table_name (column boolean PRIMARY KEY)';
            const query = new CreateQuery('table_name');
            query.bool('column').primary();
            const sql = query.generateSql;
            sql.should.equal(expected);
        });
        it('Create multi primary', () => {
            const expected = 'CREATE TABLE IF NOT EXISTS table_name (column1 boolean, column2 boolean, PRIMARY KEY (column1, column2))';
            const query = new CreateQuery('table_name');
            query.bool('column1').primary();
            query.bool('column2').primary();
            const sql = query.generateSql;
            sql.should.equal(expected);
        });
        it('Create 1 unique', () => {
            const expected = 'CREATE TABLE IF NOT EXISTS table_name (column boolean UNIQUE)';
            const query = new CreateQuery('table_name');
            query.bool('column').unique();
            const sql = query.generateSql;
            sql.should.equal(expected);
        });
        it('Create multi unique', () => {
            const expected = 'CREATE TABLE IF NOT EXISTS table_name (column1 boolean, column2 boolean, UNIQUE (column1, column2))';
            const query = new CreateQuery('table_name');
            query.bool('column1').unique();
            query.bool('column2').unique();
            const sql = query.generateSql;
            sql.should.equal(expected);
        });
        it('Create multi unique and primary', () => {
            const expected = 'CREATE TABLE IF NOT EXISTS table_name (column1 boolean, column2 boolean, PRIMARY KEY (column1, column2), UNIQUE (column1, column2))';
            const query = new CreateQuery('table_name');
            query.bool('column1').unique().primary();
            query.bool('column2').unique().primary();
            const sql = query.generateSql;
            sql.should.equal(expected);
        });
        it('Create column not null', () => {
            const expected = 'CREATE TABLE IF NOT EXISTS table_name (column boolean NOT NULL)';
            const query = new CreateQuery('table_name');
            query.bool('column').nullable(false);
            const sql = query.generateSql;
            sql.should.equal(expected);
        });

        it('Create column foreign key', () => {
            const expected = 'CREATE TABLE IF NOT EXISTS table1 (column1 boolean REFERENCES table2(column2))';
            const query = new CreateQuery('table1');
            query.bool('column1').reference('table2', 'column2');
            const sql = query.generateSql;
            sql.should.equal(expected);
        });

        it('Create column  defaults', () => {
            const expected = 'CREATE TABLE IF NOT EXISTS table (int int DEFAULT 0, string text DEFAULT "monkey")';
            const query = new CreateQuery('table');
            query.int('int').default(0);
            query.text('string').default("monkey");
            const sql = query.generateSql;
            sql.should.equal(expected);
        });
    });

});