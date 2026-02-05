require("dotenv").config();
const dbConnect = require("../config/db");
const Industry = require("../models/Industry");
const Machine = require("../models/Machine");
const { industries, machines } = require("../data/seed");

async function seed() {
  await dbConnect();

  await Industry.deleteMany({});
  await Machine.deleteMany({});

  await Industry.insertMany(industries);
  await Machine.insertMany(machines);

  console.log("Seed complete: industries and machines loaded.");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
