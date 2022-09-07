import { ChatInputCommandInteraction } from "discord.js";
import addBug from "./addBug";
import removeBug from "./removeBug";
import listKnownBugs from "./listKnownBugs";

export default async function knownBugs(interaction: ChatInputCommandInteraction) {
    const command = interaction.options.getSubcommand(true);
    
    if (command === "add") {
        await addBug(interaction);
    }
    else if (command === "remove") {
        await removeBug(interaction);
    }
    else if (command === "list") {
        await listKnownBugs(interaction);
    }
}
