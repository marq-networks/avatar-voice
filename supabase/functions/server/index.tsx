import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-27901724/health", (c) => {
  return c.json({ status: "ok" });
});

// Submit avatar intake form
app.post("/make-server-27901724/submit-intake", async (c) => {
  try {
    const body = await c.req.json();
    const { submissionId, formData, metadata, stepMapping } = body;

    if (!submissionId || !formData) {
      return c.json({ error: "Missing submissionId or formData" }, 400);
    }

    // Log received data for debugging
    console.log('Received submission with fields:', Object.keys(formData));
    console.log('Sample fields:', {
      productName: formData.productName,
      avatarType: formData.avatarType,
      voiceGender: formData.voiceGender,
      version: formData.version,
    });

    // Save the full form submission as proper JSON object
    const submissionKey = `avatar_intake:${submissionId}`;
    
    // Build structured answers with step names
    const answers = {};
    if (stepMapping && typeof stepMapping === 'object') {
      // Use step mapping to create readable field names
      Object.entries(formData).forEach(([fieldKey, value]) => {
        if (value !== null && value !== undefined && 
            !(value instanceof Blob) && 
            (!Array.isArray(value) || (Array.isArray(value) && value.length > 0 && !(value[0] instanceof Blob)))) {
          
          const stepInfo = stepMapping[fieldKey];
          if (stepInfo) {
            // Store with step title as key
            answers[stepInfo.title] = {
              field: fieldKey,
              value: value,
              description: stepInfo.description,
              stepId: stepInfo.id
            };
          } else {
            // Fallback for fields without mapping (id, version, etc)
            answers[fieldKey] = value;
          }
        } else if (Array.isArray(value) && value.length > 0 && value[0] instanceof Blob) {
          const stepInfo = stepMapping[fieldKey];
          const fieldName = stepInfo ? stepInfo.title : fieldKey;
          answers[fieldName] = {
            field: fieldKey,
            value: `${value.length} file(s) uploaded`,
            description: stepInfo?.description
          };
        }
      });
    }

    const submissionValue = {
      id: submissionId,
      submittedAt: new Date().toISOString(),
      version: formData.version || metadata?.version || 1,
      productName: formData.productName || metadata?.fullName || "Anonymous",
      
      // Store all answers with step names
      answers: answers,
      
      // Also keep raw data for backwards compatibility
      rawData: {
        ...formData
      },
      
      _metadata: {
        fullName: metadata?.fullName || formData.productName || "Anonymous",
        email: metadata?.email || "",
        version: metadata?.version || formData.version || 1,
        submissionDate: formData.submissionDate || new Date().toISOString(),
        totalSteps: Object.keys(stepMapping || {}).length
      },
    };

    // Store as JSONB (no stringify)
    await kv.set(submissionKey, submissionValue);
    console.log(`Saved form submission: ${submissionKey} with ${Object.keys(answers).length} answered questions`);

    // Update the index
    const indexKey = "avatar_intake_index";
    let index = [];
    
    try {
      const existingIndex = await kv.get(indexKey);
      if (existingIndex) {
        index = Array.isArray(existingIndex) ? existingIndex : [];
      }
    } catch (e) {
      console.log("No existing index found, creating new one");
    }

    // Add new entry to index
    const indexEntry = {
      submissionId,
      createdAt: new Date().toISOString(),
      fullName: metadata?.fullName || formData.productName || "Anonymous",
      email: metadata?.email || "",
      version: metadata?.version || formData.version || 1,
    };

    // Prepend new entry and keep last 200
    index = [indexEntry, ...index].slice(0, 200);
    
    // Store as JSONB array (no stringify)
    await kv.set(indexKey, index);
    console.log(`Updated intake index with ${index.length} entries`);

    return c.json({ 
      success: true, 
      submissionId,
      message: "Form submitted successfully",
      fieldsStored: Object.keys(answers).length
    });

  } catch (error) {
    console.error("Error submitting intake form:", error);
    return c.json({ 
      error: "Failed to submit form",
      details: error.message 
    }, 500);
  }
});

// Get all submissions (for history page)
app.get("/make-server-27901724/get-intake-index", async (c) => {
  try {
    const indexKey = "avatar_intake_index";
    const indexData = await kv.get(indexKey);
    
    if (!indexData) {
      return c.json({ submissions: [] });
    }

    // indexData is already a proper array from JSONB
    const index = Array.isArray(indexData) ? indexData : [];
    return c.json({ submissions: index });

  } catch (error) {
    console.error("Error fetching intake index:", error);
    return c.json({ 
      error: "Failed to fetch submissions",
      details: error.message 
    }, 500);
  }
});

// Get specific submission by ID
app.get("/make-server-27901724/get-intake/:id", async (c) => {
  try {
    const submissionId = c.req.param("id");
    const submissionKey = `avatar_intake:${submissionId}`;
    
    const data = await kv.get(submissionKey);
    
    if (!data) {
      return c.json({ error: "Submission not found" }, 404);
    }

    // data is already a proper object from JSONB
    return c.json({ submission: data });

  } catch (error) {
    console.error("Error fetching submission:", error);
    return c.json({ 
      error: "Failed to fetch submission",
      details: error.message 
    }, 500);
  }
});

Deno.serve(app.fetch);