import { CODE_BLUE, ERROR_RED, PREFIX, } from '../../../lib/values';
import { Message, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageActionRowComponentBuilder } from "discord.js"
import { sendMessageError } from "../../../lib/util/timeoutError";
import { remove } from '../inProgressReports';
import createReport from '../createReport';
import generateButtonID from '../../../lib/util/buttonIDs';

export default async function questionTen(message: Message, data: { title: string, steps: string, expected: string, actual: string, game: string, attachments: string }) {
    const summaryEmbed = new EmbedBuilder()
        .setTitle("Everything look good?")
        .setColor(CODE_BLUE)
        .setDescription("Below is all the information you provided in your report. Look everything over, and if all looks well, select 'yes' to send your report, or 'no' if something is wrong.")
        .setFooter({ text: "Session will auto-close after 5 minutes of inactivity." })
        .addFields(
            {
                name: "Title",
                value: data.title,
            },
            {
                name: "Steps to Reproduce",
                value: data.steps,
            },
            {
                name: "Expected Result",
                value: data.expected,
            },
            {
                name: "Actual Result",
                value: data.actual,
            },
            {
                name: "Spotted in",
                value: data.game,
            },
            {
                name: "Attachments",
                value: data.attachments,
            }
        );

    const buttonYes = generateButtonID();
    const buttonNo = generateButtonID();

    const actionRow = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
        new ButtonBuilder().setLabel("Yes").setStyle(ButtonStyle.Secondary).setCustomId(buttonYes),
        new ButtonBuilder().setLabel("No").setStyle(ButtonStyle.Danger).setCustomId(buttonNo)
    );

    const embedMessage = await message.channel.send({ embeds: [summaryEmbed], components: [actionRow] });

    try {
        var collectedInteraction = await message.channel.awaitMessageComponent({ time: 1000 * 60 * 5 });
    }
    catch {
        sendMessageError(5, message);
        remove(message.author.id);
        return;
    }

    if (collectedInteraction.customId === buttonYes) {
        try {
            var messageURL = await createReport(message, data);
        }
        catch (e) {
            summaryEmbed.setTitle("Something went wrong!")
            .setColor(ERROR_RED)
            .setDescription("We were unable to submit your report due to an internal error. Try giving it another shot, and if that doesn't work, try again later. Here's your report for future reference:")
            .setFooter(null);

            await embedMessage.edit({ embeds: [summaryEmbed], components: [] });

            console.error(e);
            return;
        }

        summaryEmbed.setTitle("Report Submitted!").setDescription(`Your report was successfully submitted on <t:${Math.floor(new Date().getTime() / 1000)}:f>.`).setFooter(null).setColor(0x47B582);

        const viewLinkRow = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
            new ButtonBuilder().setLabel("View Report").setStyle(ButtonStyle.Link).setURL(messageURL)
        );


        await collectedInteraction.update({ embeds: [summaryEmbed], components: [viewLinkRow] });
        remove(message.author.id);
        return;
    }
    else {
        summaryEmbed.setTitle("Report Discarded")
        .setColor(ERROR_RED)
        .setDescription(`Your report has been discarded. If you need to make any changes, please re-run the bot with \`${PREFIX}submit\` and submit a new report with the necessary changes.`)

        await collectedInteraction.update({ embeds: [summaryEmbed], components: [] });
    }
}
