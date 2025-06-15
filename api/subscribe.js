import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    // 暂时只记录到控制台，不使用数据库
    console.log('New subscriber:', email, new Date().toISOString());

    // 发送邮件
    const { data, error } = await resend.emails.send({
      from: 'Labubu Wallpaper <hello@labubuwallpaper.shop>',
      to: [email],
      subject: '🎨 您的免费Labubu壁纸包来了！',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #ff6b9d; text-align: center;">🎨 感谢您订阅Labubu壁纸！</h1>
          
          <p style="font-size: 16px; line-height: 1.6;">
            亲爱的Labubu爱好者，
          </p>
          
          <p style="font-size: 16px; line-height: 1.6;">
            感谢您对我们免费Labubu壁纸的关注！我们为您精心准备了高质量的壁纸包。
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://example.com/your-labubu-wallpaper-pack.zip" 
               style="background-color: #ff6b9d; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
              点击下载您的壁纸包
            </a>
          </div>
          
          <p style="font-size: 14px; color: #666; text-align: center; margin-top: 30px;">
            如有任何问题 ，请随时联系我们！<br>
            祝您使用愉快！ 💖
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ message: 'Failed to send email', error: error.message });
    }

    console.log('Email sent successfully:', data);
    return res.status(200).json({ message: 'Subscription successful and email sent!' });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
