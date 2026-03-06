const startConnection = require("./connection")
const commandHandler = require("./handler/command")
const { smsg } = require("./lib_modules/serialized")

async function startBot(){

const sock = await startConnection()

sock.ev.on("messages.upsert", async ({ messages }) => {

try{

let msg = messages[0]

if (!msg.message) return

let m = smsg(sock, msg)

await commandHandler(sock, m)

}catch(err){

console.log("ERROR:", err)

}

})

}

startBot()
