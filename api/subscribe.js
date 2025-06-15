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
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    // Here you would typically save the email to a database
    // For this example, we'll just proceed to send the email.
    console.log(`Attempting to send email to: ${email}`);

    const { data, error } = await resend.emails.send({
      from: 'Labubu Wallpaper <hello@labubuwallpaper.shop>', // 发件人邮箱已更新
      to: [email],
      subject: '🎨 您的免费Labubu壁纸包来了！',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9; }
                .header { text-align: center; padding-bottom: 20px; border-bottom: 1px solid #eee; }
                .header img { max-width: 150px; margin-bottom: 10px; }
                .content { padding: 20px 0; }
                .button { display: inline-block; background-color: #6a0dad; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
                .footer { text-align: center; padding-top: 20px; border-top: 1px solid #eee; font-size: 0.8em; color: #777; }
                .wallpaper-preview { text-align: center; margin-top: 20px; }
                .wallpaper-preview img { max-width: 100%; height: auto; border-radius: 8px; margin-bottom: 10px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>感谢您订阅Labubu壁纸！</h1>
                </div>
                <div class="content">
                    <p>您好！</p>
                    <p>非常感谢您对Labubu壁纸的喜爱和支持！我们为您准备了一份精美的Labubu壁纸包，希望您喜欢。</p>
                    <p>以下是您的专属壁纸下载链接：</p>
                    <p style="text-align: center;">
                        <a href="https://example.com/your-labubu-wallpaper-pack.zip" class="button">点击下载您的壁纸包</a>
                    </p>
                    <p>（请注意：这是一个示例链接 ，您需要替换为实际的壁纸下载链接）</p>
                    
                    <div class="wallpaper-preview">
                        <p>壁纸预览：</p>
                        <img src="https://i.imgur.com/your_labubu_wallpaper_1.jpg" alt="Labubu Wallpaper 1">
                        <img src="https://i.imgur.com/your_labubu_wallpaper_2.jpg" alt="Labubu Wallpaper 2">
                        <p>（请替换为实际的壁纸预览图链接 ）</p>
                    </div>

                    <h3>如何设置壁纸：</h3>
                    <h4>iPhone 用户：</h4>
                    <ol>
                        <li>下载壁纸到您的相册。</li>
                        <li>打开“设置”应用，选择“墙纸”。</li>
                        <li>点击“添加新墙纸”或“选取新墙纸”。</li>
                        <li>从相册中选择您下载的Labubu壁纸。</li>
                        <li>调整位置和缩放，然后点击“添加”或“设定”。</li>
                    </ol>
                    <h4>Android 用户：</h4>
                    <ol>
                        <li>下载壁纸到您的图库。</li>
                        <li>长按主屏幕空白处，选择“壁纸”或“墙纸”。</li>
                        <li>从图库中选择您下载的Labubu壁纸。</li>
                        <li>根据提示设置为主屏幕、锁定屏幕或两者。</li>
                    </ol>
                    <p>如果您有任何问题，请随时回复此邮件！</p>
                    <p>祝您使用愉快！</p>
                </div>
                <div class="footer">
                    <p>&copy; 2025 Labubu Wallpaper. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
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
