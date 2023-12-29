const express = require('express');
const app = express();
const Docker = require('dockerode');
const docker = new Docker();
const cors = require('cors');
const bodyParser = require('body-parser');

// Habilita CORS
app.use(cors());

// Middleware para parsear application/x-www-form-urlencoded y application/json
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

/**
 * Endpoint para gestionar un puerto, iniciando un servicio Docker en el puerto especificado.
 * @param {number} req.body.portNumber - El número de puerto a gestionar.
 * @returns {Object} - Objeto JSON con el resultado de la operación.
 */
app.post('/manage-port', async (req, res) => {
  try {
    const { portNumber } = req.body;

    // Lógica para gestionar el puerto, como iniciar un servicio Docker
    const container = await docker.createContainer({
      Image: 'api-ws-id-myapp1',
      Tty: true,
      AttachStdin: true,
      AttachStdout: true,
      AttachStderr: true,
      ExposedPorts: { '3000/tcp': {} }, // Ajusta el puerto según tus necesidades
      HostConfig: {
        PortBindings: { '3000/tcp': [{ 'HostPort': `${portNumber}` }] }, // Mapea el puerto dinámico
      },
    });

    await container.start();

    res.json({ success: true, message: `Servicio iniciado en el puerto ${portNumber}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

/**
 * Endpoint para detener un servicio Docker en un puerto especificado.
 * @param {number} req.body.portNumber - El número de puerto a detener.
 * @returns {Object} - Objeto JSON con el resultado de la operación.
 */
app.post('/stop-port', async (req, res) => {
  try {
    const { portNumber } = req.body;

    // Lógica para detener el servicio Docker en el puerto especificado
    const containers = await docker.listContainers({ all: true });

    const containerToStop = containers.find(container => {
      const bindings = container.Ports.map(port => port.PublicPort);
      return bindings.includes(parseInt(portNumber));
    });

    if (containerToStop) {
      const stoppingContainer = docker.getContainer(containerToStop.Id);
      await stoppingContainer.stop();
      res.json({ success: true, message: `Servicio detenido en el puerto ${portNumber}` });
    } else {
      res.json({ success: false, message: `No se encontró un servicio en el puerto ${portNumber}` });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// Inicia el servidor en el puerto 3001
app.listen(3003, () => {
  console.log('Server docker running on port 3003');
});
