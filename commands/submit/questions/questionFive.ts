import { CODE_BLUE, ERROR_RED, PREFIX } from '../../../lib/values';
import { Message, EmbedBuilder } from "discord.js"
import stepCollector from '../../../lib/util/stepCollector';
import { sendMessageError } from "../../../lib/util/timeoutError";
import { remove } from '../inProgressReports';
import questionSix from './questionSix';

export default async function questionFive(message: Message, data: { title: string }) {
    const embed = new EmbedBuilder()
        .setTitle("What steps do you need to take to make the bug happen?")
        .setColor(CODE_BLUE)
        .setDescription("You need to make these steps as clear as possible. Remember, these are the steps that we use to be able to get your bug onto the bug tracker.\n\n**Be sure to send each step as an individual message, with each step being 100 characters or less, and send** `done` **when you are finished.**")
        .setFooter({ text: "Session will auto-close after 5 minutes of inactivity." });

    await message.channel.send({ embeds: [embed] });

    try {
        var steps = await stepCollector(message);
    }
    catch (e) {
        if (e === "Collector expired") {
            sendMessageError(5, message);
        }
        else if (e === "Steps too long" || e === "Combined array too long") {
            new EmbedBuilder()
                .setTitle("Submit a Bug")
                .setColor(ERROR_RED)
                .setDescription(`Please shorten each step to less than 100 characters, and run the bot again with the command \`${PREFIX}submit\`.`);

            await message.channel.send({ embeds: [embed] });
        }

        remove(message.author.id);
        return;
    }

    await questionSix(message, { title: data.title, steps: steps });
}
