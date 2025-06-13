export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      // Log the email (in production, save to database)
      console.log('New subscriber:', email, new Date().toISOString());
      
      // TODO: Add database storage
      // TODO: Add email sending functionality
      
      return res.status(200).json({ 
        message: 'Subscription successful! Wallpapers sent to your email.' 
      });
      
    } catch (error) {
      console.error('Error in subscribe:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}

