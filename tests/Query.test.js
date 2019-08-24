describe("Query tests", () => {

    it('Parsing where equal', () => {
        // Setup
        const expected = `WHERE id = 5 AND name LIKE "%banana%" OR value < 5`;
        const query = Query.insert('');

        // Act
        query.filter(e => e.id === 5 && e.name == "%banana%" || e.value < 5);
        const actual = query._generateWhereSql;

        // Assert
        expect(actual).toBe(expected);
    });

    it('Select query', () => {
        // Setup
        const expected = `SELECT id, name FROM table_name WHERE id = 5 AND name LIKE "%banana%" OR value < 5`;
        const query = Query.select('table_name')
            .filter(e => e.id === 5 && e.name == "%banana%" || e.value < 5)
            .select(['id', 'name']);

        // Act
        const actual = query.generateSql;

        // Assert
        expect(actual).toBe(expected);
    });

    it('Insert query', () => {
        // Setup
        const expected = `INSERT INTO table_name (id, name) values (\${id}, \${name})`;
        const query = Query.insert('table_name')
            .insert({
                id: 'id',
                name: 'name'
            });

        // Act
        const actual = query.generateSql;

        // Assert
        expect(actual).toBe(expected);
    });

    it('Update query', () => {
        // Setup
        const expected = `UPDATE table_name SET id = \${id}, name = \${name} WHERE id = 5 AND name LIKE "%banana%" OR value < 5`;
        const query = Query.update('table_name')
            .filter(e => e.id === 5 && e.name == "%banana%" || e.value < 5)
            .map({
                id: 'id',
                name: 'name'
            });

        // Act
        const actual = query.generateSql;

        // Assert
        expect(actual).toBe(expected);
    });

    it('Delete query', () => {
        // Setup
        const expected = `DELETE FROM table_name WHERE id = 5 AND name LIKE "%banana%" OR value < 5`;
        const query = Query.delete('table_name')
            .filter(e => e.id === 5 && e.name == "%banana%" || e.value < 5);

        // Act
        const actual = query.generateSql;

        // Assert
        expect(actual).toBe(expected);
    });
});