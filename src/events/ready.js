const { REST } = require('@discordjs/rest');
const { Routes } = require('discord.js');
const discord_config = require('../configs/discord.json');

module.exports = {
    name: 'ready',
    async call(client) {
        console.log(`${client.user.tag} ready`);
        const rest = new REST({ version: '10' }).setToken(discord_config.token);
        await rest.put(Routes.applicationCommands(discord_config.id), { body: client.commandList });
        console.log('registered commands');
    }
}