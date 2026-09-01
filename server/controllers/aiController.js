const Groq = require('groq-sdk');
/**Groq is giving error fix it */
const getGroqClient = () => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not set in environment variables.');
  }
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
};

// Helper: clean and parse JSON from AI response
const parseAIResponse = (text) => {
  // Strip markdown code blocks
  let cleaned = text
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();

  // Try direct parse first
  try {
    return JSON.parse(cleaned);
  } catch (_) {}

  // Try extracting JSON object
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
    } catch (_) {}
  }

  // Try extracting JSON array
  const firstBracket = cleaned.indexOf('[');
  const lastBracket = cleaned.lastIndexOf(']');
  if (firstBracket !== -1 && lastBracket !== -1) {
    try {
      return JSON.parse(cleaned.slice(firstBracket, lastBracket + 1));
    } catch (_) {}
  }

  throw new Error('Could not parse JSON from AI response');
};

// POST /api/ai/generate-roadmap
const generateRoadmap = async (req, res) => {
  try {
    const { goal, durationDays, difficulty, dailyTimeMinutes } = req.body;

    if (!goal || !durationDays) {
      return res.status(400).json({ message: 'Goal and duration are required.' });
    }

    if (durationDays > 90) {
      return res.status(400).json({ message: 'Maximum roadmap duration is 90 days.' });
    }

    const groq = getGroqClient();

    // Groq free tier: 12,000 TPM limit. Keep output lean.
    // For longer roadmaps, reduce quiz questions to 1 per day to fit within limits.
    const quizCount = durationDays <= 14 ? 3 : durationDays <= 30 ? 2 : 1;
    const maxTokens = Math.min(8000, durationDays * 220);

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: 'You are a learning coach. Respond with valid JSON only. No markdown, no code blocks. Raw JSON only.'
        },
        {
          role: 'user',
          content: `Generate a ${durationDays}-day learning roadmap.

Goal: "${goal}"
Difficulty: ${difficulty || 'Intermediate'}
Daily time: ${dailyTimeMinutes || 60} minutes

JSON schema:
{"goal":"string","duration_days":number,"roadmap":[{"day":number,"title":"string","topics":["topic1","topic2"],"task":"string","estimated_time_minutes":number,"quiz":[{"question":"string","options":["A. opt","B. opt","C. opt","D. opt"],"answer":"string"}]}]}

Rules:
- Exactly ${durationDays} day entries
- 2-3 topics per day (keep topic names short)
- Exactly ${quizCount} quiz question(s) per day
- Answer must exactly match one option
- Build progressively from basics to advanced`
        }
      ],
      temperature: 0.7,
      max_tokens: maxTokens,
    });

    const responseText = completion.choices[0]?.message?.content || '';
console.log('RAW AI RESPONSE:', responseText.slice(0, 500)); // ADD THIS

    let parsed;
    try {
      parsed = parseAIResponse(responseText);
    } catch (parseError) {
      console.error('AI response parse error:', parseError);
      return res.status(502).json({ message: 'AI returned malformed data. Please try again.' });
    }

    if (!parsed.roadmap || !Array.isArray(parsed.roadmap)) {
      return res.status(502).json({ message: 'AI returned invalid roadmap structure.' });
    }

    const sanitizedRoadmap = parsed.roadmap.map((day, index) => ({
      day: day.day || index + 1,
      title: day.title || `Day ${index + 1}`,
      topics: Array.isArray(day.topics) ? day.topics : [],
      task: day.task || '',
      estimated_time_minutes: day.estimated_time_minutes || dailyTimeMinutes || 60,
      quiz: Array.isArray(day.quiz) ? day.quiz.filter(q => q.question && q.options && q.answer) : []
    }));

    res.status(200).json({
      roadmap: sanitizedRoadmap,
      goal: parsed.goal || goal,
      duration_days: durationDays
    });

  } catch (error) {
    console.error('Generate roadmap error:', error);
    if (error.status === 429 || error.status === 413) {
      return res.status(429).json({ message: 'Request too large for free tier. Try a shorter duration (≤ 30 days) or try again later.' });
    }
    res.status(500).json({ message: 'Failed to generate roadmap. Please try again.' });
  }
};

// POST /api/ai/generate-content
const generateStudyContent = async (req, res) => {
  try {
    const { topic, context } = req.body;

    if (!topic) {
      return res.status(400).json({ message: 'Topic is required.' });
    }

    const groq = getGroqClient();

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are an expert educator. You always respond with valid JSON only. No explanation, no markdown, no code blocks. Just raw JSON.'
        },
        {
          role: 'user',
          content: `Explain the following topic clearly and concisely.

Topic: "${topic}"
${context ? `Context (the user's learning goal): "${context}"` : ''}

Schema:
{
  "topic": "string",
  "summary": "string (2-3 sentence overview)",
  "key_points": ["point 1", "point 2", "point 3", "point 4"],
  "examples": [
    { "title": "string", "description": "string" }
  ],
  "tips": ["tip 1", "tip 2", "tip 3"]
}`
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const responseText = completion.choices[0]?.message?.content || '';

    let parsed;
    try {
      parsed = parseAIResponse(responseText);
    } catch (parseError) {
      console.error('Content parse error:', parseError);
      return res.status(502).json({ message: 'AI returned malformed content. Please try again.' });
    }

    res.status(200).json(parsed);

  } catch (error) {
    console.error('Generate content error:', error);
    if (error.status === 429) {
      return res.status(429).json({ message: 'AI quota exceeded. Please try again later.' });
    }
    res.status(500).json({ message: 'Failed to generate study content. Please try again.' });
  }
};

module.exports = { generateRoadmap, generateStudyContent };
