require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const nodemailer = require('nodemailer');

const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const app = express();
app.use(express.json());
app.use(cors());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

const pendingSignups = new Map(); 

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Access denied" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (e) { res.status(400).json({ error: "Invalid Token" }); }
};

const optionalAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = decoded.userId;
    } catch (e) {}
  }
  next();
};

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = email.trim().toLowerCase();
    
    const { data: existingUser } = await supabase.from('users').select('id').eq('email', cleanEmail).single();
    if (existingUser) return res.status(400).json({ error: "Email already in use." });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedPassword = await bcrypt.hash(password, 10);
    
    pendingSignups.set(cleanEmail, { hashedPassword, otp, expiresAt: Date.now() + 10 * 60 * 1000 });

    await transporter.sendMail({
      from: `"Whisper Vault" <${process.env.EMAIL_USER}>`,
      to: cleanEmail,
      subject: "Your Vault Key (Verification Code)",
      html: `<div style="font-family: sans-serif; text-align: center; padding: 40px; background: #0a0a0a; color: white;"><h1 style="color: #a855f7;">WHISPER VAULT</h1><p style="color: #9ca3af;">Your identity verification code is:</p><h2 style="font-size: 40px; letter-spacing: 5px; color: white;">${otp}</h2><p style="color: #9ca3af;">This code expires in 10 minutes. Do not share it.</p></div>`
    });

    res.json({ requireOtp: true, message: "Code sent!" });
  } catch (err) { res.status(500).json({ error: "Error sending verification code" }); }
});

