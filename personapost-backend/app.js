require("dotenv").config();
const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(express.json());
app.use(cors());

// Supabase Client Initialization
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
  },
});

// Helper function for text generation
async function generateTextContent(prompt, profileData, temperature = 0.7) {
  const personaInstruction = `You are a professional social media content creator. Generate polished posts with clean formatting.
    User Profile:
    - Interests: ${profileData.interests?.join(", ") || "N/A"}
    - Profession: ${profileData.profession || "N/A"}
    - Hobbies: ${profileData.hobbies?.join(", ") || "N/A"}
    - Content Themes: ${
      profileData.preferred_content_themes?.join(", ") || "N/A"
    }
    Guidelines:
- Use professional but engaging language
- Format with clean line breaks and bullet points when appropriate
- Never use asterisks for emphasis
- Use emojis sparingly (1-2 per post max)
- Include relevant hashtags at the end`;

  const payload = {
    contents: [
      {
        role: "user",
        parts: [{ text: personaInstruction }],
      },
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature,
      topP: 0.95,
      topK: 60,
    },
    safetySettings: [
      {
        category: "HARM_CATEGORY_HARASSMENT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE",
      },
      {
        category: "HARM_CATEGORY_HATE_SPEECH",
        threshold: "BLOCK_MEDIUM_AND_ABOVE",
      },
      {
        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE",
      },
      {
        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE",
      },
    ],
  };

  const apiKey = process.env.GEMINI_API_KEY;
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
    return result.candidates[0].content.parts[0].text;
  }
  throw new Error(result.error?.message || "Failed to generate text content");
}

// Endpoint to fetch user profile (FR1)
app.get("/api/profile/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    // Query the 'user_profiles' table for the specific user_id
    // Using .single() to expect at most one row
    const { data, error } = await supabase
      .from("user_profiles")
      .select("interests, profession, hobbies, preferred_content_themes") // Select specific columns
      .eq("user_id", userId)
      .single();

    if (error && error.code === "PGRST116") {
      // Supabase error code for no row found with .single()
      console.log(err.message);
      return res.status(404).json({ message: "Profile not found." });
    }
    if (error) {
      throw error; // Re-throw other Supabase errors
    }
    res.status(200).json(data); // data will contain the profile object
  } catch (error) {
    console.error("Error fetching user profile from Supabase:", error);
    res.status(500).json({
      message: "Internal server error while fetching profile.",
      details: error.message,
    });
  }
});

// Endpoint to update/create user profile (FR1)
app.post("/api/profile/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const profileData = req.body; // Profile data sent from the frontend

    // --- Step 1: Ensure user_id exists in public.users table ---
    // This is crucial for the foreign key constraint on public.user_profiles
    const { error: userUpsertError } = await supabase.from("users").upsert(
      {
        id: userId,
        email: `anonymous_user_${userId}@personapost.ai`, // Placeholder email
        created_at: new Date().toISOString(), // Supabase will often set this automatically
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" } // Conflict on 'id' ensures it's only inserted if new
    );

    if (userUpsertError) {
      console.error("Error upserting user into public.users:", userUpsertError);
      // If this fails, we can't proceed to update the profile due to foreign key constraint
      throw new Error(
        `Failed to create or update user entry: ${userUpsertError.message}`
      );
    }
    console.log(`User ${userId} ensured in public.users table.`);

    // --- Step 2: Proceed with upserting into public.user_profiles ---
    const { data, error } = await supabase
      .from("user_profiles")
      .upsert(
        {
          user_id: userId,
          interests: profileData.interests || [],
          profession: profileData.profession || "",
          hobbies: profileData.hobbies || [],
          preferred_content_themes: profileData.preferred_content_themes || [],
          updated_at: new Date().toISOString(), // Explicitly update timestamp
        },
        { onConflict: "user_id" } // Specify primary key for upsert operation
      )
      .select(); // Select the updated/inserted row to return it

    if (error) {
      throw error;
    }
    res
      .status(200)
      .json({ message: "Profile updated successfully.", profile: data[0] });
  } catch (error) {
    console.error("Error updating user profile in Supabase:", error);
    res.status(500).json({
      message: "Internal server error while updating profile.",
      details: error.message,
    });
  }
});

// New endpoint for generating text variations
app.post("/api/generate-text-variations", async (req, res) => {
  const { userId, userMessage, profileData } = req.body;

  if (!userMessage) {
    return res.status(400).json({ message: "User message is required" });
  }
  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: "GEMINI_API_KEY is not configured" });
  }

  try {
    // Generate 3 variations with different temperatures
    const variations = await Promise.all([
      generateTextContent(userMessage, profileData, 0.7),
      generateTextContent(userMessage, profileData, 0.8),
      generateTextContent(userMessage, profileData, 0.6),
    ]);

    // Simple scoring - just return all variations for now
    const result = variations.map((content, index) => ({
      content,
      score: 1 - index * 0.1, // Simple scoring for demo
    }));

    // Save to Supabase
    await supabase.from("generated_content").insert({
      user_id: userId,
      prompt_text: userMessage,
      generated_response: { type: "text_variations", variations: result },
    });

    res.status(200).json({ variations: result });
  } catch (error) {
    console.error("Error generating text variations:", error);
    res.status(500).json({
      message: "Error generating text variations",
      details: error.message,
    });
  }
});

// Existing image generation endpoint (updated to handle text-to-image better)
app.post("/api/generate-image", async (req, res) => {
  const { userId, imagePrompt } = req.body;

  if (!imagePrompt) {
    return res.status(400).json({ message: "Image prompt is required" });
  }
  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: "GEMINI_API_KEY not configured" });
  }

  try {
    const payload = {
      contents: [
        {
          parts: [
            {
              text: `Generate a social media post image based on: ${imagePrompt}`,
            },
          ],
        },
      ],
      generationConfig: {
        responseModalities: ["TEXT", "IMAGE"],
        temperature: 0.9,
      },
    };

    const apiKey = process.env.GEMINI_API_KEY;
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${apiKey}`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API Error: ${JSON.stringify(errorData)}`);
    }

    const result = await response.json();

    let imageUrl = "";
    if (
      result.candidates &&
      result.candidates.length > 0 &&
      result.candidates[0].content &&
      result.candidates[0].content.parts
    ) {
      const imagePart = result.candidates[0].content.parts.find(
        (part) =>
          part.inlineData && part.inlineData.mimeType.startsWith("image/")
      );

      if (imagePart) {
        imageUrl = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
      } else {
        throw new Error("No image data found in response");
      }
    } else {
      throw new Error("Unexpected API response structure");
    }

    await supabase.from("generated_content").insert({
      user_id: userId,
      prompt_text: imagePrompt,
      generated_response: { type: "image", url: imageUrl },
    });

    res.status(200).json({ type: "image", url: imageUrl });
  } catch (error) {
    console.error("Error in image generation:", error);
    res.status(500).json({
      message: "Error generating image",
      details: error.message,
    });
  }
});

// Initialize and start server
async function initializeServer() {
  try {
    console.log("Attempting to connect to Supabase...");
    const { error } = await supabase
      .from("user_profiles")
      .select("user_id")
      .limit(1);

    if (error) throw error;

    console.log("Server connected to Supabase/PostgreSQL");

    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () =>
      console.log(`Server running on http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error("Server initialization failed:", err);
    process.exit(1);
  }
}

initializeServer();
