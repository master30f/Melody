import { Command } from "../../client/Command";

export const command = new Command({
    aliases: [
        "pp"
    ],
    description: "Puts the given song at the start of the queue",
    category: ":tools: Miscellaneous",
    
    args: [],
    execute: async (context) => {
           
    }
})