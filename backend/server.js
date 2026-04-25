const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Serve uploaded standard assets securely (Images)
const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use("/api/shelters", require("./routes/shelterRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/donations", require("./routes/donationRoutes"));
app.use("/api/dogs", require("./routes/dogRoutes"));
app.use("/api/staff", require("./routes/staffRoutes"));
app.use("/api/reports", require("./routes/reportRoutes"));
app.use("/api/requests", require("./routes/requestRoutes"));
app.use("/api/supplies", require("./routes/supplyRoutes"));
app.use("/api/store", require("./routes/storeRoutes"));
app.use("/api/sales", require("./routes/saleRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});