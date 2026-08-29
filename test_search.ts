async function test() {
  try {
    const res = await fetch("https://nominatim.openstreetmap.org/search?q=Latur,+Maharashtra,+India&format=json&limit=1&countrycodes=in", {
      headers: {
        "User-Agent": "VisavaVoiceAgent/1.0",
      },
    });
    const nominatimData = await res.json();
    console.log("Nominatim Latur:", nominatimData);
    
    // Test the DB
    const dbRes = await fetch("http://localhost:3000/api/v1/services?type=food&lat=18.4088&lng=76.5604&radius=50&limit=5");
    const dbData = await dbRes.json();
    console.log("DB Services near Latur:", dbData);
  } catch (err) {
    console.error(err);
  }
}
test();
