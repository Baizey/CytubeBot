import "regenerator-runtime";
import Rank from "./Rank";
import Exit from "../../infrastructure/Exit";
import {TimeFormatter} from "../../infrastructure/Utils";
import '../../infrastructure/prototype/array';
import '../../infrastructure/prototype/string';
import CommandResponse from "./CommandResponse";

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
     * @returns {Promise<CommandResponse>}
     */
    async run(data, user, isPm) {
        throw `Command '${this.name}' not implemented yet`;
    }

    /**
     * @param {string[]|string} messages
     * @param {boolean} isPm
     * @returns {CommandResponse}
     */
    static respond(messages = [], isPm = false) {
        return new CommandResponse(messages, isPm);
    }
}

export class UrbanDictionaryCommand extends Command {
    constructor(bot) {
        super(bot, 'define', Rank.user);
    }

    /**
     * @param data
     * @param user
     * @param isPm
     * @returns {Promise<CommandResponse>}
     */
    async run(data, user, isPm) {
        const query = data.message.trim();
        if (!query) return Command.respond('I need something to define... try again', isPm);
        const definition = await this.bot.urbanDictionary.define(query);
        if (!definition) return Command.respond(`I do not know a definition for '${query}'`, isPm);
        return Command.respond([
            `A definition is '${definition.definition}'`,
            `An example could be ${definition.example}`
        ], isPm);
    }
}

export class GifCommand extends Command {
    constructor(bot) {
        super(bot, 'gif', Rank.user);
    }

    /**
     * @param data
     * @param user
     * @param isPm
     * @returns {Promise<CommandResponse>}
     */
    async run(data, user, isPm) {
        const gifs = await this.bot.giphy.search(data.message.trim());
        if (gifs.length === 0)
            return Command.respond('No gifs found', isPm);
        return Command.respond(`${gifs.random()}.pic`, isPm);
    }
}

export class WakeAllCommand extends Command {
    constructor(bot) {
        super(bot, 'wakeall', Rank.mod);
    }

    /**
     * @param data
     * @param user
     * @param isPm
     * @returns {Promise<CommandResponse>}
     */
    async run(data, user, isPm) {
        return Command.respond(this.bot.userlist.online.keys().join(', '), false);
    }
}

export class PatternCommand extends Command {
    constructor(bot) {
        super(bot, 'pattern', Rank.admin);
    }

    /**
     * @param data
     * @param user
     * @param isPm
     * @returns {Promise<CommandResponse>}
     */
    async run(data, user, isPm) {
        if (data.tags.all) {
            return Command.respond(this.bot.patterns.patterns.map(e => `${e.command} | ${e.regexText} | ${e.rest}`), true);
        }
        if (data.tags.delete) {
            await this.bot.patterns.removeByCommand(data.message.trim());
            return Command.respond(`Deleted patterns for ${data.message.trim()}`, true);
        }

        const [command, regex, rest] = data.array;
        const result = await this.bot.patterns.add(command, regex, rest);
        if (result) return Command.respond(result, true);
        return Command.respond(`Added ${command} | ${regex} | ${rest}`, true);
    }
}

export class TrailerCommand extends Command {
    constructor(bot) {
        super(bot, 'trailer', Rank.mod);
    }

    /**
     * @param data
     * @param user
     * @param isPm
     * @returns {Promise<CommandResponse>}
     */
    async run(data, user, isPm) {
        const youtube = this.bot.youtube;
        const options = data.array.map(e => 'trailer hd official teaser ' + e).map(e => youtube.search(e));
        (await Promise.all(options)).reverse()
            .filter(e => e)
            .forEach(video => this.bot.playlist.queueVideo(video));
        return Command.respond();
    }
}

export class PollCommand extends Command {

    constructor(bot) {
        super(bot, 'poll', Rank.mod);
    }

    /**
     * @param data
     * @param user
     * @param isPm
     * @returns {Promise<CommandResponse>}
     */
    async run(data, user, isPm) {
        const youtube = this.bot.youtube;
        const tags = data.tags;
        const poll = this.bot.poll;
        const manage = tags.manage;
        const hasActivePoll = poll.current.isActive;
        const messages = [];

        if (tags.close) {
            const winner = poll.closeAndChooseWinner();
            const title = winner.split(/[-|]/)[1] || winner;
            if (winner) messages.push(`I pick ${title} as winner!`);
            if (winner && tags.queue) {
                const video = await this.bot.library.closestMatch(winner);
                if (video) this.bot.playlist.queueVideo(video);
                else messages.push(`Could not find the winner in the library :(`);
            }
        } else if (!hasActivePoll) {
            const array = data.array;
            if (array.length === 0) return Command.respond('Need a title to create a poll', isPm);
            const title = array[0];
            const options = array.skip(1);
            this.bot.poll.open(title, options, false);
            if (manage) messages.push('I do not support managing polls from start to finish... yet');
        }

        if (tags.queue && !tags.close) {
            const options = poll.current.optionsTitles
                .filter(e => e && e.trim())
                .map(e => e.split(/\s*[-|]\s*/))
                .map(e => this.bot.library.closestMatch(e[1] || e[0], e[1] ? e[0] - 0 : 0));
            (await Promise.all(options)).reverse().filter(e => e).forEach(video => this.bot.playlist.queueVideo(video));
        }

        if (tags.trailer) {
            const options = poll.current.optionsTitles.map(e => e.split(/\s*[-|]\s*/))
                .map(e => youtube.search('trailer hd official teaser ' + (e[1] || e[0])));
            (await Promise.all(options)).reverse().filter(e => e).forEach(video => this.bot.playlist.queueVideo(video));
        }

        return Command.respond(messages, false);
    }
}

