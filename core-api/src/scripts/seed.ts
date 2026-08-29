import mongoose from "mongoose";
import "dotenv/config";
import { Camp } from "../models/Camp";
import { Service } from "../models/Service";
import { Report } from "../models/Report";
import { syncLocation } from "../services/geoClient";

const MONGODB_URI = process.env.MONGODB_URI || "";

const pandharpurCenter = { lat: 17.6772, lng: 75.3236 };

const seedData = async () => {
  try {
    console.log("Connecting to MongoDB:", MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB!");

    // Clear existing for demo
    await Camp.deleteMany({});
    await Service.deleteMany({});
    await Report.deleteMany({});
    console.log("Cleared old demo data.");

    // We'll create a fake admin user ID just for the seed
    const fakeAdminId = new mongoose.Types.ObjectId();

    // 1. Create Camps (Bhakta Niwas, Medical Tents)
    const camps = await Camp.insertMany([
      {
        name: "Sant Tukaram Bhakta Niwas",
        type: "shelter",
        location: { type: "Point", coordinates: [75.3236, 17.6772] }, // [lng, lat]
        description: "Free shelter for Warkaris. Capacity: 500.",
        contactPhone: "+919876543210",
        operator: fakeAdminId,
        verified: true,
        media: ["https://picsum.photos/seed/bhaktaniwas/600/400"]
      },
      {
        name: "Red Cross Medical Camp",
        type: "medical",
        location: { type: "Point", coordinates: [75.3250, 17.6780] },
        description: "24/7 First Aid and emergency medicines.",
        operator: fakeAdminId,
        verified: true,
        media: ["https://picsum.photos/seed/medicalcamp/600/400"]
      }
    ]);

    // 2. Create Services (Annachhatra, Water)
    const services = await Service.insertMany([
      {
        name: "Shri Gajanan Maharaj Annachhatra",
        type: "food",
        location: { type: "Point", coordinates: [75.3210, 17.6750] },
        description: "Serving Mahaprasad twice a day.",
        available: true,
        operator: fakeAdminId,
        verified: true,
        media: ["https://picsum.photos/seed/foodcamp/600/400"]
      },
      {
        name: "Pandharpur Drinking Water Station",
        type: "water",
        location: { type: "Point", coordinates: [75.3225, 17.6790] },
        description: "Filtered drinking water for all.",
        available: true,
        operator: fakeAdminId,
        verified: true,
        media: ["https://picsum.photos/seed/watercamp/600/400"]
      }
    ]);

    // 3. Create Live Reports (Missing Person)
    const reports = await Report.insertMany([
      {
        type: "missing_person",
        location: { type: "Point", coordinates: [75.3240, 17.6760] },
        description: "Missing 65-year old man, wearing white dhoti and cap.",
        reporterPhone: "+918888888888",
        status: "confirmed",
        radius: 2,
        media: ["https://picsum.photos/seed/missingperson/400/400"]
      }
    ]);

    console.log("Database seeded successfully with Pandharpur demo data!");

    // We attempt to sync with geo-service (if running locally)
    try {
      for (const camp of camps) {
        await syncLocation(camp.id, "camp", camp.location.coordinates[1], camp.location.coordinates[0]);
      }
      for (const service of services) {
        await syncLocation(service.id, "service", service.location.coordinates[1], service.location.coordinates[0]);
      }
      for (const report of reports) {
        await syncLocation(report.id, "report", report.location.coordinates[1], report.location.coordinates[0]);
      }
      console.log("Successfully synced seed data to geo-service Redis cache.");
    } catch (e) {
      console.log("Geo-service not running, skipped Redis sync.");
    }

  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await mongoose.disconnect();
  }
};

seedData();
