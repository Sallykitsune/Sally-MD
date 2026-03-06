module.exports = async (conn, m) => {

const body = m.body || ""

const prefixRegex = /[.!#÷×/]/;

const prefix = prefixRegex.test(body)
? body.match(prefixRegex)[0]
: "."

const isCmd = body.startsWith(prefix)

if (!isCmd) return

const command = body.slice(prefix.length).trim().split(" ")[0].toLowerCase()
const args = body.trim().split(/ +/).slice(1)
const q = args.join(" ")

switch(command){

case "ping":

m.reply("Pong 🏓")

break

case "menu":

m.reply(`
╭───「 BOT MENU 」
│
│ .ping
│ .menu
│
╰────────────
`)

break

}

}
