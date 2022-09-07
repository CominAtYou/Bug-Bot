import { Message, EmbedBuilder, TextChannel, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageActionRowComponentBuilder } from "discord.js";
import { CODE_BLUE, SUBMISSION_CHANNEL_ID } from "../../lib/values";
import * as sql from "../../lib/sqlInstance";
import { ReportStatus } from "../../lib/reportStatus";

export default async function createReport(message: Message, data: { title: string, steps: string, expected: string, actual: string, game: string, attachments: string }) {
    const submissionChannel = await message.client.channels.fetch(SUBMISSION_CHANNEL_ID) as TextChannel;

    try {
        var nextReport = (await sql.query("SELECT MAX(ReportID) FROM reports"))[0]["MAX(ReportID)"] + 1;
    }
    catch (e) {
        throw e;
    }

    const embed = new EmbedBuilder()
        .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL({ forceStatic: true }) })
        .setTitle(data.title)
        .setColor(CODE_BLUE)
        .setFooter({ text: `Report ID: ${nextReport}` })
        .setTimestamp(new Date())
        .addFields(
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
            },
            {
                name: "Status",
                value: "Awating approval"
            }
        );

    // create Approve and Deny buttons
    const actionRow = new ActionRowBuilder<MessageActionRowComponentBuilder>()
        .addComponents([
            new ButtonBuilder()
                .setLabel("Approve")
                .setStyle(ButtonStyle.Success)
                .setCustomId(`APPROVE_REPORT`),
            new ButtonBuilder()
                .setLabel("Deny")
                .setStyle(ButtonStyle.Secondary)
                .setCustomId(`DENY_REPORT`)
        ]);

    const sentMessage = await submissionChannel.send({ embeds: [embed], components: [actionRow] });

    try {
        await sql.query(`INSERT INTO reports (ReportID, ChannelID, CreatorID, MessageID, Status) VALUES (?, ?, ?, ?, ?)`, [nextReport, submissionChannel.id, message.author.id, sentMessage.id, ReportStatus.AWAITING_APPROVAL]);
        return sentMessage.url;
    }
    catch (e) {
        await sentMessage.delete();
        throw e;
    }
}
