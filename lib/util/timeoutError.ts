import { Message, MessageComponentInteraction } from "discord.js";
import { PREFIX } from "../values";

export function sendMessageError(time: number, message: Message) {
    message.channel.send( `Session timed out (${time}m). Please run \`${PREFIX}submit\` again if you still wish to submit a bug.`);
}

export function sendInteractionError(time: number, interaction: MessageComponentInteraction) {
    interaction.followUp(`Session timed out (${time}m). Please run \`${PREFIX}submit\` again if you still wish to submit a bug.`);
}
