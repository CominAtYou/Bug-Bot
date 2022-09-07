import { ChatInputCommandInteraction, ActionRowBuilder, MessageActionRowComponentBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder, GuildTextBasedChannel } from "discord.js";
import { ALLOWED_ROLES, CODE_BLUE, GUILD_ID, MANAGER_ROLE_ID } from "../lib/values";
import * as sql from "../lib/sqlInstance";

export default async function nuke(interaction: ChatInputCommandInteraction) {
    const member = interaction.client.guilds.cache.get(GUILD_ID).members.cache.get(interaction.user.id);
    const isAllowed = member.roles.cache.map(r => r.id).includes(MANAGER_ROLE_ID);

    if (!isAllowed) {
        interaction.reply({ content: "You aren't allowed to do this!", ephemeral: true });
        return;
    }

    const reportID = interaction.options.getInteger("id");

    let entry;
    try {
        entry = await sql.query(`SELECT * FROM reports WHERE ReportID = ?`, [reportID]);
    }
    catch {
        interaction.reply({ content: "An error occurred while trying get the report. Try and give it another shot.", ephemeral: true });
        return;
    }

    if (entry.length === 0) {
        interaction.reply({ content: "That report doesn't exist.", ephemeral: true });
        return;
    }

    const actionRow = new ActionRowBuilder<MessageActionRowComponentBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`NUKE_YES`)
                .setLabel("Yes")
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId(`NUKE_NO`)
                .setLabel("No")
                .setStyle(ButtonStyle.Secondary)
        );

        const embed = new EmbedBuilder()
            .setTitle("Are you sure you want to delete report " + reportID + "?")
            .setDescription("You can't undo this action.")
            .setColor(CODE_BLUE)
            .setFooter({ text: "Cancelling in 60 seconds." });

    await interaction.reply({ embeds: [embed], components: [actionRow], ephemeral: true });

    try {
        var response = await interaction.channel.awaitMessageComponent({componentType: ComponentType.Button, time: 1000 * 60});
    }
    catch {
        interaction.editReply({ content: "Operation has been canceled due to inactivity.", components: [], embeds: [] });
        return;
    }

    if (response.customId === "NUKE_NO") {
        interaction.editReply({ content: "Operation has been canceled.", components: [], embeds: [] });
        return;
    }
    else {
        const channel = interaction.client.channels.cache.get(entry[0]["ChannelID"]) as GuildTextBasedChannel;
        const message = await channel.messages.fetch(entry[0]["MessageID"]);


        try {
            await sql.query(`DELETE FROM reports WHERE ReportID = ?`, [reportID]);
        }
        catch {
            interaction.editReply({ content: "An error occurred while trying to delete this report. Try and give it another shot.", components: [] });
            return;
        }

        await message.delete();
        interaction.editReply({ content: "You've successfully deleted report " + reportID + ".", components: [], embeds: [] });
    }
}
