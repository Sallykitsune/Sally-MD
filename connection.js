const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys")

const pino = require("pino")
const readline = require("readline")

async function question(text) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })

    return new Promise(resolve => {
        rl.question(text, answer => {
            rl.close()
            resolve(answer)
        })
    })
}

async function startConnection() {

    const { state, saveCreds } = await useMultiFileAuthState("./session")

    const { version } = await fetchLatestBaileysVersion()

    const sock = makeWASocket({
        version,
        logger: pino({ level: "silent" }),
        auth: state,
        browser: ["Ubuntu", "Chrome", "20.0.04"]
    })

    if (!sock.authState.creds.registered) {

        const phone = await question("Masukkan nomor WA (62xxxx): ")

        const code = await sock.requestPairingCode(phone)

        console.log(`\nPAIRING CODE: ${code}\n`)
    }

    sock.ev.on("creds.update", saveCreds)

    sock.ev.on("connection.update", (update) => {

        const { connection, lastDisconnect } = update

        if (connection === "close") {

            const shouldReconnect =
                lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut

            console.log("Connection closed")

            if (shouldReconnect) {
                startConnection()
            }

        } else if (connection === "open") {
            console.log("Bot Connected ✅")
        }

    })

    return sock
}

module.exports = startConnection