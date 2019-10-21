import Command from "../Command.js";
import Rank from "../Rank.js";
import Exit from "../../../infrastructure/Exit.js"

export class ExitCommand extends Command {
    constructor(bot) {
        super(bot, 'exit', Rank.admin);
    }

    async run(data, user, isPm) {
        Exit.terminate(Exit.code.exit, 'Exit command was called');
        return Command.respond();
    }
}

export class RestartCommand extends Command {
    constructor(bot) {
        super(bot, 'restart', Rank.admin);
    }

    async run(data, user, isPm) {
        Exit.terminate(Exit.code.restart, 'Restart command was called');
        return Command.respond();
    }
}