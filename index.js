const http = require("http");
const https = require("https");
const app = require("./app");


//http setting
let server;
let protcol = "http"
if (process.argv[2])
    protcol = process.argv[2];

if (protcol == "https") {
    const fs = require("fs");
    console.log("https Server Started");
    server = https.createServer(httpsOptions, app);
} else {
    console.log("http Server Started");
    server = http.createServer(app);
}

const { API_PORT } = process.env;
const port = process.env.PORT || API_PORT;

// server listening 
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});