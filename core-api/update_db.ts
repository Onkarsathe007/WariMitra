import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: "/home/pruthvi/projects/Visava/Visava/core-api/.env" });

const CampSchema = new mongoose.Schema({}, { strict: false });
const ServiceSchema = new mongoose.Schema({}, { strict: false });

const Camp = mongoose.model("Camp", CampSchema, "camps");
const Service = mongoose.model("Service", ServiceSchema, "services");

const realImages = {
  food: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop",
  water: "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?q=80&w=800&auto=format&fit=crop",
  medical: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=800&auto=format&fit=crop",
  shelter: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?q=80&w=800&auto=format&fit=crop"
};

async function main() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  console.log("Connected to DB");

  // Remove the 'onkar sathe' camp
  const deleteResult = await Camp.deleteOne({ name: /onkar sathe/i });
  console.log(`Deleted ${deleteResult.deletedCount} camps with name 'onkar sathe'`);
  
  const deleteServiceResult = await Service.deleteOne({ name: /onkar sathe/i });
  console.log(`Deleted ${deleteServiceResult.deletedCount} services with name 'onkar sathe'`);

  // Update camps images
  const camps = await Camp.find({});
  for (const camp of camps) {
    const type = camp.get('type') as keyof typeof realImages;
    if (type && realImages[type]) {
      await Camp.updateOne({ _id: camp._id }, { $set: { media: [realImages[type]] } });
    }
  }
  console.log("Updated camps images");

  // Update services images
  const services = await Service.find({});
  for (const service of services) {
    const type = service.get('type') as keyof typeof realImages;
    if (type && realImages[type]) {
      await Service.updateOne({ _id: service._id }, { $set: { media: [realImages[type]] } });
    }
  }
  console.log("Updated services images");

  await mongoose.disconnect();
}

main().catch(console.error);