export class NextCommand extends Command {
    constructor(bot) {
        super(bot, 'next', Rank.user);
    }

    /**
     * @param data
     * @param user
     * @param isPm
     * @returns {Promise<CommandResponse>}
     */
    async run(data, user, isPm) {
        if (this.bot.poll.current.isActive && this.bot.poll.current.options.length > 0)
            return Command.respond(`A poll is currently active, the winner will play next`, isPm);

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

    /**
     * @param data
     * @param user
     * @param isPm
     * @returns {Promise<CommandResponse>}
     */
    async run(data, user, isPm) {
        const response = await this.bot.chatbot.chat(data.message);
        return Command.respond(response, isPm);
    }
}

export class SkipCommand extends Command {
    constructor(bot) {
        super(bot, 'skip', Rank.mod);
    }

    /**
     * @param data
     * @param user
     * @param isPm
     * @returns {Promise<CommandResponse>}
     */
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

    /**
     * @param data
     * @param user
     * @param isPm
     * @returns {Promise<CommandResponse>}
     */
    async run(data, user, isPm) {
        return Command.respond(data.message, false);
    }
}

export class LastOnlineCommand extends Command {
    constructor(bot) {
        super(bot, 'lastonline', Rank.anon);
    }

    /**
     * @param data
     * @param user
     * @param isPm
     * @returns {Promise<CommandResponse>}
     */
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
        super(bot, 'help', Rank.anon);
    }

    /**
     * @param data
     * @param user
     * @param isPm
     * @returns {Promise<CommandResponse>}
     */
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

    /**
     * @param data
     * @param user
     * @param isPm
     * @returns {Promise<CommandResponse>}
     */
    async run(data, user, isPm) {
        Exit.terminate(Exit.code.exit, 'Exit command was called');
        return Command.respond();
    }
}

export class RestartCommand extends Command {
    constructor(bot) {
        super(bot, 'restart', Rank.admin);
    }

    /**
     * @param data
     * @param user
     * @param isPm
     * @returns {Promise<CommandResponse>}
     */
    async run(data, user, isPm) {
        Exit.terminate(Exit.code.restart, 'Restart command was called');
        return Command.respond();
    }
}

export class AvailableCommand extends Command {
    constructor(bot) {
        super(bot, 'avail', Rank.user);
    }

    /**
     * @param data
     * @param user
     * @param isPm
     * @returns {Promise<CommandResponse>}
     */
    async run(data, user, isPm) {
        const title = data.message.trim();
        const year = data.tags.year || 0;
        const videos = await this.bot.library.getVideosLike(title, year);

        if (videos.length === 0)
            return Command.respond(`No videos with a title like that in the library`, isPm);

        const messages = [`Found ${videos.length} matches, the best matches are:`];
        videos.limit(5).forEach(video => messages.push(`${video.title.capitalize()}${video.year ? ` (${video.year})` : ''}${video.quality ? ` (${video.quality})` : ''}`));

        return Command.respond(messages, isPm);
    }
}

export class AddCommand extends Command {
    constructor(bot) {
        super(bot, 'add', Rank.mod);
    }

    /**
     * @param data
     * @param user
     * @param isPm
     * @returns {Promise<CommandResponse>}
     */
    async run(data, user, isPm) {
        const title = data.message.trim();
        const year = data.tags.year || 0;

        const videos = (data.tags.source === 'youtube' || data.tags.source === 'yt')
            ? await this.bot.youtube.search(data.message.trim()).then(e => e ? [e] : [])
            : await this.bot.library.getVideosLike(title, year);

        if (videos.length === 0)
            return Command.respond(`Found no working links in library with the title '${title}'`, isPm);

        const video = videos[0];
        await this.bot.playlist.queueVideo(video);
        return Command.respond(`Queued the video ${video.title} ${year ? `(${year}) ` : ''}next`, isPm);
    }
}

export class AboutCommand extends Command {
    constructor(bot) {
        super(bot, 'about', Rank.user);
    }

    /**
     * @param data
     * @param user
     * @param isPm
     * @returns {Promise<CommandResponse>}
     */
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