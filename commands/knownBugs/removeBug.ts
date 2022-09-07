import { ChatInputCommandInteraction } from "discord.js";
import { writeFile } from "fs/promises";
import KnownBugEntry from "../../lib/KnownBugEntry";

export default async function addBug(interaction: ChatInputCommandInteraction) {
    const index = interaction.options.getInteger("index", true);
    const knownBugsArr = (require(__dirname + '/activeBugs.json') as KnownBugEntry[]).filter(i => i.expires > Date.now());

    if (knownBugsArr.length === 10) {
        await interaction.reply({ content: "The known bugs list is currently full. You'll need to remove a bug before you can add another one." });
        return;
    }

    if (index - 1 > knownBugsArr.length) {
        await interaction.reply({ content: `The position provided is longer than the list. Please provide an index that is at most ${knownBugsArr.length}.` });
        return;
    }

    knownBugsArr.splice(index - 1, 1);
    await writeFile(`${__dirname}/activeBugs.json`, JSON.stringify(knownBugsArr, null, 4));
    await interaction.reply({ content: `:white_check_mark: Bug has been removed from the list.` });
}
