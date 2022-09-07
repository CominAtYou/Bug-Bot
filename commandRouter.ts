import { ButtonInteraction, ChatInputCommandInteraction, Message, ModalSubmitInteraction } from 'discord.js';
import { approve, displayApproveDialog } from './commands/approve';
import { deny, displayDenyDialog } from './commands/deny';
import nuke from './commands/nuke';
import revoke from './commands/revoke';
import submit from "./commands/submit/submit";
import knownBugs from './commands/knownBugs/knownBugs';

export const textCommands = new Map<string, (message: Message<boolean>, args: string[]) => Promise<void>>([
    ["submit", submit],
]);

export const chatInputCommands = new Map<string, (interaction: ChatInputCommandInteraction) => Promise<void>>([
    ["nuke", nuke],
    ["revoke", revoke],
    ["knownbugs", knownBugs],
]);

export const buttonCommands = new Map<string, (interaction: ButtonInteraction) => Promise<void>>([
    ["APPROVE_REPORT", displayApproveDialog],
    ["DENY_REPORT", displayDenyDialog]
]);

export const modalInteractions = new Map<string, (interaction: ModalSubmitInteraction) => Promise<void>>([
    ["APPROVE", approve],
    ["DENY", deny]
]);
