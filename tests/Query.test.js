import {InsertQuery} from "../src/database/sql/InsertQuery.js";
import {SelectQuery} from "../src/database/sql/SelectQuery.js";
import {UpdateQuery} from "../src/database/sql/UpdateQuery.js";
import {DeleteQuery} from "../src/database/sql/DeleteQuery.js";
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
});