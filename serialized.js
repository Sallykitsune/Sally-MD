const { proto, getContentType, areJidsSameUser, jidNormalizedUser, downloadMediaMessage } = require("@whiskeysockets/baileys")

// detect device
function getDevice(id = '') {
if (id.length > 21) return 'android'
if (id.startsWith('3A')) return 'ios'
if (id.startsWith('3EB0')) return 'web'
return 'unknown'
}

exports.smsg = (conn, m, store) => {
if (!m) return m

let M = proto.WebMessageInfo
m = M.fromObject(m)

if (m.key) {

m.id = m.key.id
m.device = getDevice(m.id)
m.isBot = m.id?.startsWith("BAE5")

m.chat = m.key.remoteJid
m.isGroup = m.chat.endsWith('@g.us')

m.sender = conn.decodeJid(
m.key.fromMe
? conn.user.id
: m.key.participant
? m.key.participant
: m.key.remoteJid
)

m.fromMe = m.key.fromMe || areJidsSameUser(m.sender, jidNormalizedUser(conn.user.id))

if (m.isGroup) m.participant = conn.decodeJid(m.key.participant) || ''

}

if (m.message) {

m.mtype = getContentType(m.message)
m.msg = m.message[m.mtype]

if (m.mtype === 'viewOnceMessage') {
m.mtype = getContentType(m.message.viewOnceMessage.message)
m.msg = m.message.viewOnceMessage.message[m.mtype]
}

m.body =
m.message.conversation ||
m.msg?.text ||
m.msg?.caption ||
m.msg?.contentText ||
m.msg?.selectedDisplayText ||
m.msg?.title ||
""

m.text = m.body

// quoted
let quoted = m.quoted = m.msg?.contextInfo?.quotedMessage || null

m.mentionedJid = m.msg?.contextInfo?.mentionedJid || []

if (m.quoted) {

let type = Object.keys(quoted)[0]

m.quoted = m.quoted[type]

if (typeof m.quoted === 'string') {
m.quoted = { text: m.quoted }
}

m.quoted.mtype = type
m.quoted.id = m.msg.contextInfo.stanzaId
m.quoted.chat = m.msg.contextInfo.remoteJid || m.chat
m.quoted.sender = conn.decodeJid(m.msg.contextInfo.participant)

m.quoted.text =
m.quoted.text ||
m.quoted.caption ||
m.quoted.conversation ||
""

m.getQuotedObj = async () => {

if (!m.quoted.id) return false

let q = await store.loadMessage(m.chat, m.quoted.id, conn)

return exports.smsg(conn, q, store)

}

let vM = m.quoted.fakeObj = M.fromObject({

key: {
remoteJid: m.quoted.chat,
fromMe: m.quoted.fromMe,
id: m.quoted.id
},

message: quoted,

...(m.isGroup ? { participant: m.quoted.sender } : {})

})

m.quoted.delete = () => conn.sendMessage(m.quoted.chat, { delete: vM.key })

m.quoted.copyNForward = (jid, forceForward = false, options = {}) =>
conn.copyNForward(jid, vM, forceForward, options)

m.quoted.download = () => downloadMediaMessage(m.quoted, 'buffer', {}, { conn })

}

// download media
if (m.msg?.url) {
m.download = () => downloadMediaMessage(m.msg, 'buffer', {}, { conn })
}

}

// reply helper
m.reply = (text, chatId = m.chat, options = {}) => {

return Buffer.isBuffer(text)
? conn.sendMessage(chatId, { document: text }, { quoted: m, ...options })
: conn.sendMessage(chatId, { text }, { quoted: m, ...options })

}

// copy message
m.copy = () => exports.smsg(conn, M.fromObject(M.toObject(m)))

// forward
m.copyNForward = (jid = m.chat, forceForward = false, options = {}) =>
conn.copyNForward(jid, m, forceForward, options)

return m
}
