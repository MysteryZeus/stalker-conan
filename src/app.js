const { Client, GatewayIntentBits } = require('discord.js');
const discord_config = require('./configs/discord.json');
const fs = require('fs');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildPresences
    ]
});
client.commands = {};
client.commandList = [];

function handleEvents() {
    for (const file of fs.readdirSync('./events').filter((f) => f.endsWith('.js'))) {
        const { name, call } = require(`./events/${file}`);
        client.on(name, (...args) => call(...args, client));
    }
}

function handleCommands() {
    for (const file of fs.readdirSync('./commands').filter((f) => f.endsWith('.js'))) {
        const { cmd, call } = require(`./commands/${file}`);
        client.commands[cmd.name] = call;
        client.commandList.push(cmd.toJSON());
    }
}

handleEvents();
handleCommands();

client.login(discord_config['token']);