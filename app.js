require("dotenv").config();
require("./config/database").connect();
const express = require("express");

// const adminAuth = require("./middleware/adminAuth");


const app = express();
const cors = require('cors');

const adminRouter = require("./routes/admin");
const formRouter = require("./routes/form");




app.use(cors({
    origin: '*'
}));

app.use(express.json());
app.use("/admin",adminRouter)
app.use("/form",formRouter)




module.exports = app;