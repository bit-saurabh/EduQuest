const Groq = require('groq-sdk');

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

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: 'You are an expert learning coach. You always respond with valid JSON only. No explanation, no markdown, no code blocks. Just raw JSON.'
        },
        {
          role: 'user',
          content: `Generate a structured ${durationDays}-day learning roadmap for the following goal.

Goal: "${goal}"
Difficulty: ${difficulty || 'Intermediate'}
Daily time available: ${dailyTimeMinutes || 60} minutes

The JSON must follow this exact schema:
{
  "goal": "string",
  "duration_days": number,
  "roadmap": [
    {
      "day": number,
      "title": "string",
      "topics": ["topic 1", "topic 2"],
      "task": "string (specific actionable task)",
      "estimated_time_minutes": number,
      "quiz": [
        {
          "question": "string",
          "options": ["A. option", "B. option", "C. option", "D. option"],
          "answer": "string (must exactly match one option)"
        }
      ]
    }
  ]
}

Requirements:
- Generate exactly ${durationDays} day entries
- Each day must have 2-4 topics
- Each day must have exactly 3 quiz questions
- Quiz answers must exactly match one of the 4 options
- Tasks must be specific and actionable
- Build progressively from basics to advanced`
        }
      ],
      temperature: 0.7,
      max_tokens: 32000,
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
    if (error.status === 429) {
      return res.status(429).json({ message: 'AI quota exceeded. Please try again later.' });
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