app.post('/api/auth/verify', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const pendingUser = pendingSignups.get(email);

    if (!pendingUser) return res.status(400).json({ error: "Code expired or invalid email." });
    if (pendingUser.otp !== otp) return res.status(400).json({ error: "Incorrect verification code." });
    if (Date.now() > pendingUser.expiresAt) {
      pendingSignups.delete(email);
      return res.status(400).json({ error: "Code expired. Please sign up again." });
    }

    const publicHandle = `Ghost_${Math.floor(Math.random() * 9999)}`;
    const { data: newUser, error } = await supabase.from('users').insert([{ email, passwordHash: pendingUser.hashedPassword, publicHandle }]).select().single();

    if (error) throw error;
    pendingSignups.delete(email); 
    
    const token = jwt.sign({ userId: newUser.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, handle: newUser.publicHandle, userId: newUser.id });
  } catch (err) { res.status(500).json({ error: "Verification failed" }); }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const { data: user, error } = await supabase.from('users').select('*').eq('email', email).single();
    if (error || !user) return res.status(401).json({ error: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (match) {
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
      res.json({ token, handle: user.publicHandle, userId: user.id });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (err) { res.status(500).json({ error: "Login failed" }); }
});

// --- AI ANALYSIS ROUTE (Now featuring FAIL-OPEN) ---
app.post('/api/secrets/analyze', authenticate, async (req, res) => {
  let rawText = ""; 
  try {
    const { content, mood } = req.body;
    
    // We went back to 2.5-flash since we know it works on your machine!
   const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const prompt = `You are a strict JSON-only data processor. Analyze this secret: "${content}"
    Respond ONLY with a valid JSON object matching this exact structure: { "toxic": false, "suggestedMood": "Confession" }
    Rules for toxic: true ONLY if it contains severe hate speech, bullying, credible violent threats, or illegal acts. Venting/frustration is completely fine and should be false.
    Rules for suggestedMood: Must be exactly one of: "Confession", "Vent", "Regret", "Hope", "Funny". Pick the best fit.
    Do NOT include any markdown, code blocks, or conversational text.`;

    const result = await model.generateContent(prompt);
    rawText = result.response.text();
    
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON object found.");

    const aiData = JSON.parse(jsonMatch[0]);

    res.json({
      toxic: aiData.toxic,
      suggestedMood: aiData.suggestedMood,
      match: aiData.suggestedMood?.toLowerCase() === mood.toLowerCase()
    });
    
  } catch (err) {
    console.error("Shield Bypassed (Fail-Open active):", err.message);
    
    // THE ROLLBACK: If Gemini crashes or hits a rate limit, we return "Match: True" and "Toxic: False"
    // This allows the user's whisper to post instantly without the annoying popup!
    return res.json({ 
      toxic: false, 
      suggestedMood: req.body.mood, 
      match: true 
    });
  }
});

// --- SECRET ROUTES ---

// 🎲 MASSIVE FUNNY NAME GENERATOR LISTS
const FUNNY_ADJECTIVES = [
  "Spicy", "Feral", "Sleepy", "Chaotic", "Grumpy", "Sassy", "Awkward", "Dramatic", "Hangry", "Derpy", "Silly", "Vibing",
  "Unhinged", "Caffeinated", "Salty", "Wholesome", "Crispy", "Cursed", "Glitchy", "Toxic", "Based", "Clueless", "Panicking",
  "Cosmic", "Ghostly", "Neon", "Goth", "Emo", "Shadowy", "Phantom", "Midnight", "Radioactive", "Rogue", "Sneaky", "Zen",
  "Majestic", "Clumsy", "Squeaky", "Fluffy", "Funky", "Moist", "Dazzling", "Grubby", "Wobbly", "Chonky", "Smol", "Loud"
];

const FUNNY_NOUNS = [
  "Raccoon", "Possum", "TrashPanda", "Pigeon", "Rat", "Gremlin", "Goblin", "Sloth", "Capybara", "Gecko", "Iguana",
  "Frog", "Penguin", "Platypus", "Hamster", "Puffin", "Walrus", "Otter", "Panda", "Tortoise", "Dino", "Chicken", "Goose",
  "Potato", "Noodle", "Dumpling", "Muffin", "Waffle", "Burrito", "Pineapple", "Marshmallow", "Banana", "Donut", "Bean", "Nugget", "Bagel", "Croissant",
  "Toaster", "Cactus", "Sock", "Roomba", "WiFi", "Pixel", "Brick", "Spoon", "Rock", "Lamp", "Fridge", "Couch"
];

const generateMask = (id) => {
  const seed1 = Math.abs(Math.sin(id) * 10000);
  const seed2 = Math.abs(Math.cos(id) * 10000);

  const adj = FUNNY_ADJECTIVES[Math.floor(seed1) % FUNNY_ADJECTIVES.length];
  const noun = FUNNY_NOUNS[Math.floor(seed2) % FUNNY_NOUNS.length];
  
  return `${adj}${noun}`;
};

app.post('/api/secrets', authenticate, async (req, res) => {
  try {
    const { content, mood } = req.body;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await supabase.from('secrets').insert([{ content, mood, authorId: req.userId, expiresAt }]).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) { res.status(500).json({ error: "Failed to whisper" }); }
});

app.get('/api/secrets', optionalAuth, async (req, res) => {
  try {
    const now = new Date().toISOString();
    const { data: secrets, error } = await supabase
      .from('secrets')
      .select('*, reactions(type, userId), replies(*)')
      .gt('expiresAt', now)
      .order('createdAt', { ascending: false });

    if (error) throw error;
    
    const enhancedSecrets = secrets.map(s => ({
      ...s,
      mask: generateMask(s.id),
      likes: s.reactions.filter(r => r.type === 'like').length,
      dislikes: s.reactions.filter(r => r.type === 'dislike').length,
      userReaction: req.userId ? s.reactions.find(r => r.userId === req.userId)?.type : null
    }));
    
    res.json(enhancedSecrets);
  } catch (err) { res.status(500).json({ error: "Failed to fetch" }); }
});

app.get('/api/secrets/me', authenticate, async (req, res) => {
  try {
    const { data: secrets, error } = await supabase
      .from('secrets')
      .select('*, reactions(type, userId), replies(*)')
      .eq('authorId', req.userId)
      .order('createdAt', { ascending: false });

    if (error) throw error;

    const enhancedSecrets = secrets.map(s => ({
      ...s,
      mask: generateMask(s.id),
      likes: s.reactions.filter(r => r.type === 'like').length,
      dislikes: s.reactions.filter(r => r.type === 'dislike').length,
      userReaction: s.reactions.find(r => r.userId === req.userId)?.type
    }));

    res.json(enhancedSecrets);
  } catch (err) { res.status(500).json({ error: "Failed to fetch private vault" }); }
});

app.post('/api/secrets/:id/react', authenticate, async (req, res) => {
  try {
    const secretId = req.params.id;
    const { type } = req.body; 
    const { data: existing } = await supabase.from('reactions').select('*').eq('secretId', secretId).eq('userId', req.userId).single();

    if (existing) {
      if (existing.type === type) await supabase.from('reactions').delete().eq('id', existing.id);
      else await supabase.from('reactions').update({ type }).eq('id', existing.id);
    } else {
      await supabase.from('reactions').insert([{ secretId, userId: req.userId, type }]);
    }
    res.json({ message: "Success" });
  } catch (err) { res.status(500).json({ error: "Failed to react" }); }
});

app.post('/api/secrets/:id/reply', authenticate, async (req, res) => {
  try {
    const { data, error } = await supabase.from('replies').insert([{ secretId: req.params.id, authorId: req.userId, content: req.body.content }]).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) { res.status(500).json({ error: "Failed to reply" }); }
});

// --- KEEPER ROUTE (Also featuring FAIL-OPEN) ---
app.post('/api/secrets/:id/ask-keeper', authenticate, async (req, res) => {
  try {
    const { data: secret } = await supabase.from('secrets').select('*').eq('id', req.params.id).single();
    if (!secret) return res.status(404).json({error: "Secret not found"});

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    const keeperPrompt = `A user shared a secret: "${secret.content}". Write a short, deeply empathetic 1-2 sentence reply. Validate their feelings. Do not give advice. Sign it "- The Vault Keeper"`;
    const keeperResult = await model.generateContent(keeperPrompt);

    await supabase.from('replies').insert([{ secretId: req.params.id, authorId: null, content: keeperResult.response.text() }]);
    res.json({ success: true });
  } catch (err) { 
    console.error("Keeper Bypassed (Fail-Open active)");
    // If the Keeper hits a rate limit, it just gives a generic, empathetic fallback response!
    await supabase.from('replies').insert([{ secretId: req.params.id, authorId: null, content: "I am here, and I am listening. - The Vault Keeper" }]);
    res.json({ success: true }); 
  }
});

app.delete('/api/secrets/:id', authenticate, async (req, res) => {
  try {
    await supabase.from('secrets').delete().eq('id', req.params.id).eq('authorId', req.userId);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: "Failed to delete" }); }
});

app.delete('/api/replies/:id', authenticate, async (req, res) => {
  try {
    await supabase.from('replies').delete().eq('id', req.params.id).eq('authorId', req.userId);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: "Failed to delete" }); }
});

setInterval(async () => {
  const now = new Date().toISOString();
  await supabase.from('secrets').delete().lt('expiresAt', now);
}, 3600000);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Advanced AI Server running on port ${PORT}`));