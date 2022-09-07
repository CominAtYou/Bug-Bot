import { ChatInputCommandInteraction } from "discord.js";
import { writeFile } from "fs/promises";
import KnownBugEntry from "../../lib/KnownBugEntry";

export default async function addBug(interaction: ChatInputCommandInteraction) {
    const content = interaction.options.getString("content", true);
    const index = interaction.options.getInteger("position");
    const expires = interaction.options.getInteger("expires", true);

    const knownBugsArr = (require(__dirname + '/activeBugs.json') as KnownBugEntry[]).filter(i => i.expires > Date.now());

    if (knownBugsArr.length === 10) {
        await interaction.reply({ content: "The known bugs list is currently full. You'll need to remove a bug before you can add another one." });
        return;
    }

    if (index - 1 > knownBugsArr.length) {
        await interaction.reply({ content: `The position provided is longer than the list. Please provide an index that is at most ${knownBugsArr.length}.` });
        return;
    }

    if (index) {
        knownBugsArr.splice(index - 1, 0, { content, expires: Date.now() + expires * 1000 });
    }
    else {
        knownBugsArr.push({ content, expires: Date.now() + expires * 1000 });
    }

    if (knownBugsArr.map((i, index) => `**${index + 1}.** ${i.content}`).join("\n").length > 4096) {
        await interaction.reply({ content: "The list, with your addition, would be longer than 4096 characters, which is a limit Discord imposes on embeds. Please shorten your addition or remove other elements from the list, then try again." });
        return;
    }

    await writeFile(`${__dirname}/activeBugs.json`, JSON.stringify(knownBugsArr, null, 4));
    await interaction.reply({ content: `:white_check_mark: Bug has been added to the list.` });
}
