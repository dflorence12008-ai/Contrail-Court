const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

const routes = require("./routes");

dotenv.config();

const app = express();

// ================= MIDDLEWARE =================

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({
  extended: true
}));

// ================= HOME =================

app.get("/", (req, res) => {
  res.json({
    message: "CONTRAIL COURT API is running",
    status: "OK"
  });
});

// ================= API ROUTES =================

app.use("/api", routes);

// ================= 404 =================

app.use((req, res) => {
  res.status(404).json({
    message: "API route not found"
  });
});

// ================= SERVER =================

const PORT = process.env.PORT || 5000;

mongoose
  .connect(
    process.env.MONGO_URI ||
      "mongodb://127.0.0.1:27017/contrail_court"
  )
  .then(() => {
    console.log("MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(
        `CONTRAIL COURT server running on port ${PORT}`
      );

      console.log(
        `http://localhost:${PORT}`
      );
    });
  })
  .catch((error) => {
    console.error(
      "MongoDB connection failed:"
    );

    console.error(error.message);
  });