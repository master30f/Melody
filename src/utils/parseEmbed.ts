import { MessageEmbed } from "discord.js";
import { readFileSync } from "fs"
import { join } from "path"

type Option = (string | object) | (string | object)[]

export interface EmbedOptions {
    [propName: string]: Option
}

function stringify(option: Option): string {
    if (typeof option == "string") {
        return option.replace(/"/g, "\\\"").replace(/\n/g, "\\n")
    }
    if (typeof option == "object") {
        if (option instanceof Array) {
            const itemReps = option.map(item => stringify(item))
            return `[${itemReps.join(",")}]`
        }
        return JSON.stringify(option)
    }
    throw new Error(`Object ${option} can not be strigified`)
}

export function parseEmbed(name: string, options?: EmbedOptions): object {
    let contents = readFileSync(join(__dirname, `../../res/embeds/${name}.json`)).toString()
    let out = ""
    if (options != null) {
        let varName = ""
        let startPos = 0
        let flag = false
        let flag1 = false
        let flag2 = false
        let vars: {start: number, end: number, name: string}[] = []
        for (let i = 0; i < contents.length-1; i++) {
            const char = contents[i]
            if (flag) {
                if (char == "{") {
                    flag1 = true
                    flag = false
                }
                else if (char == "$") {
                    flag2 = true
                }
                else {
                    flag = false
                }
            }
            else if (flag1) {
                if (char == "}") {
                    let idx = i+1
                    let start = startPos
                    if (flag2) {
                        idx += 1
                        start -= 2
                    }
                    vars.push({
                        name: varName,
                        start: start,
                        end: idx
                    })
                    flag1 = false
                    flag2 = false
                    varName = ""
                } else {
                    varName += char
                }
            }
            else if (char == "$") {
                startPos = i
                flag = true
            }
        }
        let zero = 0
        for (const variable of vars) {
            const before = contents.substring(zero, variable.start)
            out += before + stringify(options[variable.name])
            zero = variable.end
        }
        out += contents.substring(zero)
    } else {
        out = contents
    }
    try {
        return JSON.parse(out)
    } catch (error) {
        console.log(out)
        throw error
    }
}