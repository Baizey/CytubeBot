import CommandService from "../src/Services/CommandService.js";
import Rank from "../src/Services/models/Rank.js";
import CytubeCommand from "../src/Services/models/CytubeCommand.js";
import CytubeUser from "../src/Services/models/CytubeUser.js";
import SayCommand from "../src/Services/models/commands/SayCommand.js";

// noinspection ES6UnusedImports
import should from "should";

const admin = new CytubeUser('test-admin', Rank.admin.value);
const mod = new CytubeUser('test-mod', Rank.mod.value);
const user = new CytubeUser('test-user', Rank.user.value);
const anon = new CytubeUser('test-anon', Rank.anon.value);

describe("CommandService tests", () => {
    const bot = null;
    const service = new CommandService(bot);
    const say = new SayCommand(bot);

    describe('CommandService', () => {
        it("Cant find commands", () => {
            const text = 'banana';
            const command = new CytubeCommand('bananahammockwubwub', text);
            const result = service.run(command, admin, true);
            result.should.deepEqual({
                messages: ['Command does not exist'],
                isPm: true
            });
        });

        it('too low rank', () => {
            const text = 'banana';
            const command = new CytubeCommand(say.name, text);
            const result = service.run(command, mod, true);
            result.should.deepEqual({
                messages: ['Command requires higher rank'],
                isPm: true
            });
        });

        it("Can find commands", () => {
            const text = 'banana';
            const command = new CytubeCommand(say.name, text);
            const result = service.run(command, admin, true);
            result.should.deepEqual({
                messages: [text],
                isPm: true
            });
        });
    });

    describe('SayCommand', () => {
        it('public chat', () => {
            const text = 'banana';
            const command = new CytubeCommand(say.name, text);
            const result = service.run(command, admin, false);
            result.should.deepEqual({
                messages: [text],
                isPm: false
            });
        });

        it('private chat', () => {
            const text = 'banana';
            const command = new CytubeCommand(say.name, text);
            const result = service.run(command, admin, true);
            result.should.deepEqual({
                messages: [text],
                isPm: true
            });
        });
    })

});