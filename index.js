import express from "express";
import fs from "fs";
import path from "path";
import fileupload from "express-fileupload";
import bodyParser from "body-parser";
import { fileURLToPath } from "url";
const { Queue } = require("bullmq");

const redisOptions = { host: "127.0.0.1", port: 6378 };

const imageJobQueue = new Queue("imageJobQueue", {
  connection: redisOptions,
});

async function addJob(job) {
  await imageJobQueue.add(job.type, job);
}

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(fileupload());
app.use(express.static("public"));

app.get("/", function (req, res) {
  res.render("form");
});

app.get("/result", (req, res) => {
  const imgDirPath = path.join(__dirname, "./public/images");
  let imgFiles = fs.readdirSync(imgDirPath).map((image) => {
    return `images/${image}`;
  });
  res.render("result", { imgFiles });
});

app.post("/upload", async function (req, res) {
  const { image } = req.files;

  if (!image) return res.sendStatus(400);

  await addJob({
    type: "processUploadedImages",
    image: {
      data: image.data.toString("base64"),
      name: image.name,
    },
  });

  res.redirect("/result");
});

app.listen(3000, function () {
  console.log("Server running on port 3000");
});
