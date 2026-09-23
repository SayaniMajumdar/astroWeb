import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL, 
  ssl: {
    rejectUnauthorized: false
  }
});

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // GET: সব রিভিউ ফেচ করার জন্য
    if (req.method === 'GET') {
      // এখানে queryDatabase এর বদলে pool.query হবে
      const result = await pool.query('SELECT * FROM reviews ORDER BY created_at DESC LIMIT 10');
      return res.status(200).json(result.rows);
    }

    // POST: নতুন রিভিউ সেভ করার জন্য
    if (req.method === 'POST') {
      const { name, rating, review_text } = req.body;

      if (!name || !rating || !review_text) {
        return res.status(400).json({ error: 'সব ফিল্ড পূরণ করা বাধ্যতামূলক।' });
      }

      const query = `
        INSERT INTO reviews (name, rating, review_text) 
        VALUES ($1, $2, $3) 
        RETURNING *;
      `;
      const values = [name, parseInt(rating), review_text];
      const newReview = await pool.query(query, values);

      return res.status(201).json({ message: 'রিভিউ সফলভাবে জমা হয়েছে!', review: newReview.rows[0] });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    console.error('Database Error:', error);
    return res.status(500).json({ error: 'সার্ভারে সমস্যা হয়েছে। অনুগ্রহ করে পরে চেষ্টা করুন।' });
  }
}