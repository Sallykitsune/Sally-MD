const config = require("../config")

async function commandHandler(sock, msg) {

    try {

        const text =
            msg.message?.conversation ||
            msg.message?.extendedTextMessage?.text

        if (!text) return

        if (!text.startsWith(config.prefix)) return

        const args = text.slice(1).trim().split(/ +/)
        const command = args.shift().toLowerCase()

        const from = msg.key.remoteJid

        switch (command) {

            case "ping":

                await sock.sendMessage(from, {
                    text: "🏓 Pong!"
                })

            break


            case "menu":

                await sock.sendMessage(from, {
                    text: `
╭───「 ${config.botName} 」
│
│ .ping
│ .menu
│
╰────────────
`
                })

            break


            default:
                sock.sendMessage(from, {
                    text: "Command tidak ditemukan"
                })

        }

    } catch (err) {
        console.log("Handler Error:", err)
    }

}

module.exports = commandHandler