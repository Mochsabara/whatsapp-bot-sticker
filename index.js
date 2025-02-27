import FfmpegPath from '@ffmpeg-installer/ffmpeg';
import WAWebJS from "whatsapp-web.js";
import qrcode from 'qrcode-terminal'
import Spinnies from "spinnies";
import chalk from 'chalk';

const spinnies = new Spinnies();
const ffmpegPath = FfmpegPath.path;
const { Client, LocalAuth } = WAWebJS;

const client = new Client({
  authStrategy: new LocalAuth({
    clientId: "one",
    dataPath: "./sessions",
  }),
  ffmpegPath,
  puppeteer: {
		args: ['--no-sandbox']
	}
});

console.log(chalk.green('\nSimple WhatsApp Bot Sticker by Aromakelapa\n'));

// Init Bot
client.initialize();

spinnies.add('Connecting', { text: 'Opening Whatsapp Web' })

client.on('loading_screen', (percent, message) => {
  // console.log('', percent, message);
  spinnies.update('Connecting', { text: `Connecting. ${message} ${percent}%`});
});

// On Login
client.on('qr', (qr) => {
  spinnies.add('generateQr', {text: 'Generating QR Code'});
  console.log(chalk.yellow('[!] Scan QR Code Bellow'));
  qrcode.generate(qr, {small: true});
  spinnies.succeed('generateQr', {text: 'QR Code Generated'});
  spinnies.update('Connecting', { text: 'Waiting to scan' })
});

// Authenticated
client.on('authenticated', () => {
  // spinnies.update('Connecting', {text: ''});
  console.log(chalk.green(`✓ Authenticated!                          `))
});

// Auth Failure
client.on('auth_failure', (msg) => {
  console.error('Authentication Failure!', msg);
});

// Bot Ready
client.on('ready', () => {
  spinnies.succeed('Connecting', { text: 'Connected!', successColor: 'greenBright' });
  aboutClient(client);
  console.log('Incoming Messages : \n');
});
// Messages Handler
client.on('message', async (msg) => {
  const chat = await msg.getChat();
  const contact = await msg.getContact();
  console.log(chalk.cyan(`💬 ${contact.pushname} : ${msg.body}\n`));

  try {
    switch (msg.body.toLowerCase()) {
      case '.stiker':
      case '.sticker':
      case '.s':
        if(msg.hasMedia){
		const media = await msg.downloadMedia();
		msg.reply('Wait a Minute!');
		chat.sendMessage(media,
		{
			sendMediaAsSticker: true,
			stickerName: 'name your sticker',
			stickerAuthor: 'name author'
		}
		);
		console.log(chalk.green(`💬 ${contact.pushname} : Sticker sent!\n`));
		} else {
		msg.reply('kirim gambar dengan caption .s, ketik (info) untuk melihat informasi hari ini');
		};
        break;
	    
	case 'error':
	msg.reply('info diterima!');
	console.log(chalk.red(`ERROR\n`));
        new Error();
        break;
		
	case 'info':
	msg.reply('Prefix hari ini (.)');
	break;
    }
  } catch (error) {
    console.error(error);
  };
});
// tag all member
client.on('message', async (msg) => {
    if (msg.body === '.all') {
        const chat = await msg.getChat();
        let text = '';
        let mentions = [];

        for (let participant of chat.participants) {
            mentions.push(`${participant.id.user}@c.us`);
            text += `@${participant.id.user} `;
        }

        await chat.sendMessage(text, { mentions });
    }
});
// Disconnected
client.on('disconnected', (reason) => {
  console.log('Client was logged out, Reason : ', reason);
});

function aboutClient(client){
  console.log(chalk.cyan(                                                                                                                                                  
    '\nAbout Client :' +                                                                                                                                     
    '\n  - Username : ' + client.info.pushname +                                                                                                           
    '\n  - Phone    : ' + client.info.wid.user +                                                                                                       
    '\n  - Platform : ' + client.info.platform + '\n'
  ));
};
