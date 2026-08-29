import { resolveLocation } from "./src/utils/resolveLocation";

async function test() {
  const result1 = await resolveLocation("Vendor tool pool");
  console.log("Result 1:", result1);

  const result2 = await resolveLocation("पंढरपूर");
  console.log("Result 2:", result2);
}

test();
