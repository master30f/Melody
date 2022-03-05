import dotenv from "dotenv"
import Client from "./client/Client"
import path from "path"

dotenv.config()

let rootDir = path.resolve("./")

const client = new Client({
    commandsDir: `${rootDir}/src/commands`,
    configFile: `${rootDir}/config.json`,
    testServer: "790607991149166592"
})

if (process.env.TOKEN) {
    client.login(process.env.TOKEN)
}
else {
    console.error("TOKEN does not exist!")
}