import { ButtonInteraction, ModalBuilder, TextInputBuilder, ActionRowBuilder, ModalActionRowComponentBuilder, TextInputStyle, ModalSubmitInteraction, GuildTextBasedChannel } from 'discord.js';
import { ReportStatus } from '../lib/reportStatus';
import * as sql from "../lib/sqlInstance";
import { ALLOWED_ROLES, APPROVED_REPORTS_CHANNEL_ID, GUILD_ID } from '../lib/values';

export async function displayApproveDialog(interaction: ButtonInteraction) {
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
        .setTitle("Approve Report")
        .setCustomId(`APPROVE_${interaction.message.id}`)

    const textInput = new TextInputBuilder()
        .setCustomId("comment")
        .setLabel("Add a comment (optional)")
        .setRequired(false)
        .setMaxLength(256 - `:white_check_mark: ${interaction.user.tag}: `.length)
        .setStyle(TextInputStyle.Short);

    const actionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(textInput);

    modal.addComponents(actionRow);

    await interaction.showModal(modal);
}

export async function approve(interaction: ModalSubmitInteraction) {
    const data = interaction.customId.split("_");
    const messageId = data[1];

    const message = await interaction.channel.messages.fetch(messageId);
    const reportID = (await sql.query("SELECT ReportID FROM reports WHERE MessageID = ?", [messageId]))[0]["ReportID"];

    const channel = interaction.client.channels.cache.get(APPROVED_REPORTS_CHANNEL_ID) as GuildTextBasedChannel;
    const embed = message.embeds[0];

    const comment = interaction.fields.getTextInputValue("comment");

    embed.fields[5].name = "Approved by";
    embed.fields[5].value = `:white_check_mark: ${interaction.user.tag}${comment ? `: ${comment}` : ""}`;
    const newMessage = await channel.send({ embeds: [embed] });

    try {
        sql.query(`UPDATE reports SET Status = ${ReportStatus.APPROVED}, ApproverID = ${interaction.user.id}, ChannelID = ${APPROVED_REPORTS_CHANNEL_ID}, MessageID = ${newMessage.id} WHERE MessageID = '${messageId}'`);
    }
    catch {
        await interaction.reply({ content: "An error occurred while trying to approve this report. Try and give it another shot.", ephemeral: true });
        await newMessage.delete();
        return;
    }

    await message.delete();
    await interaction.reply({ content: "You've successfully approved report " + reportID + ".", ephemeral: true });
}
