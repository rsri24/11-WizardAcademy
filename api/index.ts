import express from "express";
import Database from "better-sqlite3";
import path from "path";
import os from "os";
import { rateLimit } from "express-rate-limit";
import { z } from "zod";

const dbPath = path.join(os.tmpdir(), "academy.db");
const db = new Database(dbPath);

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    name TEXT,
    age INTEGER,
    class TEXT,
    role TEXT DEFAULT 'STUDENT',
    level INTEGER DEFAULT 1,
    exp INTEGER DEFAULT 0,
    mana INTEGER DEFAULT 0,
    stars INTEGER DEFAULT 0,
    avatar TEXT
  );

  CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT,
    question TEXT,
    options TEXT,
    correct_option INTEGER,
    explanation TEXT,
    difficulty INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    question_id INTEGER,
    is_correct BOOLEAN,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(question_id) REFERENCES questions(id)
  );

  CREATE TABLE IF NOT EXISTS badges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    icon TEXT,
    requirement_type TEXT,
    requirement_value INTEGER
  );

  CREATE TABLE IF NOT EXISTS user_badges (
    user_id INTEGER,
    badge_id INTEGER,
    earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(user_id, badge_id),
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(badge_id) REFERENCES badges(id)
  );
`);

// Seed sample questions if empty
const questionCount = db.prepare("SELECT COUNT(*) as count FROM questions").get() as { count: number };
if (questionCount.count === 0) {
  const insertQuestion = db.prepare("INSERT INTO questions (category, question, options, correct_option, explanation) VALUES (?, ?, ?, ?, ?)");

  insertQuestion.run('Maths', 'If 4 dragon scales require 12 grams of moon dust for a potion, how many grams are needed for 7 scales?', JSON.stringify(['18 Grams', '21 Grams', '24 Grams', '28 Grams']), 1, 'Each scale needs 3 grams (12/4). So 7 scales need 7 * 3 = 21 grams.');
  insertQuestion.run('Maths', 'A rectangular magic carpet has an area of 48 square feet. If its length is 8 feet, what is its perimeter?', JSON.stringify(['14 feet', '28 feet', '32 feet', '40 feet']), 1, 'Width = Area / Length = 48 / 8 = 6 feet. Perimeter = 2 * (Length + Width) = 2 * (8 + 6) = 28 feet.');
  insertQuestion.run('English', 'Choose the correctly spelled word to complete the sentence: The wizard was very _______ about his secret spells.', JSON.stringify(['Cautious', 'Cautios', 'Cautius', 'Caucious']), 0, 'Cautious is the correct spelling.');
  insertQuestion.run('English', 'Which of these is a synonym for "Ancient"?', JSON.stringify(['Modern', 'Antique', 'New', 'Recent']), 1, 'Antique means very old, similar to ancient.');
  insertQuestion.run('Verbal', 'If WIZARD is coded as XJABSE, how is MAGIC coded?', JSON.stringify(['NBHJD', 'NBHJE', 'NCHJD', 'NBGJD']), 0, 'Each letter is shifted by one position in the alphabet (M->N, A->B, G->H, I->J, C->D).');
  insertQuestion.run('Non-Verbal', 'Which shape comes next in the sequence: Square, Triangle, Square, Triangle, ...?', JSON.stringify(['Circle', 'Square', 'Pentagon', 'Hexagon']), 1, 'The sequence alternates between Square and Triangle.');
}

// Seed badges
const badgeCount = db.prepare("SELECT COUNT(*) as count FROM badges").get() as { count: number };
if (badgeCount.count === 0) {
  const insertBadge = db.prepare("INSERT INTO badges (name, description, icon, requirement_type, requirement_value) VALUES (?, ?, ?, ?, ?)");
  insertBadge.run('Master Alchemist', 'Awarded for completing 50 Alchemy puzzles with perfect accuracy!', 'FlaskConical', 'questions_maths', 50);
  insertBadge.run('Word Weaver', 'Mastered 100 English incantations.', 'BookOpen', 'questions_english', 100);
  insertBadge.run('Logic Legend', 'Solved the Sphinx riddles.', 'Bolt', 'questions_verbal', 50);
  insertBadge.run('Flora Finder', 'Identified 20 magical plants.', 'Sparkles', 'questions_nonverbal', 20);
}

// --- Express App ---
const app = express();
app.use(express.json());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: "Too many magical requests, please wait a while." }
});

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: "Too many login attempts. Are you a dark wizard?" }
});

app.use("/api/", apiLimiter);
app.use("/api/user", authLimiter);

// Health check
app.get("/api/health", (_req, res) => {
  try {
    db.prepare("SELECT 1").get();
    res.json({ status: "healthy", timestamp: new Date().toISOString(), database: "connected" });
  } catch (e) {
    res.status(500).json({ status: "unhealthy", error: "Database connection failed" });
  }
});

// Input validation
const UserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(50),
  age: z.union([z.number(), z.string()]).optional(),
  class: z.string().optional(),
  role: z.enum(['STUDENT', 'PARENT', 'ADMIN']).default('STUDENT')
});

// Get user by email
app.get("/api/user/:email", (req, res) => {
  try {
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(req.params.email);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: "Wizard not found. Please create an account." });
    }
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch wizard details" });
  }
});

// Create user
app.post("/api/user", (req, res) => {
  const validation = UserSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: "Invalid magical data", details: validation.error.format() });
  }

  const { email, name, age, class: userClass, role } = validation.data;
  try {
    const info = db.prepare("INSERT INTO users (email, name, age, class, role) VALUES (?, ?, ?, ?, ?)").run(email, name, age, userClass, role);
    res.json({ id: info.lastInsertRowid });
  } catch (e) {
    res.status(400).json({ error: "Wizard already exists or invalid data" });
  }
});

// Questions
app.get("/api/questions/:category", (req, res) => {
  const questions = db.prepare("SELECT * FROM questions WHERE category = ?").all(req.params.category);
  res.json(questions.map((q: any) => ({ ...q, options: JSON.parse(q.options) })));
});

// Progress
app.post("/api/progress", (req, res) => {
  const { userId, questionId, isCorrect } = req.body;
  db.prepare("INSERT INTO progress (user_id, question_id, is_correct) VALUES (?, ?, ?)").run(userId, questionId, isCorrect ? 1 : 0);

  if (isCorrect) {
    db.prepare("UPDATE users SET exp = exp + 10, mana = mana + 25, stars = stars + 1 WHERE id = ?").run(userId);
    const user = db.prepare("SELECT exp, level FROM users WHERE id = ?").get(userId) as { exp: number, level: number };
    const newLevel = Math.floor(user.exp / 100) + 1;
    if (newLevel > user.level) {
      db.prepare("UPDATE users SET level = ? WHERE id = ?").run(newLevel, userId);
    }
  }

  res.json({ success: true });
});

// Leaderboard
app.get("/api/leaderboard", (_req, res) => {
  const topWizards = db.prepare("SELECT name, level, exp, avatar FROM users ORDER BY exp DESC LIMIT 10").all();
  res.json(topWizards);
});

// Admin middleware
const isAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const userEmail = req.headers['x-user-email'];
  if (!userEmail) return res.status(401).json({ error: "Unauthorized" });

  const user = db.prepare("SELECT role FROM users WHERE email = ?").get(userEmail) as { role: string };
  if (user && user.role === 'ADMIN') {
    next();
  } else {
    res.status(403).json({ error: "Forbidden: Admin access required" });
  }
};

app.post("/api/admin/questions/bulk", isAdmin, (req, res) => {
  const { questions } = req.body;
  if (!Array.isArray(questions)) {
    return res.status(400).json({ error: "Invalid questions format. Expected an array." });
  }

  const insertQuestion = db.prepare("INSERT INTO questions (category, question, options, correct_option, explanation, difficulty) VALUES (?, ?, ?, ?, ?, ?)");
  const transaction = db.transaction((qs: any[]) => {
    for (const q of qs) {
      insertQuestion.run(q.category, q.question, JSON.stringify(q.options), q.correct_option, q.explanation, q.difficulty || 1);
    }
  });

  try {
    transaction(questions);
    res.json({ success: true, count: questions.length });
  } catch (e) {
    res.status(500).json({ error: "Failed to bulk upload questions" });
  }
});

app.get("/api/admin/stats", isAdmin, (_req, res) => {
  const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
  const questionCount = db.prepare("SELECT COUNT(*) as count FROM questions").get() as { count: number };
  const categories = db.prepare("SELECT category, COUNT(*) as count FROM questions GROUP BY category").all();
  const todayAnswers = (db.prepare("SELECT COUNT(*) as count FROM progress WHERE date(timestamp) = date('now')").get() as { count: number }).count;
  res.json({ userCount: userCount.count, questionCount: questionCount.count, categories, todayAnswers });
});

app.get("/api/admin/users", isAdmin, (_req, res) => {
  const users = db.prepare("SELECT id, name, email, role, level, exp, class FROM users ORDER BY id DESC").all();
  res.json(users);
});

app.get("/api/admin/logs", isAdmin, (_req, res) => {
  const logs = db.prepare(`
    SELECT p.*, u.name as user_name, q.category
    FROM progress p
    LEFT JOIN users u ON p.user_id = u.id
    LEFT JOIN questions q ON p.question_id = q.id
    ORDER BY p.timestamp DESC
    LIMIT 100
  `).all();
  res.json(logs);
});

app.delete("/api/admin/questions/:id", isAdmin, (req, res) => {
  try {
    db.prepare("DELETE FROM questions WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: "Failed to delete question" });
  }
});

app.get("/api/badges/:userId", (req, res) => {
  const badges = db.prepare(`
    SELECT b.*, ub.earned_at 
    FROM badges b 
    LEFT JOIN user_badges ub ON b.id = ub.badge_id AND ub.user_id = ?
  `).all(req.params.userId);
  res.json(badges);
});

export default app;
