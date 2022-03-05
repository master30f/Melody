import { Command } from "../../client/Command";

export const command = new Command({
    category: "Test",
    description: "Pong!",

    args: [],
    execute: async (self, message, args, client) => {
        client.client.destroy()
    }
})