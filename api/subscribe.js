import { Resend } from 'resend';
import { Redis } from '@upstash/redis';

const resend = new Resend(process.env.RESEND_API_KEY);

// 初始化 Upstash Redis 客户端
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

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
    // 检查邮箱是否已经存在
    const existingEmail = await redis.get(`email:${email}`);
    
    if (!existingEmail) {
      // 如果邮箱不存在，保存到数据库
      const timestamp = new Date().toISOString();
      await redis.set(`email:${email}`, {
        email: email,
        subscribedAt: timestamp,
        status: 'active'
      });
      
      // 同时添加到邮箱列表中（用于导出）
      await redis.sadd('subscribers', email);
      
      console.log(`New subscriber saved: ${email} at ${timestamp}`);
    } else {
      console.log(`Email already exists: ${email}`);
    }

    // 发送邮件（无论是否已存在都发送）
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
          
          <h2 style="color: #ff6b9d;">📱 壁纸预览</h2>
          <div style="text-align: center; margin: 20px 0;">
            <img src="https://i.imgur.com/your_labubu_wallpaper_1.jpg" alt="Labubu Wallpaper 1" style="max-width: 200px; margin: 10px; border-radius: 10px;">
            <img src="https://i.imgur.com/your_labubu_wallpaper_2.jpg" alt="Labubu Wallpaper 2" style="max-width: 200px; margin: 10px; border-radius: 10px;">
          </div>
          
          <h2 style="color: #ff6b9d;">🔧 如何设置壁纸</h2>
          <ul style="font-size: 14px; line-height: 1.6;">
            <li><strong>iPhone:</strong> 设置 → 壁纸 → 选择新壁纸 → 相机胶卷</li>
            <li><strong>Android:</strong> 长按桌面 → 壁纸 → 我的照片</li>
            <li><strong>电脑:</strong> 右键桌面 → 个性化 → 背景</li>
          </ul>
          
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
