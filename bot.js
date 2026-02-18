const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { google } = require('googleapis');

// Ganti dengan nama file JSON service account
const KEYFILE = 'service-account.json';

// Ganti dengan ID Google Sheet
const SPREADSHEET_ID = '1qJ6B4sv4BnwjlYCJrNrNlNvxuOzqPH5SzX241fd8Hd0';

const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILE,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

async function addToSheet(data) {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Sheet1!A:E',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [data],
    },
  });
}

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  },
});


client.on('qr', qr => {
  qrcode.generate(qr, { small: true });
});
  const url = await QRCode.toDataURL(qr);
  console.log('Scan QR ini di browser:');
  console.log(url);
});


client.on('ready', () => {
  console.log('Bot siap!');
});

client.on('message', async message => {
  try {
    const text = message.body.trim();
    const parts = text.split(" ");

    if (parts.length < 2) return;

    let kategori = parts[0];
    let jumlah = parts[1];
    let jenis = "Pengeluaran";

    if (jumlah.startsWith("+")) {
      jenis = "Pemasukan";
      jumlah = jumlah.replace("+", "");
    }

    jumlah = parseInt(jumlah);

    if (isNaN(jumlah)) return;

    const tanggal = new Date().toLocaleString("id-ID");

    await addToSheet([
      tanggal,
      message.from,
      kategori,
      jumlah,
      jenis,
    ]);

    message.reply("Tercatat: " + kategori + " Rp" + jumlah);
  } catch (err) {
    console.log(err);
    message.reply("Gagal mencatat.");
  }
});

client.initialize();



