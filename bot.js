const TelegramBot = require('node-telegram-bot-api');
const nodemailer = require('nodemailer');
const fs = require('fs');
const token = '7901822583:AAE5HS_OwFcRf6iMUHNfQK9zkP_cIwb7TxM';
const bot = new TelegramBot(token, {polling: true});
const whatsappSupportEmail = 'support@whatsapp.com';
const userData = {};
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendPhoto(chatId, 'https://i.ibb.co.com/xqkjpnkn/desktop-wallpaper-anime-girl-ninja.jpg', {
        caption: `👰SELAMAT DATANG TOOLS SEND MAIL KAK HOZOO METODE BANNED WHATSAPP 🚫💃\n\n.`,
        parse_mode: 'Markdown',
        reply_markup: {
            keyboard: [
                [{text: '📝 Buat Banding Baru'}],
                [{text: 'ℹ️ Instruksi'}, {text: '🆘 Help'}]
            ],
            resize_keyboard: true,
            one_time_keyboard: true
        }
    });
});
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text === '📝 Buat Banding Baru') {
        startAppealProcess(chatId);
    } else if (text === 'ℹ️ Instructions') {
        sendInstructions(chatId);
    } else if (text === '🆘 Help') {
        sendHelp(chatId);
    }
});
function startAppealProcess(chatId) {
    userData[chatId] = {};
    bot.sendMessage(chatId, '📧 *Silakan masukkan alamat email Anda:*', {
        parse_mode: 'Markdown',
        reply_markup: {remove_keyboard: true}
    });
    bot.once('message', (msg) => {
        if (msg.chat.id === chatId) {
            userData[chatId].email = msg.text;
            askForPhoneNumber(chatId);
        }
    });
}
function askForPhoneNumber(chatId) {
    bot.sendMessage(chatId, '📱 kak hozoo cute masukin nomor nya contoh +62', {
        parse_mode: 'Markdown'
    });
    bot.once('message', (msg) => {
        if (msg.chat.id === chatId) {
            userData[chatId].phone = msg.text;
            askForBanReason(chatId);
        }
    });
}
function askForBanReason(chatId) {
    bot.sendMessage(chatId, '❓ *Jelaskan secara singkat mengapa Anda merasa diblokir:*', {
        parse_mode: 'Markdown'
    });
    bot.once('message', (msg) => {
        if (msg.chat.id === chatId) {
            userData[chatId].reason = msg.text;
            askForEvidence(chatId);
        }
    });
}
function askForEvidence(chatId) {
    bot.sendMessage(chatId, '📎 *Apakah Anda punya bukti atau tangkapan layar?*', {
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [
                [{text: '✅ Yes', callback_data: 'has_evidence_yes'}, 
                 {text: '❌ No', callback_data: 'has_evidence_no'}]
            ]
        }
    });
}
bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;
    const data = query.data;
    if (data.startsWith('has_evidence_')) {
        const hasEvidence = data === 'has_evidence_yes';
        userData[chatId].hasEvidence = hasEvidence;
        if (hasEvidence) {
            bot.sendMessage(chatId, '🖼 *Silakan kirim tangkapan layar Anda sekarang (maksimal 5 gambar)):*', {
                parse_mode: 'Markdown'
            });
        } else {
            showEmailPreview(chatId);
        }
    } else if (data === 'send_email') {
        sendAppealEmail(chatId);
    } else if (data === 'cancel_email') {
        bot.sendMessage(chatId, '🚫 Appeal email cancelled.', {
            reply_markup: {remove_keyboard: true}
        });
    }
});
function showEmailPreview(chatId) {
    const {email, phone, reason, hasEvidence} = userData[chatId];
    const {subject, body} = generateEmailContent({phoneNumber: phone, banReason: reason, hasEvidence});
    const preview = `📨 *Pratinjau Email*\n\n*To:* ${whatsappSupportEmail}\n*Subject:* ${subject}\n\n${body}`;
    bot.sendMessage(chatId, preview, {
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [
                [{text: '📤 Kirim Email', callback_data: 'send_email'}],
                [{text: '❌ Cancel', callback_data: 'cancel_email'}]
            ]
        }
    });
}
async function sendAppealEmail(chatId) {
    const {email, phone, reason, hasEvidence} = userData[chatId];
    const {subject, body} = generateEmailContent({phoneNumber: phone, banReason: reason, hasEvidence});
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'YOUR_GMAIL@gmail.com', 
            pass: 'YOUR_GMAIL_PASSWORD'   
        }
    });
    const mailOptions = {
        from: email,
        to: whatsappSupportEmail,
        subject: subject,
        text: body
    };
    try {
        await transporter.sendMail(mailOptions);
        bot.sendMessage(chatId, '✅ *Email banding berhasil dikirim ke dukungan WhatsApp!*\n\nSilakan periksa kotak masuk Anda (dan folder spam) untuk setiap respons.', {
            parse_mode: 'Markdown'
        });
    } catch (error) {
        bot.sendMessage(chatId, `❌ *Error sending email:* ${error.message}`, {
            parse_mode: 'Markdown'
        });
    }
}
function sendInstructions(chatId) {
    const instructions = `📚 *Petunjuk*\n\n1. Klik "Buat Banding Baru"\n2. Berikan email dan nomor WhatsApp Anda\n3. Jelaskan situasi Anda\n4. Tambahkan bukti jika tersedia\n5. Tinjau dan kirimkan banding Anda\n\nℹ️ Bersikaplah sopan dan jujur ​​dalam banding Anda untuk hasil terbaik.`;
    bot.sendMessage(chatId, instructions, {parse_mode: 'Markdown'});
}
function sendHelp(chatId) {
    const helpText = `🆘 *Help*\n\nJika Anda memerlukan bantuan:\n- Pastikan nomor WhatsApp Anda dalam format internasional\n- Jelaskan secara jelas dan ringkas\n- Periksa folder spam email Anda untuk mendapatkan respons\n\nHubungi @namapenggunaAnda untuk dukungan bot.`;
    bot.sendMessage(chatId, helpText, {parse_mode: 'Markdown'});
}
function generateEmailContent({ phoneNumber, banReason, hasEvidence }) {
    const subject = `Appeal for Banned Account: ${phoneNumber}`;
    const body = `Dear WhatsApp Support Team,
I hope this message finds you well. I am writing to appeal the ban on my WhatsApp account associated with the number: ${phoneNumber}.
Reason for ban: ${banReason}
${hasEvidence ? 'I have attached evidence/screenshots that I believe demonstrate my account was banned in error.' : 'While I don\'t have direct evidence, I believe this ban may have been applied in error.'}
I sincerely apologize if my actions inadvertently violated WhatsApp's Terms of Service. I value the WhatsApp platform and the connections it enables, and I assure you that I will carefully review and adhere to all guidelines if my account is reinstated.
I kindly request a review of my account and hope you will consider lifting the ban. I would greatly appreciate any information about what specifically may have triggered this action so I can avoid similar issues in the future.
Thank you for your time and consideration. I look forward to your response.
Best regards,
[LORDHOZOO CUTE ]
${phoneNumber}`;
    return { subject, body };
}
console.log('WhatsApp Ban Appeal Telegram Bot is running...');
