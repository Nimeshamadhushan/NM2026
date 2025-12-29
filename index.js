const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require("@whiskeysockets/baileys");
const pino = require('pino');

const OWNER_NAME = "Nimesha";
const BOT_NAME = "NM 2026";
const PHONE_NUMBER = "94784776100"; // ඔයාගේ නම්බර් එක

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    const { version } = await fetchLatestBaileysVersion();

    const conn = makeWASocket({
        version,
        auth: state,
        logger: pino({ level: 'silent' }),
        browser: ["Ubuntu", "Chrome", "20.0.04"]
    });

    if (!conn.authState.creds.registered) {
        setTimeout(async () => {
            let code = await conn.requestPairingCode(PHONE_NUMBER);
            code = code?.match(/.{1,4}/g)?.join("-") || code;
            console.log(`\n\n👉 YOUR PAIRING CODE: ${code}\n\n`);
        }, 3000);
    }

    conn.ev.on('creds.update', saveCreds);
    conn.ev.on('connection.update', (update) => {
        if (update.connection === 'open') console.log('✅ ' + BOT_NAME + ' Connected!');
    });

    conn.ev.on('messages.upsert', async m => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;
        if (msg.message.conversation === '.menu') {
            await conn.sendMessage(msg.key.remoteJid, { text: `🚀 *${BOT_NAME}*\n👤 Owner: ${OWNER_NAME}\n\nBot is working!` });
        }
    });
}
startBot();
