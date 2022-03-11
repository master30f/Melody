import { Command } from "../../client/Command";

export const command = new Command({
    category: "Test",
    description: "Shuts the bot down",
    
    args: [],
    execute: async (self, context, args, client) => {
        client.client.destroy()
    }
})