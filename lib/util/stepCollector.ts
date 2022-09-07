import { Message } from "discord.js";

export default function stepCollector(message: Message) {
    return new Promise<string>((resolve, reject) => {
        let expired = true;
        const collector = message.channel.createMessageCollector({ time: 1000 * 60 * 5, max: 10 });

        collector.on('collect', m => {
            if (m.content.toLowerCase() === 'done') {
                expired = false;
                collector.stop();
            }
        });

        collector.on('end', collected => {
            if (expired === true) {
                reject("Collector expired");
            }
            else if (collected.first().content.toLowerCase() === "done") {
                resolve("No steps provided");
            }
            else {
                const collectionArray: string[] = [];
                collected.forEach(collectedMessage => {
                    if (collectedMessage.content.length > 99) reject("Steps too long");
                    collectionArray.push(collectedMessage.content);
                });

                collectionArray.pop(); // remove 'done'
                const stepsStr = collectionArray.join('\n• ');
                if (stepsStr.length > 1024) reject("Combined array too long");

                resolve(`• ${stepsStr.replace(/https?:\/\/[^\s]+/gi, '[link redacted]')}`);
            }
        });
    });
}
