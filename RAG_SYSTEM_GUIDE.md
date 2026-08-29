# Building the Visava Geospatial RAG System

To build a powerful RAG (Retrieval-Augmented Generation) system that helps Warkaris find exact locations, food, and medical camps based on natural language queries (e.g., *"I am near the Pandharpur ST stand, where can I get sabudana khichdi?"*), your friend should combine **Semantic Vector Search** with **Geospatial Filtering**.

Since you are already using MongoDB, the absolute best tool for this is **MongoDB Atlas Vector Search**.

---

## 1. How the Architecture Should Work

A traditional RAG system only looks at text similarity. For Visava, location is just as important as the text. Your friend needs to build a **Hybrid Geospatial RAG**:

1. **User asks:** "Where can I get fasting food near Alandi?"
2. **Step 1: Extract Location:** The LLM (or a simple script) extracts the city ("Alandi") or coordinates.
3. **Step 2: Generate Vector:** The user's query ("fasting food, sabudana") is converted into a vector embedding (using OpenAI `text-embedding-3-small` or HuggingFace).
4. **Step 3: MongoDB Atlas Vector Search:** 
   - First, MongoDB uses `$geoWithin` or `$geoNear` to filter out all services that are NOT in Alandi.
   - Then, it performs a Vector Search on the remaining documents to find the highest semantic match to "fasting food".
5. **Step 4: LLM Response:** The system takes the top 3 database results (which include exact coordinates, road instructions, and contact info) and passes them to the AI to generate a natural, helpful response.

---

## 2. What to Share With Your Friend

To get started, you need to share the following with your friend:

### A. The Data Schema (Mongoose)
Share the `core-api/src/schemas/services.ts` file or copy-paste this schema so they know exactly what data they are embedding:
```typescript
{
  name: string;             // e.g., "Mauli Sabudana Khichdi Kendra"
  type: string;             // e.g., "food", "medical"
  city: string;             // e.g., "Alandi"
  description: string;      // IMPORTANT: Contains the "Road Instructions" and details
  location: {
    type: "Point",
    coordinates: [longitude, latitude] // Essential for Geo-filtering
  },
  embedding: number[]       // Your friend will need to add this array field for the vectors!
}
```

### B. The `backendinfo.md` File
Share the `backendinfo.md` file we just created. It gives them the full context of how the backend works, the API routes, and how data flows.

### C. MongoDB Access
If your database is hosted on MongoDB Atlas, you need to give them:
1. The **MongoDB Connection String** (`MONGODB_URI`).
2. Access to the **MongoDB Atlas UI**, because they will need to manually click the "Create Vector Search Index" button in the Atlas dashboard to enable vector queries.

---

## 3. Implementation Steps for Your Friend

Here is a quick roadmap for your friend to follow:

### Step 1: Create the Embeddings Script
Write a small Node.js or Python script that connects to your MongoDB, reads all documents in the `services` and `camps` collections, combines the `name`, `type`, and `description` into a single string, and sends it to OpenAI to get a vector embedding. Save that vector back into the document as an `embedding` array.

### Step 2: Create the Atlas Search Index
In the MongoDB Atlas Dashboard, create a Vector Search Index on the `embedding` field. 

```json
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 1536,
      "similarity": "cosine"
    },
    {
      "type": "filter",
      "path": "location"
    }
  ]
}
```

### Step 3: Write the Search Query (Aggregation Pipeline)
When a user asks a question, your friend will run an aggregation pipeline that looks like this:

```javascript
const results = await Service.aggregate([
  {
    "$vectorSearch": {
      "index": "vector_index",
      "path": "embedding",
      "queryVector": userQueryEmbedding,
      "numCandidates": 100,
      "limit": 3,
      "filter": {
        // Optional: Filter by city or bounding box if known
        "city": "Alandi" 
      }
    }
  }
]);
```

### Step 4: Plug into Vapi
Once this search function is built, replace the logic inside your `find_nearby_services` webhook (in `vapiToolController.ts`) with this new RAG function. Now, when Vapi asks for food, it will do a highly intelligent semantic search instead of a basic text match!

---

## 4. Building the RAG as a Standalone Microservice (Recommended)

Since you want to deploy and use this RAG system separately (which is highly recommended for scalability), your friend should build it as an independent microservice. Here is the blueprint for a **Standalone RAG Service**:

### A. Recommended Tech Stack
- **Language/Framework:** Python + FastAPI (Python is the king of AI/RAG ecosystems).
- **Orchestration:** LangChain or LlamaIndex.
- **Embeddings:** `text-embedding-3-small` (OpenAI).
- **Database:** MongoDB Atlas (already in use).

### B. Microservice Architecture
Instead of putting the RAG code inside your Node.js `core-api`, create a new folder (e.g., `rag-service`). This service will expose two primary REST endpoints:

1. `POST /api/v1/rag/sync`
   - **Purpose:** Keeps the vector database up to date.
   - **How it works:** Whenever a new Service or Camp is created in your Node.js `core-api`, the Node.js server sends a Webhook to this endpoint. The FastAPI RAG service generates the embedding and saves it to MongoDB.

2. `POST /api/v1/rag/search`
   - **Purpose:** The actual AI search endpoint.
   - **Payload:** `{ "query": "I need cold drinking water", "lat": 18.5204, "lng": 73.8567, "radius": 5 }`
   - **How it works:** 
     1. Uses LangChain to embed the query.
     2. Runs the MongoDB `$vectorSearch` with the `$geoNear` filter.
     3. Uses an LLM (like GPT-4o-mini) to summarize the top 3 MongoDB results into a clean, human-readable sentence.
     4. Returns the natural language answer.

### C. Integrating with the Visava Ecosystem
Once the `rag-service` is running:
- Point the **Vapi Voice Agent** directly to the `POST /api/v1/rag/search` endpoint. When Vapi needs data, it hits the RAG service, gets a perfect conversational answer, and reads it back to the user.
- Point the **React Frontend** to this endpoint for a "Smart Search Bar" where users can type natural questions instead of using dropdown filters.

---

## 5. Deployment Guide for the RAG Service

Because this is a separate microservice, you can deploy it independently from your Node.js backend.

### Option 1: Render.com (Easiest)
1. Push the `rag-service` to a GitHub repository.
2. Connect Render to the repo and create a "Web Service".
3. Build Command: `pip install -r requirements.txt`
4. Start Command: `uvicorn main:app --host 0.0.0.0 --port 10000`
5. Add your `OPENAI_API_KEY` and `MONGODB_URI` as Environment Variables in the Render dashboard.

### Option 2: Railway.app (Best for Monorepos)
If you keep the `rag-service` inside the main `Visava` repository:
1. Connect Railway to the Visava repo.
2. Railway will automatically detect the `requirements.txt` in the `rag-service` folder.
3. It gives you a public URL instantly with zero-config SSL.

### Option 3: Docker (For maximum control)
Write a simple `Dockerfile` for the FastAPI app:
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```
You can deploy this Docker image to AWS ECS, Google Cloud Run, or DigitalOcean App Platform.
