import express from "express";
import router from "./router.js";
import morgan from "morgan";
import cors from "cors";

const app = express();

/**
 * Middleware
 *  - Logger
 *    - Pino ??
 */
app.use(cors());
app.use(morgan("dev"));
app.use(express.json()); // to make sure that the server can parse JSON requests
app.use(express.urlencoded({ extended: true })); // to make sure that the server can parse URL-encoded requests // query string

app.get("/", (req, res) => {
  console.log("Request from Express");
  res.status(200);
  res.json({ message: "Hello World!" });
});

/**
 * Router
 */
app.use("/api", router);

export default app;
