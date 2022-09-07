import { CODE_BLUE } from '../../../lib/values';
import { Message, EmbedBuilder, MessageComponentInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageActionRowComponentBuilder } from "discord.js"
import { sendInteractionError } from "../../../lib/util/timeoutError";
import { remove } from '../inProgressReports';
import questionThree from './questionThree';
import generateButtonID from '../../../lib/util/buttonIDs';

export default async function questionTwo(message: Message, interaction: MessageComponentInteraction) {
    const embed = new EmbedBuilder()
        .setTitle("Could what your reporting be classified as a suggestion?")
        .setColor(CODE_BLUE)
        .setDescription("Here, we're looking for things that hinder your play experience or things that don't look right. Is what you're reporting a suggestion or matter of personal preference?")
        .setFooter({ text: "Session will auto-close after 5 minutes of inactivity." });

    const buttonYes = generateButtonID();
    const buttonNo = generateButtonID();

    const actionRow = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
        new ButtonBuilder().setCustomId(buttonYes).setLabel("Yes").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId(buttonNo).setLabel("No").setStyle(ButtonStyle.Secondary)
    );

    await interaction.update({ embeds: [embed], components: [actionRow] });

    try {
        var collectedInteraction = await interaction.channel.awaitMessageComponent({ time: 1000 * 60 * 5 });
    }
    catch {
        sendInteractionError(5, interaction);
        remove(message.author.id);
        return;
    }

    if (collectedInteraction.customId === buttonYes) {
        const embed = new EmbedBuilder()
            .setTitle("Submit a Bug")
            .setColor(CODE_BLUE)
            .setDescription("Alright then, you can suggest additions or improvements to the game [here](https://www.example.com).")

        await collectedInteraction.update({ embeds: [embed], components: [] });
        remove(message.author.id);
        return;
    }

    await questionThree(message, collectedInteraction);
}
