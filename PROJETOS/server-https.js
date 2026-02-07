const https = require("https");
const fs = require("fs");
const path = require("path");
const { promisify } = require("util");

const PORT = 3000;

// Gerar certificado auto-assinado em memória (sem OpenSSL)
const pem = require("pem");

pem.createCertificate({ days: 365, selfSigned: true }, (err, keys) => {
  if (err) {
    console.error("Erro ao gerar certificado:", err);
    process.exit(1);
  }

  const options = {
    key: keys.serviceKey,
    cert: keys.certificate
  };

  const server = https.createServer(options, (req, res) => {
    let filePath = "." + req.url;
    if (filePath === "./") filePath = "./index.html";

    const extname = path.extname(filePath);
    let contentType = "text/html";
    if (extname === ".js") contentType = "text/javascript";
    if (extname === ".css") contentType = "text/css";
    if (extname === ".svg") contentType = "image/svg+xml";
    if (extname === ".jpg" || extname === ".jpeg") contentType = "image/jpeg";
    if (extname === ".png") contentType = "image/png";

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end("Arquivo não encontrado");
        return;
      }
      res.writeHead(200, { "Content-Type": contentType });
      res.end(data);
    });
  });

  server.listen(PORT, () => {
    console.log(`✓ Servidor HTTPS rodando em https://localhost:${PORT}`);
    console.log("⚠️  Navegador pode avisar sobre certificado não confiável - é normal!");
  });
});