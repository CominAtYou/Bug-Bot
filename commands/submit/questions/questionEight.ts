import { CODE_BLUE, ERROR_RED, PREFIX } from '../../../lib/values';
import { Message, EmbedBuilder, ActionRowBuilder, SelectMenuBuilder, SelectMenuInteraction, MessageActionRowComponentBuilder } from "discord.js"
import { sendMessageError } from "../../../lib/util/timeoutError";
import { remove } from '../inProgressReports';
import questionNine from './questionNine';

export default async function questionEight(message: Message, data: { title: string, steps: string, expected: string, actual: string }) {
    const embed = new EmbedBuilder()
        .setTitle("What game does this occur on?")
        .setColor(CODE_BLUE)
        .setDescription("Please specify the games where you can reproduce the bug.")
        .setFooter({ text: "Session will auto-close after 5 minutes of inactivity." });

        // Create 3 select menus.
        const selectMenu = new ActionRowBuilder<MessageActionRowComponentBuilder>()
            .addComponents(
                new SelectMenuBuilder()
                    .setCustomId('select_menu_1')
                    .setPlaceholder('Select a game')
                    .addOptions([
                        {
                            label: 'All',
                            value: 'all',
                            description: 'This bug can be reproduced on all games.',
                        },
                        {
                            label: 'Game 1',
                            value: 'game1',
                            description: 'This bug can be reproduced on Game 1.',
                        },
                        {
                            label: 'Game 2',
                            value: 'game2',
                            description: 'This bug can be reproduced on Game 2.',
                        },
                    ])
                );

    await message.channel.send({ embeds: [embed], components: [selectMenu] });

    try {
        var collectedInteraction = await message.channel.awaitMessageComponent({ time: 1000 * 60 * 5 }) as SelectMenuInteraction;
    }
    catch {
        sendMessageError(5, message);
        remove(message.author.id);
        return;
    }
    const games = { "all": "All", "game1": "Game 1", "game2": "Game 2" };
    const game = games[collectedInteraction.values[0]];

    await questionNine(message, collectedInteraction, { title: data.title, steps: data.steps, expected: data.expected, actual: data.actual, game: game });
}
