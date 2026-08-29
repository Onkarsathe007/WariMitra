import axios from "axios";
const VAPI_KEY = "cf73b21f-baf6-42dd-b7f7-fe46c57291d1";
async function run() {
  try {
    const res = await axios.patch("https://api.vapi.ai/assistant/d6699c02-c244-44e5-9761-9f26cd73f58b", {
      model: {
        toolIds: [
          "acfef5fc-2e51-4a37-836c-67de13d618d1",
          "79395c96-e9fc-45f3-bfcf-67365609a46c",
          "e2823ffd-22e6-4764-b76a-02335632e387",
          "7e1bb2c0-fac1-4fb6-8d9d-bf281a3ae702",
          "39e5bacd-527f-4eec-a83b-5ceeabf276e5",
          "ad2097fb-7247-4255-b3cc-c668bcb02801",
          "f713fce6-c00e-49bc-a50b-b5b96e8feb01",
          "c795afcb-d4ef-4b7b-a22c-8ac3cf8c67a7"
        ]
      }
    }, { headers: { Authorization: `Bearer ${VAPI_KEY}` } });
    console.log("Success with model.toolIds");
  } catch(e: any) {
    console.error("model.toolIds Failed:", e.response?.data);
    try {
      const res2 = await axios.patch("https://api.vapi.ai/assistant/d6699c02-c244-44e5-9761-9f26cd73f58b", {
        model: {
          tools: [
             // Wait, if it's full objects, we can't do it easily.
          ]
        }
      }, { headers: { Authorization: `Bearer ${VAPI_KEY}` } });
    } catch(e2: any) {}
  }
}
run();
