const { query } = require('../utils/db.js')

let last_update = {
    user_id: 0,
    timestamp: 0
};

module.exports = {
    name: 'presenceUpdate',
    async call(oldPresence, newPresence, client) {
        const user = newPresence.user;
        if (last_update.user_id == user.id && (Date.now() - last_update.timestamp) < 1000)
            return;

        last_update.user_id = user.id;
        last_update.timestamp = Date.now();
        if (!oldPresence || oldPresence.status != newPresence.status) {
            console.log(`${user.username} ${newPresence.status}`);
            query(
                `INSERT INTO users (id, name, discriminator, avatar_url)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (id) DO
                UPDATE SET name = EXCLUDED.name, discriminator = EXCLUDED.discriminator, avatar_url = EXCLUDED.avatar_url;`,
                [user.id, user.username, user.discriminator, user.displayAvatarURL()]).then(() => {
                    query(
                        `INSERT INTO user_status (user_id, status)
                        VALUES ($1, $2);`,
                        [user.id, newPresence.status]);
                });
        }
    }
}