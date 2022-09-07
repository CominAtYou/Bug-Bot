import { CODE_BLUE, ERROR_RED, PREFIX } from '../../../lib/values';
import { Message, MessageComponentInteraction, EmbedBuilder } from "discord.js"
import { sendInteractionError, sendMessageError } from "../../../lib/util/timeoutError";
import { remove } from '../inProgressReports';
import { attachmentCollector } from '../../../lib/util/attachmentCollector';
import questionTen from './questionTen';

export default async function questionEight(message: Message, collectedInteraction: MessageComponentInteraction, data: { title: string, steps: string, expected: string, actual: string, game: string }) {
    const embed = new EmbedBuilder()
        .setTitle("Do you have any screenshots or video of the bug?")
        .setColor(CODE_BLUE)
        .setDescription("Screenshots or video recordings of the bug help us quickly identify the bug and fix it, so if you have any, please send them in this DM, or if the file sizes are too large, you can upload them to [Imgur](https://imgur.com/upload) for images or [Streamable](https://streamble.com) for videos. If you don't have any screenshots or videos to send, just send `done` in this DM.\n\n**Please send each of your screenshots/videos or URLs as an individual message, then send** `done` **when you are finished.**")
        .setFooter({ text: "Session will auto-close after 10 minutes of inactivity." });

    await collectedInteraction.update({ embeds: [embed], components: [] });

    try {
        var attachments = await attachmentCollector(message);
    }
    catch (e) {
        if (e === "Collector expired") {
            sendInteractionError(10, collectedInteraction);
        }
        else if (e === "Attachment URL too long") {
            new EmbedBuilder()
                .setTitle("One of the URLs you submitted was too long.")
                .setColor(ERROR_RED)
                .setDescription(`Please shorten each URL to less than 175 characters, and try again by running the bot again with the command \`${PREFIX}submit\`.`);

            await message.channel.send({ embeds: [embed] });
        }
        else if (e === "CDN attachment URL too long") {
            new EmbedBuilder()
                .setTitle("The name of one of the files you uploaded was too long.")
                .setColor(ERROR_RED)
                .setDescription(`Please give the file a shorter name (single letters work best, e.g. "e.mp4"), and try again by running the bot again with the command \`${PREFIX}submit\`.`);

            await message.channel.send({ embeds: [embed] });
        }

        remove(message.author.id);
        return;
    }

    await questionTen(message, { title: data.title, steps: data.steps, expected: data.expected, actual: data.actual, game: data.game, attachments: attachments });
}
