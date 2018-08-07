# CytubeBot
A cytu.be moderator bot

A mention to ```https://github.com/nuclearace/CytubeBot``` that this bot was inspired from.

### First time setup

Tested for node ```10.6.0```, npm ```6.1.0```, so these are the recommended versions.

Do ```npm install``` from ../CytubeBot

First time ```node app.js``` is run a _config.json_ file will be created and the bot crashes

fill _config.json_ out

from here on the bot can just be started by running ```node app.js```

Works fine on both windows and linux

### General usage when running

All logs are stored in the folder _logs_

The bot takes commands starting with ```$``` and ```!``` fx ```$help``` and ```!help```

```$help``` will give a list of available commands

```$help command``` will give a description of the individual commands

The general structure of a command is as such:

```$command text```

with some commands taking tags like:

```$about text [year:1984]``` or ```$nominate [mine]```

or alternatively like such:

```$about text -year:1984``` or ```$nominate -mine```


Some commands also take multiple arguments, these are separated by ```;``` fx:

```$choose a;b;c;d```

Lastly the bot also allows simple references to the current playlist with ```$prev```, ```$curr``` and ```$next```

like ```$about $next```

### Config settings

```databasePath``` fx ```./database.db```

```serverName``` defaults to ```cytu.be```

```userName``` name of the account for the bot

```userPassword``` password for the account for the bot

```roomName``` name of the room the bot will monitor

```roompassword``` password if the room has one

```wolfram``` api key for wolfram alpha ```https://products.wolframalpha.com/api/```

```google``` api key for google ```https://developers.google.com/apis-explorer/#p/```

```TheMovieDB``` api key for TMDB ```https://www.themoviedb.org/documentation/api```

```OMDB``` api key for OMDB ```https://www.omdbapi.com/```

```cleverbot``` api key for cleverbot ```https://www.cleverbot.com/api/```

### Commands

```$about movie``` tells general plot and information about the given movie

```$about movie [year:1985]``` same as without the [year:1985], except it will only look for movies released in 1985

```$about $curr``` looks up the current movie playing

```$about $prev``` looks up the previous movie playing

```$about $next``` looks up the next movie playing

```$about```  same as ```$about $curr``` 

```$add title/url``` (mod command) adds the given movie as a temp next on the playlist. if title it adds best match from database

```$add title [year:1985]``` (mod command) same principe as $about with the [year] tag

```$ask question``` answers to yes/no questions 

```$allow/$disallow user``` (mod command) allows/disallows the user to interact with the bot (must be exact name) 

```$disallowed``` (mod command) mentions all disallowed users

```$poll title;option1;option2;..:optionN``` (mod command) creates poll with options and title
 
```$poll title;option1;option2;..:optionN [anon]``` (mod command) same as above, just does the voting obscured

```$poll [close]``` (mod command) Picks winner from previous poll and closes it if it's open.

```$poll [close] [manage]``` (mod command, experimental) Same as above, also tries to queue the winner next

```$poll [auto]``` (mod command) Makes a poll from top nominations

```$poll [auto] [manage]``` (mod command, experimental) Same as above. The bot will however also queue trailers, intermission and play the winner at the end

```$choose a;b;c;d``` chooses between a, b, c and d. 

```$cleanplaylist``` (admin command) returns a list of possible duplicates and dead links from the playlist

```$define thing``` defines the thing using urban dictionary 

```$curr``` tells the title of the currently playing movie

```$next``` tells the title of the next playing movie

```$prev``` tells the title of the previous playing movie

```$exit``` (admin command) shuts the bot off

```$restart``` (mod command) restarts the bot

```$giphy thing``` displays a gif of said thing

```$holiday``` tells which holidays it currently is today

```$avail title``` (user command) tells all available movies in the library matching the title

```$avail title [year:1985]``` (user command) same as above, just for specific release year

```$ignore/unignore``` makes the bot (un)ignore any input you make

```$image thing``` displays image of thing from a (safe) google search

```$nominate title``` (user command) nominates the title to be played (each user can only nominate each title once)

```$nominate title [year:1985]``` (user command) same as above for specific year

```$nominate [mine]``` (user command) tells your current nominations

```$nominate [top]``` (user command) tells the top 5 nominated movies

```$nominate [delete]``` (user command) deletes all your current nominations

```$pattern command;regex;msg``` (admin command) if you don't know regex look it up. creates a pattern outside of commands for the bot to recognize. Fx say;greater good;greatest good will have the bot say greatest good everytime someone says greater good.

```$pattern command;regex``` (admin command) same as above, just not giving any msg to the command that is called

```$pattern [all]``` (admin command) shows all patterns currently active

```$pattern [delete] command``` (admin command) delete all patterns for a given command

```$help``` tells you available commands and general usage (tl;dr of all of this)

```$help commandName``` tells specific information about the command

```$recommend title/$curr/$next/$prev [year:1985]``` recommend other movies to watch if you liked the given title

```$similar title/$curr/$next/$prev [year:1985]``` similar movies to watch if you liked the given title

```$talk msg``` chat with the bot, cleverbot style 

```$time``` tells the current time of the playing media

```$trailer a;b;c``` (mod command) queues a, b and c as trailers from youtube

```$trailer``` (mod command) queues trailers for current poll (or last if none active)

```$trivia``` starts a trivia... ehm... I'll get back to this when the command is implemented

```$troubleshoot``` tells common things to do to troubleshoot problems on cytu.be

```$update``` (admin command) updates all movie titles/releaseYears/quality to new pattern (if the bot was updated)

```$validlib``` (admin command) makes the bot look through the entire library adding any working links to its database

```$wakeall msg``` (mod commmand) squees everybody in the room and gives them a message

```$wolfram query``` queries wolfram alpha

```$youtube queries``` (mod command) searches for given queries and queues the found ones

```$skip``` (mod command) skips whatever is playing to the next thing in the queue

```permission user``` (admin command) gives/removes access to specific mod commands. 

possible ways to write it:
```
permissions: "add", "skip", "poll", "restart", "disallow", "allow", "trailer";
grants: "true", "1", "t", "+", "yes", "y";
removes: "false", "0", "f", "-", "no", "n";
```

fx ```permission user [add:t] [skip:0] [poll:-] [allow:+] [trailer:yes]```

```permission user [all:t]``` (admin command) removes/gives access to all mod commands, still needs a grant/remove symbol



### Adding new commands
in the folder _bin/commands/_

add a new js file looking something like:

```
const Command = require('../structure/Command');
const rank = require('../structure/Ranks');

module.exports = new Command(
    rank.guest, // or whatever rank should be needed to use the command
    'description of what and how this command works',
    /**
     * @param {CytubeBot} bot
     * @param {Message} message
     */
    (bot, message) => {
        // command functionality
    }
)
```

For full view of CytubeBot and Message it is suggested to look in their respective class files

afterwards this command has to be added to the _/structure/CommandDictionary.js_ as such:

```
const commands = {
    commandname: require('../commands/CommandName'),
    ...
}
```

That is all that needs to be done to add new commands