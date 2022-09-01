module.exports = {
    name: 'interactionCreate',
    async call(interaction, client) {
        if (!interaction.isChatInputCommand()) return;
        
        const { commands } = client;
        const { commandName } = interaction;
        const cmd = commands[commandName];
        if (!cmd) return;
    
        try {
            await cmd(interaction, client);
        } catch (error) {
            await interaction.reply({
                content: `error: ${error}`,
                ephemeral: true
            });
        }
    }
}