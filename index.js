const startConnection = require("./connection")
const commandHandler = require("./handler/command")

async function startBot() {

    const sock = await startConnection()

    sock.ev.on("messages.upsert", async ({ messages }) => {

        try {

            const msg = messages[0]

            if (!msg.message) return
            if (msg.key.fromMe) return

            await commandHandler(sock, msg)

        } catch (err) {
            console.log("Message Error:", err)
        }

    })

}

startBot()