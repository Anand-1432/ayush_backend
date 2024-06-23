const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "config/.env" });

const connectDatabase = async () => {
  mongoose.set("strictQuery", true);

  await mongoose
    .connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then((con) => {
      console.log(
        `MongoDB Database connected with HOST : ${con.connection.host}`
      );
    })
    .catch((err) => {
      console.log(err);
    });
};

module.exports = connectDatabase;
