import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
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

      // 发送欢迎邮件和壁纸
      await resend.emails.send({
        from: 'Labubu Wallpapers <noreply@labubuwallpaper.shop>',
        to: [email],
        subject: '🎨 Your Free Labubu Wallpapers Are Here!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #8b5cf6;">Thank you for subscribing! 🎉</h1>
            <p>Hi there!</p>
            <p>Thank you for your interest in our Labubu wallpaper collection! We're excited to share these beautiful designs with you.</p>
            
            <h2 style="color: #ec4899;">📱 Your Wallpaper Collection</h2>
            <p>Here are your exclusive Labubu wallpapers:</p>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>🎨 Collection Includes:</h3>
              <ul>
                <li>5 Mobile wallpapers (1080x1920)</li>
                <li>3 Desktop wallpapers (1920x1080)</li>
                <li>2 Tablet wallpapers (2048x1536)</li>
              </ul>
            </div>
            
            <p><strong>Download Link:</strong> <a href="https://labubuwallpaper.shop/download" style="color: #8b5cf6;">Click here to download</a></p>
            
            <h3>📲 How to Set as Wallpaper:</h3>
            <p><strong>iPhone:</strong> Settings → Wallpaper → Choose a New Wallpaper</p>
            <p><strong>Android:</strong> Settings → Display → Wallpaper</p>
            <p><strong>Desktop:</strong> Right-click image → Set as Desktop Background</p>
            
            <p style="margin-top: 30px;">Enjoy your new wallpapers!</p>
            <p>Best regards,<br>The Labubu Wallpaper Team</p>
            
            <hr style="margin: 30px 0;">
            <p style="font-size: 12px; color: #666;">
              You received this email because you subscribed to our wallpaper collection at labubuwallpaper.shop
            </p>
          </div>
        `,
      } );

      // 记录订阅者（这里可以后续连接数据库）
      console.log('New subscriber:', email, new Date().toISOString());
      
      return res.status(200).json({ 
        message: 'Subscription successful! Check your email for wallpapers.' 
      });
      
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ error: 'Failed to send email' });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
