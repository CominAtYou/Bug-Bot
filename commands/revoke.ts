import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, GuildTextBasedChannel, MessageActionRowComponentBuilder } from "discord.js";
import { ReportStatus } from "../lib/reportStatus";
import * as sql from "../lib/sqlInstance";
import { SUBMISSION_CHANNEL_ID } from "../lib/values";

export default async function revoke(interaction: ChatInputCommandInteraction) {
    const id = interaction.options.getInteger("id");

    let entry;
    try {
        entry = await sql.query(`SELECT * FROM reports WHERE ReportID = ?`, [id]);
    }
    catch (e) {
        console.error(e);
        interaction.reply({ content: "An error occurred while trying get the report. Try and give it another shot.", ephemeral: true });
        return;
    }

    if (entry.length === 0) {
        interaction.reply({ content: "That report doesn't exist.", ephemeral: true });
        return;
    }

    if (entry[0].Status === ReportStatus.AWAITING_APPROVAL) {
        interaction.reply({ content: "That report hasn't been approved or denied yet!", ephemeral: true });
        return;
    }

    if (entry[0]["ApproverID"] !== interaction.user.id) {
        const status = entry[0]["Status"] === ReportStatus.APPROVED ? "approved" : "denied";
        interaction.reply({ content: `That report wasn't ${status} by you!`, ephemeral: true });
        return;
    }

    const channel = await interaction.client.channels.fetch(entry[0]["ChannelID"]) as GuildTextBasedChannel;
    const message = await channel.messages.fetch(entry[0]["MessageID"]);
    const embed = message.embeds[0];

    embed.fields[5].name = "Status";
    embed.fields[5].value = "Awaiting approval";

    const actionRow = new ActionRowBuilder<MessageActionRowComponentBuilder>()
    .addComponents([
        new ButtonBuilder()
            .setLabel("Approve")
            .setStyle(ButtonStyle.Success)
            .setCustomId(`APPROVE_REPORT`),
        new ButtonBuilder()
            .setLabel("Deny")
            .setStyle(ButtonStyle.Secondary)
            .setCustomId(`DENY_REPORT`)
    ]);


    const newChannel = await interaction.client.channels.fetch(SUBMISSION_CHANNEL_ID) as GuildTextBasedChannel;
    const newMessage = await newChannel.send({ embeds: [embed], components: [actionRow] });

    try {
        await sql.query(`UPDATE reports SET Status = ?, ApproverID = NULL, ChannelID = ?, MessageID = ? WHERE ReportID = ?`, [ReportStatus.AWAITING_APPROVAL, SUBMISSION_CHANNEL_ID, newMessage.id, id]);
    }
    catch {
        await interaction.reply({ content: "An error occurred while trying to revoke your stance on this report. Try and give it another shot.", ephemeral: true });
        await newMessage.delete();
        return;
    }

    await message.delete();
    await interaction.reply({ content: "Successfully revoked your stance on this report.", ephemeral: true });
}
