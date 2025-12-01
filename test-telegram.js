import 'dotenv/config';
import fs from 'fs';

console.log("🚀 Starting Telegram Test...");

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

console.log(`🔑 Token: ${token ? "Loaded (starts with " + token.substring(0, 5) + "...)" : "MISSING"}`);
console.log(`ID Chat ID: ${chatId || "MISSING"}`);

if (!token || !chatId) {
    console.error("❌ Error: Missing credentials in .env");
    process.exit(1);
}

async function test() {
    const url = `https://api.telegram.org/bot${token}/getMe`;
    console.log(`📡 Checking Bot status... (${url})`);

    try {
        if (typeof fetch === 'undefined') {
            console.error("❌ Error: 'fetch' is not defined. You might be using an old Node.js version.");
            console.log("👉 Try installing node-fetch: npm install node-fetch");
            return;
        }

        const response = await fetch(url);
        const data = await response.json();

        if (data.ok) {
            console.log(`✅ Bot is valid! Name: ${data.result.first_name} (@${data.result.username})`);

            // Now try to send a message
            console.log("📨 Sending test message...");
            const msgUrl = `https://api.telegram.org/bot${token}/sendMessage`;
            const msgResponse = await fetch(msgUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: "🔔 TEST: Ceci est un message de test depuis le script de débogage."
                })
            });
            const msgData = await msgResponse.json();

            if (msgData.ok) {
                console.log("✅ Message sent successfully!");
            } else {
                console.error("❌ Failed to send message:", msgData);
                console.error("👉 Check if the Chat ID is correct and if you have started a conversation with the bot.");
            }

        } else {
            console.error("❌ Invalid Bot Token:", data);
        }

    } catch (error) {
        console.error("❌ Network or Script Error:", error);
    }
}

test();
