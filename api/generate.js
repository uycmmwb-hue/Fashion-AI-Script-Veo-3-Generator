export default async function handler(req, res) {
  try {
    // Đọc body request (JSON)
    const body = await new Promise((resolve) => {
      let data = "";
      req.on("data", (chunk) => (data += chunk));
      req.on("end", () => resolve(JSON.parse(data || "{}")));
    });

    const { prompt } = body;

    if (!process.env.GEMINI_API_KEY) {
      return res
        .status(400)
        .json({ error: "Missing GEMINI_API_KEY in environment" });
    }

    if (!prompt) {
      return res.status(400).json({ error: "Missing prompt in request body" });
    }

    // Gọi Gemini Text (generateContent)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error("SERVER ERROR /api/generate:", error);
    return res
      .status(500)
      .json({ error: "Server failure", details: String(error) });
  }
}
