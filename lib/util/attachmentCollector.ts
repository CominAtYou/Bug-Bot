import { Message } from "discord.js";
import getAttachmentDetails from "./getAttachmentDetails";

export function attachmentCollector(message: Message) {
    return new Promise<string>((resolve, reject) => {

        function urlVerifier(m: Message) {
            return m.content === '' && m.attachments.first().url !== undefined || // Checks if message has Discord attachments
                /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/i.test(m.content) || // url regex
                m.content.toLowerCase() === 'done';
        }

        let expired = true;
        const collector = message.channel.createMessageCollector({filter: urlVerifier, time: 1000 * 60 * 10, max: 5});
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
                resolve("No attachments provided");
            }
            else {
                const collectionArray: string[] = [];
                collected.forEach(collectedMessage => {
                    if (collectedMessage.content === '') {
                        collectedMessage.attachments.forEach(attachment => {
                            const fileDetails = getAttachmentDetails(attachment.url);
                            const formattedHyperlink = `[${fileDetails.fileType} (${fileDetails.hostname})](${attachment.url})`;

                            if (`[${fileDetails.fileType} (${fileDetails.hostname})](${formattedHyperlink})`.length > 175) reject("CDN attachment URL too long");
                            collectionArray.push(formattedHyperlink);
                        });
                    }
                    else {
                        const fileDetails = getAttachmentDetails(collectedMessage.content);
                        const formattedHyperlink = `[${fileDetails.fileType} (${fileDetails.hostname})](${collectedMessage.content})`;
                        if (`[${fileDetails.fileType} (${fileDetails.hostname})](${formattedHyperlink})`.length > 175) reject("Attachment URL too long");
                        collectionArray.push(formattedHyperlink);
                    }
                });

                collectionArray.pop();
                if (collectionArray.join("\n").length > 1024) reject("Combined array too long");
                resolve(collectionArray.join("\n"));
            }
        });
    });
}
