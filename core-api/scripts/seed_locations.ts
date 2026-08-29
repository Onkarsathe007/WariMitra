import mongoose from "mongoose";
import { env } from "../src/config/env";
import { Service } from "../src/models/Service";
import { User } from "../src/models/User";

const mockServices = [
  // ALANDI (Start of Dnyaneshwar Mauli Palkhi)
  {
    name: "माऊली अन्नछत्र (Alandi Annachhatra)",
    type: "food",
    location: { type: "Point", coordinates: [73.8961, 18.6745] },
    contactPhone: "+919876543212",
    description: "हे अन्नछत्र आळंदी बस स्टँडच्या मागे, इंद्रायणी नदीच्या पुलाजवळ आहे. इथे मोफत महाप्रसादाची सोय आहे.",
    available: true,
    verified: true,
  },
  {
    name: "आळंदी वैद्यकीय शिबीर (Alandi Medical Camp)",
    type: "medical",
    location: { type: "Point", coordinates: [73.8970, 18.6750] },
    contactPhone: "+919876543213",
    description: "हे वैद्यकीय शिबीर ज्ञानेश्वर महाराज मंदिराच्या मुख्य प्रवेशद्वाराजवळ, डाव्या बाजूला आहे.",
    available: true,
    verified: true,
  },

  // DEHU (Start of Tukaram Maharaj Palkhi)
  {
    name: "तुकाराम महाराज पाणी वाटप (Dehu Water Distribution)",
    type: "water",
    location: { type: "Point", coordinates: [73.7667, 18.7167] },
    contactPhone: "+919876543214",
    description: "देहुमधील मुख्य चौकात, ग्रामपंचायतीच्या समोर पिण्याच्या पाण्याचे टँकर उपलब्ध आहेत.",
    available: true,
    verified: true,
  },
  {
    name: "देहु निवारा केंद्र (Dehu Shelter)",
    type: "shelter",
    location: { type: "Point", coordinates: [73.7650, 18.7180] },
    contactPhone: "+919876543215",
    description: "गाथा मंदिराच्या पाठीमागे, वारकऱ्यांसाठी विश्रांतीची आणि राहण्याची सोय केली आहे.",
    available: true,
    verified: true,
  },

  // PUNE (Bhavani Peth / Nana Peth)
  {
    name: "भवानी पेठ अन्नछत्र (Bhavani Peth Food Camp)",
    type: "food",
    location: { type: "Point", coordinates: [73.8687, 18.5089] },
    contactPhone: "+919876543216",
    description: "पुण्यातील भवानी पेठेत, पालखी विसावा घेते त्या मैदानाच्या उजव्या बाजूला हे अन्नछत्र आहे.",
    available: true,
    verified: true,
  },
  {
    name: "नाना पेठ वैद्यकीय मदत (Nana Peth Medical Help)",
    type: "medical",
    location: { type: "Point", coordinates: [73.8710, 18.5110] },
    contactPhone: "+919876543217",
    description: "नाना पेठ पोलीस चौकीच्या शेजारी आपत्कालीन वैद्यकीय शिबीर सुरू आहे.",
    available: true,
    verified: true,
  },

  // SASWAD
  {
    name: "सासवड पालखी तळ सेवा (Saswad Camp Services)",
    type: "shelter",
    location: { type: "Point", coordinates: [74.0321, 18.3377] },
    contactPhone: "+919876543218",
    description: "सासवडच्या मुख्य पालखी तळावर, एसटी स्टँडच्या समोर महिला आणि पुरुषांसाठी स्वतंत्र निवारा उपलब्ध आहे.",
    available: true,
    verified: true,
  },

  // JEJURI
  {
    name: "जेजुरी अन्नदान (Jejuri Food Distribution)",
    type: "food",
    location: { type: "Point", coordinates: [74.1561, 18.2778] },
    contactPhone: "+919876543219",
    description: "खंडोबा मंदिराच्या पायथ्याशी, कडेपठार रस्त्यावर अन्नदानाची व्यवस्था आहे.",
    available: true,
    verified: true,
  },

  // PHALTAN
  {
    name: "फलटण आरोग्य केंद्र (Phaltan Health Center)",
    type: "medical",
    location: { type: "Point", coordinates: [74.4333, 17.9833] },
    contactPhone: "+919876543220",
    description: "फलटण शहरात प्रवेश करताना, रिंग रोडवर डाव्या बाजूला हे प्राथमिक आरोग्य केंद्र आहे.",
    available: true,
    verified: true,
  },

  // AKLUJ
  {
    name: "अकलूज पाणी पुरवठा (Akluj Water Camp)",
    type: "water",
    location: { type: "Point", coordinates: [75.0167, 17.8833] },
    contactPhone: "+919876543221",
    description: "अकलूज चौकात, शिवाजी पुतळ्याच्या मागे पिण्याचे शुद्ध पाणी उपलब्ध आहे.",
    available: true,
    verified: true,
  },

  // WAKHARI (Ringan)
  {
    name: "वाखरी रिंगण वैद्यकीय शिबीर (Wakhari Medical Camp)",
    type: "medical",
    location: { type: "Point", coordinates: [75.2917, 17.7025] },
    contactPhone: "+919876543222",
    description: "वाखरीच्या गोल रिंगण मैदानाच्या प्रवेशद्वाराजवळ, उजव्या हाताला हे २४ तास वैद्यकीय शिबीर आहे.",
    available: true,
    verified: true,
  },
  {
    name: "वाखरी महाप्रसाद (Wakhari Food Camp)",
    type: "food",
    location: { type: "Point", coordinates: [75.2930, 17.7010] },
    contactPhone: "+919876543223",
    description: "वाखरी फाट्यावरून डावीकडे वळल्यावर, महाप्रसादाचा मोठा मंडप उभारण्यात आला आहे.",
    available: true,
    verified: true,
  },

  // PANDHARPUR (Destination)
  {
    name: "पंढरपूर दर्शन रांग निवारा (Pandharpur Darshan Queue Shelter)",
    type: "shelter",
    location: { type: "Point", coordinates: [75.3236, 17.6772] },
    contactPhone: "+919876543224",
    description: "विठ्ठल रुक्मिणी मंदिराच्या मुख्य दर्शन रांगेच्या मार्गावर, पत्रा शेडमध्ये वारकऱ्यांसाठी निवारा आहे.",
    available: true,
    verified: true,
  },
  {
    name: "चंद्रभागा वाळवंट वैद्यकीय मदत (Chandrabhaga Medical Help)",
    type: "medical",
    location: { type: "Point", coordinates: [75.3260, 17.6750] },
    contactPhone: "+919876543225",
    description: "चंद्रभागा नदीच्या वाळवंटात, पुंडलिक मंदिराच्या जवळ आपत्कालीन वैद्यकीय पथक हजर आहे.",
    available: true,
    verified: true,
  }
];

async function seed() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(env.MONGODB_URI);
    console.log("Connected to MongoDB successfully.");

    // Create a dummy admin user if none exists
    let admin = await User.findOne({ role: "admin" });
    if (!admin) {
      admin = await User.create({
        name: "Admin User",
        phoneNumber: "+919999999999",
        role: "admin",
        verified: true,
      });
      console.log("Created dummy admin user.");
    }

    // Clear existing services to prevent duplicates
    await Service.deleteMany({});
    console.log("Cleared existing services.");

    // Insert mock services
    const servicesToInsert = mockServices.map(s => ({ ...s, operator: admin._id }));
    await Service.insertMany(servicesToInsert);
    console.log(`Successfully seeded ${servicesToInsert.length} high-fidelity Palkhi Marg location services!`);

  } catch (error) {
    console.error("Failed to seed database:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

seed();
