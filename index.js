const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const auth = require("./routes/auth");
const product = require("./routes/product");
const order = require("./routes/order");
const cart = require("./routes/cart");
const dotenv = require("dotenv");
dotenv.config({ path: "config/.env" });
const app = express();
app.use(cookieParser());

const corsOptions = {
  origin: ["http://localhost:3000", "http://localhost:3030"], // your frontend server
  credentials: true, // include credentials
};

app.use(cors(corsOptions));

const bodyParser = require("body-parser");

app.use(express.json({ limit: "50mb" }));

app.use(bodyParser.json({ limit: "50mb" }));

app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000,
  })
);

app.use("/api/v1", auth);
app.use("/api/v1", product);
app.use("/api/v1", cart);
app.use("/api/v1", order);

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

const connectDatabase = require("./config/database.js");
const errorhandler = require("./middlewares/error.js");
connectDatabase();

app.use("/", (req, res) => {
  res.send({ message: "Hello world!!" });
});

const server = app.listen(process.env.PORT, () => {
  console.log(`server started on port : ${process.env.PORT}.`);
});

//handling uncaught exception
process.on("uncaughtException", (err) => {
  console.log(`ERROR : ${err.stack}`); // stack defines
  console.log(`Shutting down due to uncaught exception`);
  process.exit(1);
});
// console.log(a) // error should be below uncaughtexception code

//dotenv.config({ path : "backend/config/config.env"})

//SETTING UP cloudinary configuration
// cloudinary.config({
//     cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
//     api_key : process.env.CLOUDINARY_API_KEY,
//     api_secret : process.env.CLOUDINARY_API_SECRET
// })

//handling unhandled promise rejection
process.on("unhandledRejection", (err) => {
  console.log(`ERROR : ${err.message}`);
  console.log(`Shutting down the server due to Unhandled promise rejection`);
  server.close(() => {
    process.exit(1);
  });
});

app.use(errorhandler);

module.exports = app;
