import { Client, Partials, InteractionType } from 'discord.js';
import { chatInputCommands, buttonCommands, textCommands, modalInteractions } from "./lib/commandRouter";
import * as sql from "./lib/sqlInstance";
import { PREFIX } from './lib/values';
import { TOKEN } from "./lib/secrets.json";

const client = new Client({ intents: [ 'GuildMessages', 'Guilds', 'GuildMembers', 'DirectMessages' ], partials: [ Partials.Message, Partials.Channel ] });

client.on('messageCreate', async message => {
    if (!message.content.startsWith(PREFIX) || message.author.bot) return;
    const args = message.content.slice(PREFIX.length).trim().split(/ +/); // stuff to throw arguments into an array
    const command = args.shift().toLowerCase(); // extract command from message

    if (textCommands.has(command)) {
        await (textCommands.get(command)(message, args));
    }
});

client.on('interactionCreate', async interaction => {
    if (interaction.isChatInputCommand()) {
        if (chatInputCommands.has(interaction.commandName)) {
            await (chatInputCommands.get(interaction.commandName)(interaction));
        }
    }
    else if (interaction.isButton()) {
        if (buttonCommands.has(interaction.customId)) {
            await (buttonCommands.get(interaction.customId)(interaction));
        }
    }
    else if (interaction.type === InteractionType.ModalSubmit) {
        const modalCommand = interaction.customId.split("_")[0];
        if (modalInteractions.has(modalCommand)) {
            await (modalInteractions.get(modalCommand)(interaction));
        }
    }
});

client.once('ready', () => {
    console.log("\x1b[32m[READY]", `\x1b[0mLogged in as ${client.user.tag}`);
});

sql.init();

client.login(TOKEN);
