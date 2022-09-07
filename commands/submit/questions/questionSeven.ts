import { CODE_BLUE, ERROR_RED, PREFIX } from '../../../lib/values';
import { Message, EmbedBuilder } from "discord.js"
import { sendMessageError } from "../../../lib/util/timeoutError";
import { remove } from '../inProgressReports';
import questionEight from './questionEight';

export default async function questionSix(message: Message, data: { title: string, steps: string, expected: string }) {
    const embed = new EmbedBuilder()
        .setTitle("What is the actual result?")
        .setColor(CODE_BLUE)
        .setDescription("What actually happens if you were to follow the steps you just listed?")
        .setFooter({ text: "Session will auto-close after 5 minutes of inactivity." });

    await message.channel.send({ embeds: [embed] });

    try {
        var collectedMessage = await message.channel.awaitMessages({ time: 1000 * 60 * 5, max: 1 });
    }
    catch {
        sendMessageError(5, message);
        remove(message.author.id);
        return;
    }

    if (collectedMessage.first().content.length > 512) {
        // send an embed saying that the message is too long
        new EmbedBuilder()
            .setTitle("Your message is too long.")
            .setColor(ERROR_RED)
            .setDescription(`Please shorten it to less than 512 characters, and run the bot again with the command \`${PREFIX}submit\`.`);

        await message.channel.send({ embeds: [embed] });
        remove(message.author.id);
        return;
    }

    await questionEight(message, { title: data.title, steps: data.steps, expected: collectedMessage.first().content, actual: collectedMessage.first().content });
}
