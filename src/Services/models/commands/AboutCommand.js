import Command from "../Command.js";
import Rank from "../Rank.js";

export default class AboutCommand extends Command {
    constructor(bot) {
        super(bot, 'about', Rank.admin);
    }

    async run(data, user, isPm) {
        const title = data.message.trim() || this.bot.playlist.getByTag(data.tags.playlist).title;
        const year = data.tags.year || 0;

        const movie = await this.bot.tmdb.getInfo(title, year);

        if (!movie)
            return {
                isPm: isPm,
                messages: [`Could not find any movies titled ${title}`],
            };

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

        return {
            isPm: isPm,
            messages: messages,
        }
    }
}