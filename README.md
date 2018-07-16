# CytubeBot
A cytu.be moderator bot

A mention to ```https://github.com/nuclearace/CytubeBot``` that this bot was inspired from.

#### First time setup

First time app.js is run a _config.json_ file will be created and the bot crashes

fill this _config.json_ file out

from here on the bot can just be started by running app.js

### General usage when running

All logs are stored in the folder _logs_

The bot takes commands starting with ```$``` and ```!``` fx ```$help``` and ```!help```

```$help``` will give a list of available commands

```$help command``` will give a description of the individual commands

The general structure of a command is as such:

```$command text```

with some commands taking tags like:

```$about text [year:1984]``` or ```$nominate [mine]```

Some commands also take multiple arguments, these are separated by ```;``` fx:

```$choose a;b;c;d```

Lastly the bot also allows simple references to the current playlist with ```$prev```, ```$curr``` and ```$next```

like ```$about $next```

#### Adding new commands
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