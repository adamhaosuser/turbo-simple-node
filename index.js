const express = require('express');
const app = express();
const crypto = require("crypto");
require("body-parser-xml")(express);

// Vars
const SIGNING_SECRET = process.env.SECRET_KEY;
const SIGNING_SECRET_ALGORITHM = "sha256";

function isValidSignature(signature, body, timestamp) {
  let hmac = crypto.createHmac(SIGNING_SECRET_ALGORITHM, SIGNING_SECRET);
  let sig = hmac.update(timestamp + body).digest("base64");

  console.log(`${sig} Generated signature and header ${signature}`)
  
  return (
    Buffer.compare(
      Buffer.from(signature),
      Buffer.from(sig.toString("base64"))
    ) === 0
  );
}
  
function storeRawBody(req, res, buf) {
  if (buf && buf.length) {
    req.rawBody = buf.toString("utf8");
  }
}  

// Built-in middleware for parsing JSON bodies
app.use(express.json());

app.use(
  express.json({
    verify: storeRawBody,
  })
);

app.use(express.urlencoded({ verify: storeRawBody, extended: true }));
app.use(express.xml({ verify: storeRawBody }));

app.post('/', (req, res) => {
  const signature = req.headers["x-zendesk-webhook-signature"];
  const timestamp = req.headers["x-zendesk-webhook-signature-timestamp"];
  const body = req.rawBody;

  console.log(`${signature} Signature, ${timestamp} Timetsamp and ${body} Body`)
  
  console.log('Received POST:', req.body);
  let utcTimestamp = req.body.Created_At;
  res.json({ createdStamp: utcTimestamp });

  console.log(
    isValidSignature(signature, body, timestamp)
      ? "HMAC signature is valid"
      : "HMAC signature is invalid"
  );  
});

app.get('/time', (req, res) => {
  const nowUtc = new Date().toISOString();
  res.json({ utc_time: nowUtc });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
