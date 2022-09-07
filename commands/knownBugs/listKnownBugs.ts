import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import KnownBugEntry from "../../lib/KnownBugEntry";
import { CODE_BLUE } from "../../lib/values";

export default async function listKnownBugs(interaction: ChatInputCommandInteraction) {
    const knownBugsArr = (require(__dirname + '/activeBugs.json') as KnownBugEntry[]).filter(i => i.expires > Date.now());

    if (knownBugsArr.length === 0) {
        await interaction.reply({ content: "There doesn't seem to be any known bugs right now.", ephemeral: true });
        return;
    }

    const embed = new EmbedBuilder()
        .setTitle("Known Bugs")
        .setColor(CODE_BLUE)
        .setDescription(knownBugsArr.map((i, index) => `**${index + 1}.** ${i.content}`).join("\n"));

    await interaction.reply({ embeds: [embed] });
}
