import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import KnownBugEntry from "../../lib/KnownBugEntry";
import { CODE_BLUE } from "../../lib/values";
import { readFile } from "fs/promises";

export default async function listKnownBugs(interaction: ChatInputCommandInteraction) {
    const now = Math.floor(Date.now() / 1000);
    const json = (await readFile(`${process.cwd()}/activeBugs.json`)).toString();

    const knownBugsArr = (JSON.parse(json) as KnownBugEntry[]).filter(i => i.expires > now);

    if (knownBugsArr.length === 0) {
        await interaction.reply({ content: "There doesn't seem to be any known bugs right now." });
        return;
    }

    const embed = new EmbedBuilder()
        .setTitle("Known Bugs")
        .setColor(CODE_BLUE)
        .setDescription(knownBugsArr.map((i, index) => `**${index + 1}.** ${i.content}`).join("\n"));

    await interaction.reply({ embeds: [embed] });
}
