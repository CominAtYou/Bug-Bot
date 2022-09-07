import { CODE_BLUE } from '../../../lib/values';
import { Message, EmbedBuilder, MessageComponentInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageActionRowComponentBuilder } from "discord.js"
import { sendInteractionError } from "../../../lib/util/timeoutError";
import { remove } from '../inProgressReports';
import questionFour from './questionFour';
import generateButtonID from '../../../lib/util/buttonIDs';
import KnownBugEntry from '../../../lib/KnownBugEntry';

export default async function questionThree(message: Message, interaction: MessageComponentInteraction) {
    const knownBugsArr = (require('../../../lib/activeBugs.json') as KnownBugEntry[]).filter(i => i.expires > Date.now());

    if (knownBugsArr.length === 0) {
        await questionFour(message, interaction);
        return;
    }

    const embed = new EmbedBuilder()
        .setTitle('Is your bug related to any of the following?')
        .setColor(CODE_BLUE)
        .setFooter({ text: "Session will expire in 5 minutes." })
        .setDescription(knownBugsArr.map((i, index) => `**${index + 1}.** ${i.content}`).join("\n"));

    const buttonYes = generateButtonID();
    const buttonNo = generateButtonID();

    const row = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
        new ButtonBuilder().setCustomId(buttonYes).setLabel('Yes').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId(buttonNo).setLabel('No').setStyle(ButtonStyle.Secondary)
    );

    await interaction.update({ embeds: [embed], components: [row] });

    try {
        var response = await interaction.channel.awaitMessageComponent({ time: 300000 });
    }
    catch {
        sendInteractionError(5, interaction);
        remove(interaction.user.id);
        return;
    }

    if (response.customId === buttonYes) {
        const embed = new EmbedBuilder()
            .setTitle("Submit a Bug")
            .setDescription("Alright then! We're already aware of the bug, and are working on it. No need for you to do anything else.")
            .setColor(CODE_BLUE)

        await response.update({ embeds: [embed], components: [] });
        return;
    }

    await questionFour(message, response);
}
