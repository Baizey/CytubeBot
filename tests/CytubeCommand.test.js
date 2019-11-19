// noinspection ES6UnusedImports
import should from "should";
import CytubeCommand from "../src/Services/models/CytubeCommand.js";


describe("Command parsing tests", () => {

    it(`Catch command name correctly`, () => {
        const command = CytubeCommand.fromMessage('$command -a:b a;b;c');
        command.name.should.equal('command');
    });

    it(`Catch command name correctly`, () => {
        const command = CytubeCommand.fromMessage('!command -a:b a;b;c');
        command.name.should.equal('command');
    });

    it(`Catch command tag correctly`, () => {
        const command = CytubeCommand.fromMessage('!command -a:b a;b;c');
        command.rawTags['a'].should.equal('b');
    });

    it(`Catch command tag correctly`, () => {
        const command = CytubeCommand.fromMessage('!command -a a;b;c');
        command.rawTags['a'].should.equal('a');
    });

    it(`Catch command array correctly`, () => {
        const command = CytubeCommand.fromMessage('!command -a a;b;c');
        command.array.should.deepEqual(['a', 'b', 'c']);
    });
});