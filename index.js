const express = require('express');
const app = express();
const crypto = require("crypto");

// Vars
const SIGNING_SECRET = process.env.SECRET_KEY;
const SIGNING_SECRET_ALGORITHM = "sha256";

app.post('/webhook', express.raw({ type: '*/*' }), (req, res) => {
  const signature = req.header('X-Zendesk-Webhook-Signature');
  const timestamp = req.header('X-Zendesk-Webhook-Signature-Timestamp');
  const rawBody = req.body;

  if (!signature || !timestamp) {
    return res.status(400).send('Missing signature or timestamp');
  }

  const message = Buffer.concat([
    Buffer.from(timestamp, 'utf8'),
    Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(rawBody)
  ]);

  const expectedSignature = crypto
    .createHmac(SIGNING_SECRET_ALGORITHM, SIGNING_SECRET)
    .update(message)
    .digest('base64');

  const valid = crypto.timingSafeEqual(
    Buffer.from(signature, 'base64'),
    Buffer.from(expectedSignature, 'base64')
  );

  if (!valid) {
    return res.status(401).send('Signature verification failed');
  }

  let payload;
  try {
    payload = JSON.parse(rawBody.toString('utf8'));
  } catch (e) {
    return res.status(400).send('Invalid JSON');
  }

  // Do some additional processing / logging
  let data;
  try {
    data = JSON.parse(rawBody.toString('utf8'));
    console.log('Webhook JSON:', data);
  } catch (e) {
    return res.status(400).send('Invalid JSON');
  }

  // All's well, respond with success
  res.send('Webhook verified!');
  
});

app.use(express.json());

app.post('/', (req, res) => {

  console.log('Received POST:', req.body);
  let utcTimestamp = req.body.Created_At;
  res.json({ createdStamp: utcTimestamp });
 
});

app.get('/time', (req, res) => {
  const nowUtc = new Date().toISOString();
  res.json({ utc_time: nowUtc });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
