export default async function handler(req, res) {
  try {
    const body = await new Promise((resolve) => {
      let data = "";
      req.on("data", (chunk) => (data += chunk));
      req.on("end", () => resolve(JSON.parse(data || "{}")));
    });

    const { base64Image } = body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(400).json({ error: "Missing GEMINI_API_KEY" });
    }

    if (!base64Image) {
      return res.status(400).json({ error: "Missing image Base64 data" });
    }

    const payload = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `
You are a Fashion AI Product Analyst.
Analyze this product image. Return results in plain JSON (no explanation text).
Fields:
- category
- fabric
- color_tone
- style
- age_target
- usp: array of 5 short bullet strings
- brand_tone
`
            },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: base64Image.replace(/^data:image\/\w+;base64,/, "")
              }
            }
          ]
        }
      ]
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const result = await response.json();
    return res.status(200).json(result);
  } catch (error) {
    console.error("Vision API ERROR:", error);
    return res
      .status(500)
      .json({ error: "Vision Server Error", details: String(error) });
  }
}
