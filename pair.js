const { default: makeWASocket, useMultiFileAuthState, delay } = require("@whiskeysockets/baileys");
const pino = require('pino');

async function getPairCode() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    const conn = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' }),
        browser: ["Ubuntu", "Chrome", "20.0.04"]
    });

    if (!conn.authState.creds.registered) {
        await delay(5000);
        const code = await conn.requestPairingCode("94726800969");
        console.log("----------------------------");
        console.log("YOUR CODE IS: " + code);
        console.log("----------------------------");
    }
}
getPairCode();
