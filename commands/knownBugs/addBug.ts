import { ChatInputCommandInteraction } from "discord.js";
import { writeFile, readFile } from "fs/promises";
import KnownBugEntry from "../../lib/KnownBugEntry";

export default async function addBug(interaction: ChatInputCommandInteraction) {
    const content = interaction.options.getString("content", true);
    const index = interaction.options.getInteger("position");
    const expires = interaction.options.getInteger("expires") || 86400;

    const now = Math.floor(Date.now() / 1000);
    const json = (await readFile(`${process.cwd()}/activeBugs.json`)).toString();
    const knownBugsArr = (JSON.parse(json) as KnownBugEntry[]).filter(i => i.expires > now);

    if (knownBugsArr.length === 10) {
        await interaction.reply({ content: "The known bugs list is currently full. You'll need to remove a bug before you can add another one." });
        return;
    }

    if (index - 1 > knownBugsArr.length) {
        await interaction.reply({ content: `The position provided is longer than the list. Please provide an index that is at most ${knownBugsArr.length + 1}.` });
        return;
    }

    if (index) {
        knownBugsArr.splice(index - 1, 0, { content, expires: now + expires });
    }
    else {
        knownBugsArr.push({ content, expires: now + expires });
    }

    await writeFile(`${process.cwd()}/activeBugs.json`, JSON.stringify(knownBugsArr, null, 4));
    await interaction.reply({ content: `:white_check_mark: Bug has been added to the list. It'll automatically be removed on <t:${now + expires}>.`});
}
