const OpenAI = require('openai');

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const CATEGORIES = {
  internship: 'Internship opportunity',
  placement: 'Full-time placement/job opportunity',
  research: 'Research paper or research project opportunity',
  project: 'Project or hackathon opportunity'
};

async function categorizeEmail(subject, body, from) {
  // Combine subject and body for better context
  const emailContent = `
Subject: ${subject}
From: ${from}
Body: ${body.substring(0, 1000)}
  `.trim();

  const prompt = `You are an email categorizer. Categorize the following email into ONE of these categories:
- internship: Internship opportunity or internship-related email
- placement: Full-time job offer, placement drive, or career opportunity
- research: Research paper opportunity, research collaboration, or academic research
- project: Project opportunity, hackathon, or coding competition

Email content:
${emailContent}

Respond with ONLY the category name (internship, placement, research, or project). If it doesn't fit any category, respond with "other".`;

  if (!openai) {
    console.warn('OPENAI_API_KEY is not set. Using keyword-based categorization fallback.');
    return categorizeByKeywords(subject, body);
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 10
    });

    const category = response.choices[0].message.content.trim().toLowerCase();
    
    if (['internship', 'placement', 'research', 'project'].includes(category)) {
      return category;
    }

    return categorizeByKeywords(subject, body);

  } catch (error) {
    console.error('AI categorization error:', error);
    return categorizeByKeywords(subject, body);
  }
}

function categorizeByKeywords(subject, body) {
  const text = (subject + ' ' + body).toLowerCase();

  const internshipKeywords = ['internship', 'intern', 'summer internship', 'winter internship', 'co-op'];
  const placementKeywords = ['placement', 'job offer', 'full-time', 'position', 'hired', 'onboarding', 'joining'];
  const researchKeywords = ['research', 'paper', 'publication', 'conference', 'collaboration', 'research paper'];
  const projectKeywords = ['hackathon', 'project', 'competition', 'coding challenge', 'competition'];

  if (internshipKeywords.some(kw => text.includes(kw))) return 'internship';
  if (placementKeywords.some(kw => text.includes(kw))) return 'placement';
  if (researchKeywords.some(kw => text.includes(kw))) return 'research';
  if (projectKeywords.some(kw => text.includes(kw))) return 'project';

  return 'all';
}

module.exports = { categorizeEmail };
