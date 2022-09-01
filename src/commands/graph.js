const { SlashCommandBuilder } = require('@discordjs/builders');
const { query } = require('../utils/db.js')
const plotly_config = require('../configs/plotly.json');
const plotly = require('plotly')(plotly_config.username, plotly_config.api_key);
const fs = require('fs');

function sendGraph(interaction, ts) {
    const fileFormat = 'png';
    let imgOpts = {
        format: fileFormat,
        width: 1000,
        height: 500
    };
    
    plotly.getImage({
        data: ts,
        layout: {
            showlegend: false,
            xaxis: {
                tickformat: '%d.%m %H:%M',
                showgrid: true
            },
            yaxis: {
                showgrid: true
            }
        }
    }, imgOpts, (error, imageStream) =>  {
        if (error)
            return console.log(error);

        const fname = (Math.random() + 1).toString(36).substring(7) + `.${fileFormat}`;
        let fileStream = fs.createWriteStream(fname);
        imageStream.pipe(fileStream);

        fileStream.on('finish', async () => {
            await interaction.reply({
                files: [fname],
                ephemeral: true
            });
            await fs.unlink(fname, () => {});
        });
    });
}

const statusColor = {
    'online': '#3BA55C',
    'dnd': '#ED4245',
    'idle': '#FAA61A',
    'offline': '#747F8D'
};

const LINE_WIDTH = 50;

module.exports = {
    cmd: new SlashCommandBuilder()
        .setName('graph')
        .addUserOption(o =>
            o.setName('user')
            .setDescription('user to add')
            .setRequired(true))
        .addUserOption(o =>
            o.setName('user2')
            .setDescription('2nd user to add')
            .setRequired(false))
        .setDescription('Graphs status data'),
    async call(interaction, client) {
        const user = interaction.options.getUser('user');
        const user2 = interaction.options.getUser('user2');
        if (user2) {
            query('SELECT user_id, timestamp, status FROM user_status WHERE user_id=$1 OR user_id=$2 ORDER BY user_id, timestamp;', [user.id, user2.id]).then((res) => {
                let ts = [];
                let names = {};
                names[user.id] = user.username;
                names[user2.id] = user2.username;

                for (let i = 1; i < res.rowCount; i++) {
                    if (res.rows[i - 1].user_id != res.rows[i].user_id)
                        continue;
                    const name = names[res.rows[i].user_id];
                    ts.push({
                        x: [new Date(res.rows[i - 1].timestamp), new Date(res.rows[i].timestamp)],
                        y: [name, name],
                        mode: 'lines',
                        line: {
                            color: statusColor[res.rows[i - 1].status],
                            width: LINE_WIDTH
                        }
                    });
                }
                sendGraph(interaction, ts);
            });
        } else {
            query('SELECT timestamp, status FROM user_status WHERE user_id=$1 ORDER BY user_id, timestamp;', [user.id]).then((res) => {            
                let ts = [];
                for (let i = 1; i < res.rowCount; i++) {
                    ts.push({
                        x: [new Date(res.rows[i - 1].timestamp), new Date(res.rows[i].timestamp)],
                        y: [user.username, user.username],
                        mode: 'lines',
                        line: {
                            color: statusColor[res.rows[i - 1].status],
                            width: LINE_WIDTH
                        }
                    });
                }
                sendGraph(interaction, ts);
            });
        }
    }
};