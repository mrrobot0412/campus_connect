const express = require("express");
const cors = require("cors");
const apiRoutes = require("./src/routes");
const { ServerConfig, ConnectDB } = require("./src/config");

const app = express();

const allowedOrigins = (process.env.FRONTEND_URLS || process.env.FRONTEND_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const previewOriginPatterns = [
  /\.vercel\.app$/,
  /\.netlify\.app$/,
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.some((allowedOrigin) => allowedOrigin === origin) ||
      previewOriginPatterns.some((pattern) => pattern.test(origin))
    ) {
      return callback(null, true);
    }
    return callback(new Error('CORS Policy Error'), false);
  },
  credentials: true
}));

app.use(express.json())
app.set("trust proxy", 1);
app.use("/api", apiRoutes);

app.get("/test", async function(req, res) {
  return res.status(200).send({ "message": "server is running" });
})

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global Error Handler:", err.stack);
  res.status(500).json({ error: "Internal Server Error", details: err.message });
});

app.listen(ServerConfig.PORT, async () => {
  try {
    // mongoDB connection
    await ConnectDB()
    console.log("Connected to MongoDB successfully");
    
    // Initialize background worker
    require("./src/queues/otpWorker");
    console.log(`Server is up at ${ServerConfig.PORT}`);
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
});
  
