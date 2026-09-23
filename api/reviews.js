import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  // GET Request (রিভিউ দেখানোর জন্য)
  if (req.method === 'GET') {
    try {
      const { rows } = await sql`SELECT * FROM reviews ORDER BY created_at DESC;`;
      return res.status(200).json(rows);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  } 
  
  // POST Request (নতুন রিভিউ সাবমিট করার জন্য)
  else if (req.method === 'POST') {
    try {
      const { name, rating, review_text } = req.body;
      
      if (!name || !rating || !review_text) {
        return res.status(400).json({ error: 'Name, rating, and review text are required' });
      }

      await sql`
        INSERT INTO reviews (name, rating, review_text) 
        VALUES (${name}, ${rating}, ${review_text});
      `;
      
      return res.status(200).json({ success: true, message: 'Review added successfully' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  } 
  
  // অন্য কোনো মেথড আসলে Error দেখাবে
  else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}