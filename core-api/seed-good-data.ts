import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: "/home/pruthvi/projects/Visava/Visava/core-api/.env" });

const ServiceSchema = new mongoose.Schema({}, { strict: false });
const Service = mongoose.model("Service", ServiceSchema, "services");

const CampSchema = new mongoose.Schema({}, { strict: false });
const Camp = mongoose.model("Camp", CampSchema, "camps");

const goodServices = [
  {
    name: "Shri Vitthal Rukmini Mahaprasad",
    type: "food",
    location: { type: "Point", coordinates: [75.3210, 17.6760] },
    city: "Pandharpur",
    contactPhone: "+919876543210",
    description: "Pure vegetarian Mahaprasad (Dal, Bhaat, Bhaji, Chapati) available 24/7. Road Instructions: Located just 200 meters from the main Vitthal Rukmini Mandir. Walk towards the Chandrabhaga river bank, it is right opposite the Shivaji Maharaj Statue.",
    available: true,
    verified: true,
    media: ["https://images.unsplash.com/photo-1626776876729-ab522f1c8437?q=80&w=800&auto=format&fit=crop"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Mauli Sabudana Khichdi Kendra",
    type: "food",
    location: { type: "Point", coordinates: [73.8966, 18.6756] },
    city: "Alandi",
    contactPhone: "+919988776655",
    description: "Authentic fasting food (Upwas food) including Sabudana Khichdi, Peanuts, and Rajgira Ladoo. Road Instructions: Next to the Indrayani River Ghat, Alandi. Just beside the Sant Dnyaneshwar Maharaj Sanjivan Samadhi entrance gate.",
    available: true,
    verified: true,
    media: ["https://images.unsplash.com/photo-1589301760014-d929f39ce9b1?q=80&w=800&auto=format&fit=crop"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Warkari Seva Medical Camp",
    type: "medical",
    location: { type: "Point", coordinates: [75.3250, 17.6780] },
    city: "Pandharpur",
    contactPhone: "+919000000001",
    description: "Free first-aid, pain relief sprays, and basic medicines for walking fatigue. Road Instructions: Located at the main Pandharpur ST Bus Stand circle. Look for the large Red Cross banner.",
    available: true,
    verified: true,
    media: ["https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=800&auto=format&fit=crop"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Pune Volunteers Water Station",
    type: "water",
    location: { type: "Point", coordinates: [73.8567, 18.5204] },
    city: "Pune",
    contactPhone: "+918888888888",
    description: "Free filtered drinking water in traditional clay pots (Matka) for cool water. Road Instructions: Located at Deccan Gymkhana, near Sambhaji Park. Easy to spot from the main JM Road.",
    available: true,
    verified: true,
    media: ["https://images.unsplash.com/photo-1548839140-29a749e1bc4e?q=80&w=800&auto=format&fit=crop"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Sant Tukaram Vishranti Gruh",
    type: "shelter",
    location: { type: "Point", coordinates: [73.7663, 18.7167] },
    city: "Dehu",
    contactPhone: "+917777777777",
    description: "Safe resting area with free blankets, fans, and mobile charging points. Road Instructions: 5 minutes walk from Dehu Main Temple. Take the road heading towards the Gatha Mandir, it is on the left side.",
    available: true,
    verified: true,
    media: ["https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?q=80&w=800&auto=format&fit=crop"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Gajanan Maharaj Pure Veg Thali",
    type: "food",
    location: { type: "Point", coordinates: [75.3190, 17.6720] },
    city: "Pandharpur",
    contactPhone: "+919991112223",
    description: "Serving unlimited hot pure veg meals (Chapati, Rice, Dal, 2 Sabzi) for all pilgrims. Strictly vegetarian. Road Instructions: Near the Railway Station road, right behind the main Pandharpur Post Office.",
    available: true,
    verified: true,
    media: ["https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=800&auto=format&fit=crop"],
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

async function main() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  console.log("Connected to DB");

  // Clear existing mock data to ensure a clean UI
  await Service.deleteMany({});
  await Camp.deleteMany({});
  console.log("Cleared existing services and camps");

  // Insert new highly detailed data
  await Service.insertMany(goodServices);
  await Camp.insertMany(goodServices); // Inserting the same high quality data into camps as well
  console.log("Successfully seeded database with high-quality, authentic vegetarian data.");

  await mongoose.disconnect();
}

main().catch(console.error);
