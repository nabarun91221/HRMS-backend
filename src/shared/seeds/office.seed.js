import Office from "../../modules/office/models/office.model.js";
// import connectMongoDb from "../../configs/mongoDb.config.js";
import { configDotenv } from "dotenv";
import mongoose from "mongoose";
configDotenv();

const seedOffice = async () =>
{
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Office.deleteMany();

    await Office.create({
      name: "Main Office - Howrah",
      location: {
        type: "Point",
        coordinates: [88.30369115290098, 22.617667871060576], // longitude, latitude
      },
      allowedRadius: 500, // meters
    });

    console.log("Office seeded successfully");
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedOffice();
