const { default: makeWASocket, useMultiFileAuthState, delay, DisconnectReason } = require("@whiskeysockets/baileys");
const pino = require('pino');
const { Boom } = require('@hapi/boom');

// --- ඔබේ නිවැරදි විස්තර ---
const OWNER_NAME = "Nimesha"; 
const BOT_NAME = "NM 2026";
const OWNER_NUMBER = "94784776100";
// -----------------------

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_session');
    const conn = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: true
    });

    conn.ev.on('creds.update', saveCreds);

    conn.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) startBot();
        } else if (connection === 'open') {
            console.log('✅ ' + BOT_NAME + ' සාර්ථකව සම්බන්ධ වුණා!');
        }
    });

    conn.ev.on('messages.upsert', async m => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;
        const from = msg.key.remoteJid;
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";

        if (text.toLowerCase() === '.menu') {
            const menu = `╭─── [ *${BOT_NAME}* ] ───╼
│
│ 👤 *Owner:* ${OWNER_NAME}
│ 📜 *Bot Name:* ${BOT_NAME}
│ 📞 *Number:* ${OWNER_NUMBER}
│
│ 🛠️ *COMMANDS:*
│ .alive - බොට් පණ ඇතිද බැලීමට
│ .ping - බොට්ගේ වේගය බැලීමට
│
╰━━━━━━━━━━━━━━╼`;
            await conn.sendMessage(from, { text: menu });
        }

        if (text.toLowerCase() === '.alive') {
            await conn.sendMessage(from, { text: '*' + BOT_NAME + '* is alive now! ✅' });
        }
    });
}
startBot();
