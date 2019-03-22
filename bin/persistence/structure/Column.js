module.exports = class Column {

    static int() {
        return 'integer';
    }

    static text() {
        return 'text';
    }
    static bool() {
        return 'boolean';
    }
    static number() {
        return 'real';
    }

    constructor(name, type = Column.text(), constraints = '') {
        this.name = name;
        this.type = type;
        this.constraints = constraints;
    }

    get sql() {
        return `${this.name} ${this.type} ${this.constraints}`;
    }

    where(symbol = '=') {
        return `${this.name} ${symbol} $(${this.name})`;
    }
};