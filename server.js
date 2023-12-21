const express = require('express');
const { Client } = require('whatsapp-web.js');
const QRCode = require('qrcode');
const fs = require('fs');
const app = express();
const client = new Client({
    puppeteer: {
		args: ['--no-sandbox'],
	}
});
const path = require('path');

const cors = require('cors');
app.use(cors());

const bodyParser = require('body-parser');

// Middleware para parsear application/x-www-form-urlencoded y application/json
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

let qrPng = null;

// Evento 'qr': Se ejecuta cuando se genera un nuevo código QR
client.on('qr', async (qr) => {
    try {
        // Genera el código QR y lo convierte a base64
        qrPng = await QRCode.toDataURL(qr);

        // Guarda el código QR en un archivo
        const qrPath = './qr.png';
        const base64Data = qrPng.replace(/^data:image\/png;base64,/, "");

        fs.writeFile(qrPath, base64Data, 'base64', function(err) {
            if (err) {
                console.error(err);
            }
        });
    } catch (err) {
        console.error(err);
    }
});

// Ruta para obtener el código QR
app.get('/qr', (req, res) => {
  const qrPath = path.resolve(__dirname, 'qr.png');

  // Verifica si el archivo existe y lo envía
  if (fs.existsSync(qrPath)) {
      res.sendFile(qrPath);
  } else {
      res.status(500).send({ status: 'QR code not available' });
  }
});

let isReady = false;

// Evento 'ready': Se ejecuta cuando el cliente de WhatsApp está listo
client.on('ready', () => {
    console.log('Client is ready!');
    isReady = true;
});

// Evento 'disconnect': Se ejecuta cuando el cliente se desconecta
client.on('disconnect', () => {
  console.log('Client is disconnected!');
  isReady = false;
});

// Ruta para obtener el estado de la sesión
app.get('/session-status', (req, res) => {
    res.send({ status: 'Session status', isReady: isReady });
});

// Ruta para enviar un mensaje
app.post('/send-message', (req, res) => {
    const number = req.body.number;
    const message = req.body.message;

    // Envia el mensaje y maneja la respuesta
    client.sendMessage(number, message).then(response => {
        res.send({ status: 'Message sent', response: response });
    }).catch(err => {
        res.send({ status: 'Error sending message', error: err });
    });
});

// Inicializa el cliente de WhatsApp y pone el servidor en escucha
client.initialize();

app.listen(3000, () => {
    console.log('Server running on port 3000');
});
