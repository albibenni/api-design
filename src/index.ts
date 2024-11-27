import app from "./server.js";
import * as dotenv from "dotenv";
dotenv.config();

app.listen(3000, () => {
  console.log(process.env.DATABASE_URL);
  console.log("Server is running on port 3000");
});
