import { ButtonInteraction, ModalBuilder, TextInputBuilder, ActionRowBuilder, ModalActionRowComponentBuilder, TextInputStyle, ModalSubmitInteraction, GuildTextBasedChannel } from 'discord.js';
import { ReportStatus } from '../lib/reportStatus';
import * as sql from "../lib/sqlInstance";
import { ALLOWED_ROLES, DENIED_REPORTS_CHANNEL_ID, GUILD_ID } from '../lib/values';

export async function displayDenyDialog(interaction: ButtonInteraction) {
    const member = interaction.client.guilds.cache.get(GUILD_ID).members.cache.get(interaction.user.id);
    let isAllowed = false;

    for (const role of ALLOWED_ROLES) {
        if (member.roles.cache.map(r => r.id).includes(role)) {
            isAllowed = true;
            break;
        }
    }

    if (!isAllowed) {
        await interaction.deferUpdate(); // ignore the interaction
        return;
    }

    const modal = new ModalBuilder()
        .setTitle("Deny Report")
        .setCustomId(`DENY_${interaction.message.id}`)

    const textInput = new TextInputBuilder()
        .setCustomId("comment")
        .setLabel("Add a comment (optional)")
        .setRequired(false)
        .setMaxLength(256 - `:x: ${interaction.user.tag}: `.length)
        .setStyle(TextInputStyle.Short);

        const actionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(textInput);

        modal.addComponents(actionRow);

    await interaction.showModal(modal);
}

export async function deny(interaction: ModalSubmitInteraction) {
    const data = interaction.customId.split("_");
    const messageId = data[1];

    const message = await interaction.channel.messages.fetch(messageId);
    const reportID = (await sql.query("SELECT ReportID FROM reports WHERE MessageID = ?", [messageId]))[0]["ReportID"];

    const channel = interaction.client.channels.cache.get(DENIED_REPORTS_CHANNEL_ID) as GuildTextBasedChannel;
    const embed = message.embeds[0];

    const comment = interaction.fields.getTextInputValue("comment");

    embed.fields[5].name === "Denied by";
    embed.fields[5].value = `:x: ${interaction.user.tag}${comment ? `: ${comment}` : ""}`;
    const newMessage = await channel.send({ embeds: [embed] });

    try {
        sql.query(`UPDATE reports SET Status = ?, ApproverID = ?, ChannelID = ?, MessageID = ? WHERE MessageID = ?`, [ReportStatus.DENIED, interaction.user.id, DENIED_REPORTS_CHANNEL_ID, newMessage.id, messageId]);
    }
    catch {
        await interaction.reply({ content: "An error occurred while trying to deny this report. Try and give it another shot.", ephemeral: true });
        await newMessage.delete();
        return;
    }

    await message.delete();
    interaction.reply({ content: `You've successfully denied report ${reportID}.`, ephemeral: true });
}
