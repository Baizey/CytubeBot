import "regenerator-runtime";
import Rank from "./Rank";
import Exit from "../../infrastructure/Exit";
import {TimeFormatter} from "../../infrastructure/Utils";

class Command {
    /**
     * @param {Bot} bot
     * @param {string} name
     * @param {Rank} minimumRank
     */
    constructor(bot, name, minimumRank) {
        this.bot = bot;
        this._rank = minimumRank;
        this._name = name;
    }

    /**
     * @returns {string}
     */
    get name() {
        return this._name;
    }

    /**
     * @returns {Rank}
     */
    get rank() {
        return this._rank;
    }

    /**
     * @param {CytubeCommand} data
     * @param {CytubeUser} user
     * @param {boolean} isPm
     * @returns {Promise<{isPm: boolean, messages: string[]}>}
     */
    async run(data, user, isPm) {
        throw `Command '${this.name}' not implemented yet`;
    }

    /**
     * @param {string[]|string} messages
     * @param {boolean} isPm
     * @returns {{isPm: boolean, messages: string[]}}
     */
    static respond(messages = [], isPm = false) {
        return {
            messages: Array.isArray(messages) ? messages : [messages],
            isPm: isPm
        }
    }
}

export class NextCommand extends Command {
    constructor(bot) {
        super(bot, 'next', Rank.user);
    }

    async run(data, user, isPm) {
        const resp = this.bot.playlist.nextMovie;
        if (!resp)
            return Command.respond(`Something is off, there isn't a next movie?`, isPm);

        const timeTill = resp.between.length === 0
            ? undefined
            : TimeFormatter.seconds(resp.between.reduce((a, b) => a + b.duration, 0)).exactString;

        if (timeTill)
            return Command.respond(`${timeTill} until next in queue, which is ${resp.movie.title}`, isPm);
        return Command.respond(`Next in the queue is ${resp.movie.title}`, isPm);
    }
}


export class TalkCommand extends Command {
    constructor(bot) {
        super(bot, 'talk', Rank.user);
    }

    async run(data, user, isPm) {
        const response = await this.bot.chatbot.chat(data.message);
        return Command.respond(response, isPm);
    }
}

export class SkipCommand extends Command {
    constructor(bot) {
        super(bot, 'skip', Rank.mod);
    }

    async run(data, user, isPm) {
        const video = this.bot.playlist.getByOffset(1);
        if (video) this.bot.playlist.jumpTo(video);
        return {messages: [], isPm: isPm}
    }
}

export class SayCommand extends Command {
    constructor(bot) {
        super(bot, 'say', Rank.admin);
    }

    async run(data, user, isPm) {
        return Command.respond(data.message, false);
    }
}

export class LastOnlineCommand extends Command {
    constructor(bot) {
        super(bot, 'lastonline', Rank.anon);
    }

    async run(data, user, isPm) {
        const name = data.message.trim();
        const users = this.bot.userlist;

        if (users.isOnline(name))
            return Command.respond(`The user is currently online`, isPm);

        const foundUser = await users.get(name);

        if (!foundUser)
            return Command.respond(`No records of this user`, isPm);

        const time = TimeFormatter.millis(Date.now() - foundUser.lastOnline.getTime());

        return Command.respond(`The user was last online ${time.exactString} ago`, isPm);
    }
}

export class HelpCommand extends Command {
    constructor(bot) {
        super(bot, 'help', Rank.admin);
    }

    async run(data, user, isPm) {
        const commands = this.bot.commands.commands.values()
            .filter(e => user.rank.higherOrEqualThan(e.rank))
            .map(e => e.name)
            .join(', ');
        return Command.respond([
            'I permit you to command me to these things meatbag:',
            commands,
            'Use -tag:value as extra options like -year:1999',
            'With unlimited options like -poll title;option1;option2 you can keep going by separating with ;'
        ], isPm);
    }
}

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

export class AvailableCommand extends Command {
    constructor(bot) {
        super(bot, 'avail', Rank.user);
    }

    async run(data, user, isPm) {
        const title = data.message.trim();
        const year = data.tags.year || 0;
        const videos = await this.bot.library.getVideosLike(title, year);

        if (videos.length === 0)
            return Command.respond(`No videos with a title like that in the library`, isPm);

        const messages = [`Found ${videos.length} matches, the best matches are:`,];
        videos.limit(5).forEach(video => messages.push(`${video.title} (${video.year})`));

        Command.respond(messages, isPm);
    }
}

export class AddCommand extends Command {
    constructor(bot) {
        super(bot, 'add', Rank.mod);
    }

    async run(data, user, isPm) {
        const title = data.message.trim();
        const year = data.tags.year || 0;
        const videos = await this.bot.library.getVideosLike(title, year);

        if (videos.length === 0)
            return Command.respond(`Found no working links in library with the title '${title}'`, isPm);

        const video = videos[0];
        await this.bot.playlist.queueVideo(video);
        return Command.respond(`Queued the video ${video.title} (${video.year}) next`, isPm);
    }
}

export class AboutCommand extends Command {
    constructor(bot) {
        super(bot, 'about', Rank.user);
    }

    async run(data, user, isPm) {
        const title = data.message.trim() || this.bot.playlist.getByTag(data.tags.playlist).title;
        const year = data.tags.year || 0;

        const movie = await this.bot.tmdb.getInfo(title, year);

        if (!movie)
            return Command.respond(`Could not find info on the title '${title}'`, isPm);

        const messages = [`Found ${movie.original_title} (${movie.release_date.split('-')[0]})`];

        if (movie.status && movie.status !== "Released")
            messages.push(`**Status ${movie.status}**`);
        else
            messages.push(`**Ratings** ${movie.vote_average} from ${movie.vote_count} votes`);

        if (movie.tagline)
            messages.push(`**${movie.tagline}**`);

        if (movie.overview && movie.overview.length < 500)
            messages.push(movie.overview);
        else
            messages.push(`**Plot** https://www.imdb.com/title/${movie.imdb_id}/`);

        if (movie.genres)
            messages.push(`**Genres** ${movie.genres.map(e => e.name).join(', ')}`);

        if (movie.credits.cast)
            messages.push(`**Cast** ${movie.credits.cast.slice(0, 10).map(e => e.name).join(', ')}`);

        return Command.respond(messages, isPm);
    }
}