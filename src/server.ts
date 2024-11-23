import express from "express";

export const app = express();

app.get("/", (req, res) => {
  console.log("Request from Express");
  res.status(200);
  res.json({ message: "Hello World!" });
});
