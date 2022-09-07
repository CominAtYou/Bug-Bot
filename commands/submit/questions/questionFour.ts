import { CODE_BLUE, ERROR_RED, PREFIX } from '../../../lib/values';
import { Message, EmbedBuilder, MessageComponentInteraction } from "discord.js"
import { sendInteractionError } from "../../../lib/util/timeoutError";
import { remove } from '../inProgressReports';
import questionFive from './questionFive';

export default async function questionFour(message: Message, interaction: MessageComponentInteraction) {
    const embed = new EmbedBuilder()
        .setTitle("Describe your bug in a sentence like you're telling a friend about it.")
        .setColor(CODE_BLUE)
        .setDescription(`Make this as descriptive as possible and avoid things like "it glitches" or "it's broken". The more specific you are, the better. This must be 10 steps or less and less than 256 characters, including spaces.`)
        .setFooter({ text: "Session will auto-close after 5 minutes of inactivity." });

        await interaction.update({ embeds: [embed], components: [] });

    try {
        var collectedMessage = await message.channel.awaitMessages({ time: 1000 * 60 * 5, max: 1 });
    }
    catch {
        sendInteractionError(5, interaction);
        remove(message.author.id);
        return;
    }

    if (collectedMessage.first().content.length > 256) {
        // send an embed saying that the message is too long
        new EmbedBuilder()
            .setTitle("Submtit a Bug")
            .setColor(ERROR_RED)
            .setDescription(`Your message is too long. Please run the bot again with the command \`${PREFIX}submit\`.`);

        await message.channel.send({ embeds: [embed] });
        remove(message.author.id);
        return;
    }

    await questionFive(message, { title: collectedMessage.first().content });


}
