import { Message, ChannelType, EmbedBuilder } from 'discord.js';
import { GUILD_ID, REPORTS_DISABLED_ROLE_ID } from '../../lib/values';
import * as inProgressReports from "./inProgressReports";
import questionOne from './questions/questionOne';
import * as sql from "../../lib/sqlInstance";

const disabledMessageRateLimit: string[] = [];

export default async function submit(message: Message, args: string[]) {
    if (message.channel.type !== ChannelType.DM) return;

    if (inProgressReports.includes(message.author.id)) return;

    const guild = await message.client.guilds.fetch(GUILD_ID);

    try {
        await guild.members.fetch(message.author.id)
    }
    catch {
        message.channel.send(`You must be a member of ${guild.name} to submit a report.`);
        return;
    }

    const guildAuthor = guild.members.cache.get(message.author.id);
    if (guildAuthor.roles.cache.has(REPORTS_DISABLED_ROLE_ID)) {
        message.channel.send(`Your ability to submit bugs has been disabled by a staff member of ${guild.name}. This is most likely due to abuse of the reporting system.`);
        disabledMessageRateLimit.push(message.author.id);
        setTimeout(() => disabledMessageRateLimit.splice(disabledMessageRateLimit.indexOf(message.author.id), 1), 1000 * 5 * 60); // 5 minutes
        return;
    }

    // TODO: allow enabling/disabling the creation of bug reports - just read a json file for this or whatever.

    inProgressReports.add(message.author.id);
    await questionOne(message);
}
