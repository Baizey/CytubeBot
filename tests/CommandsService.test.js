import CommandService from "../src/Services/CommandService.js";
import Rank from "../src/Services/models/Rank.js";
import CytubeCommand from "../src/Services/models/CytubeCommand.js";
import CytubeUser from "../src/Services/models/CytubeUser.js";
import {SayCommand} from "../src/Services/models/Command.js";
// noinspection ES6UnusedImports
import should from "should";
import MockConstructor from "./mocks/MockConstructor";
import CommandResponse from "../src/Services/models/CommandResponse";

const admin = new CytubeUser('test-admin', Rank.admin.value);
const mod = new CytubeUser('test-mod', Rank.mod.value);
const user = new CytubeUser('test-user', Rank.user.value);
const anon = new CytubeUser('test-anon', Rank.anon.value);

describe("CommandService tests", () => {
    const mock = MockConstructor.mock;
    const bot = mock.bot;
    const service = new CommandService(bot);
    const say = new SayCommand(bot);

    describe('CommandService', () => {
        it("Cant find commands", async () => {
            const text = 'banana';
            const command = new CytubeCommand('bananahammockwubwub', text);
            const result = await service.run(command, admin, true);

            const expected = new CommandResponse('Command does not exist', true);
            result.should.deepEqual(expected);
        });

        it('too low rank', async () => {
            const text = 'banana';
            const command = new CytubeCommand(say.name, text);
            const result = await service.run(command, mod, true);
            const expected = new CommandResponse('Command requires higher rank', true);
            result.should.deepEqual(expected);
        });

        it("Can find commands", async () => {
            const text = 'banana';
            const command = new CytubeCommand(say.name, text);
            const expected = new CommandResponse(text, false);
            const result = await service.run(command, admin, true);
            result.should.deepEqual(expected);
        });
    });

    describe('SayCommand', () => {
        it('public chat', async () => {
            const text = 'banana';
            const command = new CytubeCommand(say.name, text);
            const result = await service.run(command, admin, false);
            const expected = new CommandResponse(text, false);
            result.should.deepEqual(expected);
        });

        it('private chat', async () => {
            const text = 'banana';
            const command = new CytubeCommand(say.name, text);
            const result = await service.run(command, admin, true);
            const expected = new CommandResponse(text, false);
            result.should.deepEqual(expected);
        });
    })

});