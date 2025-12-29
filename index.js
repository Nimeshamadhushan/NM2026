
const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, delay } = require("@whiskeysockets/baileys");
const pino = require('pino');

const OWNER_NAME = "Nimesha";
const BOT_NAME = "NM 2026";
const PHONE_NUMBER = "94784776100"; 

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    const { version } = await fetchLatestBaileysVersion();

    const conn = makeWASocket({
        version,
        auth: state,
        logger: pino({ level: 'silent' }),
        browser: ["Ubuntu", "Chrome", "20.0.04"],
        connectTimeoutMs: 60000, // වෙලාව වැඩි කළා
        defaultQueryTimeoutMs: 0,
        keepAliveIntervalMs: 10000
    });

    if (!conn.authState.creds.registered) {
        // සර්වර් එක ලෑස්ති වෙනකම් තත්පර 10ක් ඉමු
        await delay(10000); 
        try {
            let code = await conn.requestPairingCode(PHONE_NUMBER);
            code = code?.match(/.{1,4}/g)?.join("-") || code;
            console.log(`\n\n👉 YOUR PAIRING CODE: ${code}\n\n`);
        } catch (err) {
            console.log("Pairing Code එක ගන්න බැරි වුණා. ආයෙත් රීස්ටාර්ට් වෙනවා...");
        }
    }

    conn.ev.on('creds.update', saveCreds);
    conn.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            console.log('සම්බන්ධතාවය බිඳ වැටුණා, නැවත උත්සාහ කරනවා...');
            startBot(); // ආයෙත් පටන් ගන්නවා
        } else if (connection === 'open') {
            console.log('✅ ' + BOT_NAME + ' Connected!');
        }
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
