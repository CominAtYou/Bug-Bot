import { CODE_BLUE } from '../../../lib/values';
import { Message, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageActionRowComponentBuilder } from "discord.js"
import { sendMessageError } from "../../../lib/util/timeoutError";
import { remove } from '../inProgressReports';
import questionTwo from './questionTwo';
import generateButtonID from '../../../lib/util/buttonIDs';

export default async function questionOne(message: Message) {
    const embed = new EmbedBuilder()
        .setTitle("Submit a Bug")
        .setColor(CODE_BLUE)
        .setDescription("Congrats, you've discovered a bug in one of our games! Before you report it, there's a few things we need you to do.\nFirst off, **is your bug already listed on our bug tracker?**")
        .setFooter({text: "Session will auto-close after 5 mintues of activity."});

        const buttonYes = generateButtonID();
        const buttonNo = generateButtonID();

        const actionRow = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
            new ButtonBuilder().setCustomId(buttonYes).setLabel("Yes").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId(buttonNo).setLabel("No").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel("Bug Tracker").setURL("https://www.example.com")
        );

        const questionMessage = await message.channel.send({ embeds: [embed], components: [actionRow] });
        // const filter = () => true;

        try {
            var collectedInteraction = await questionMessage.awaitMessageComponent({ time: 1000 * 60 * 5 });
        }
        catch {
            sendMessageError(5, message);
            remove(message.author.id);
            return;
        }

        if (collectedInteraction.customId === buttonYes) {
            const embed = new EmbedBuilder()
                .setTitle("Submit a Bug")
                .setColor(CODE_BLUE)
                .setDescription("Alright then, there's nothing that you need to do since we're already aware of it.");

            await collectedInteraction.update({ embeds: [embed], components: [] });
            remove(message.author.id);
            return;
        }

        await questionTwo(message, collectedInteraction);

}
