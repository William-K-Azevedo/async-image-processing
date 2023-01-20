import { Worker } from "bullmq";
import { processUploadedImages } from "./imageProcessing.js";

const workerHandler = (job) => {
  console.log("Starting job:", job.name);
  processUploadedImages(job.data);
  console.log("Finished job:", job.name);
  return;
};

const workerOptions = {
  connection: {
    host: "127.0.0.1",
    port: 6379,
  },
};

const worker = new Worker("imageJobQueue", workerHandler, workerOptions);

console.log("Worker started!");
