import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { email, deviceType } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  if (!deviceType) {
    return res.status(400).json({ message: 'Device type is required' });
  }

  try {
    console.log(`Attempting to send email to: ${email} for device: ${deviceType}`);

    // 根据设备类型设置不同的邮件内容
    let subject, downloadUrl, deviceName, wallpaperType, instructions;

    if (deviceType === 'iphone') {
      subject = '📱 您的iPhone Labubu Live Photo壁纸来了！';
      downloadUrl = 'https://www.labubuwallpaper.shop/downloads/iphone/';
      deviceName = 'iPhone';
      wallpaperType = 'Live Photo格式';
      instructions = `
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #333; margin: 0 0 10px 0;">📱 iPhone设置方法：</h4>
          <ol style="color: #666; margin: 0; padding-left: 20px;">
            <li>下载壁纸到相册</li>
            <li>设置 → 壁纸 → 选择新壁纸</li>
            <li>长按屏幕查看Live Photo动态效果</li>
          </ol>
        </div>
      `;
    } else if (deviceType === 'android' ) {
      subject = '🤖 您的Android Labubu动态壁纸来了！';
      downloadUrl = 'https://www.labubuwallpaper.shop/downloads/android/';
      deviceName = 'Android';
      wallpaperType = '动态MP4格式';
      instructions = `
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #333; margin: 0 0 10px 0;">🤖 Android设置方法：</h4>
          <ol style="color: #666; margin: 0; padding-left: 20px;">
            <li>下载壁纸到手机</li>
            <li>安装Video Live Wallpaper等应用</li>
            <li>设置 → 壁纸 → 动态壁纸</li>
            <li>选择下载的MP4文件</li>
          </ol>
        </div>
      `;
    } else {
      return res.status(400 ).json({ message: 'Invalid device type' });
    }

    const { data, error } = await resend.emails.send({
      from: 'Labubu Wallpaper <hello@labubuwallpaper.shop>',
      to: [email],
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #fce7f3 0%, #f3e8ff 50%, #e0e7ff 100%);">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #333; font-size: 28px; margin: 0 0 10px 0;">
              🎨 感谢您订阅Labubu壁纸！
            </h1>
            <p style="color: #666; font-size: 16px; margin: 0;">
              专为${deviceName}优化的${wallpaperType}壁纸
            </p>
          </div>

          <!-- Main Content -->
          <div style="background: rgba(255, 255, 255, 0.9); border-radius: 15px; padding: 30px; margin-bottom: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
            <p style="font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 25px;">
              亲爱的Labubu爱好者，感谢您对我们免费Labubu壁纸的关注！
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${downloadUrl}" 
                 style="background: linear-gradient(135deg, #ff6b9d, #8b5cf6); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; font-size: 16px; box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);">
                🎨 立即下载${deviceName}壁纸
              </a>
            </div>

            ${instructions}

            <div style="background: #e0f2fe; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h4 style="color: #333; margin: 0 0 10px 0;">✨ 特色功能：</h4>
              <ul style="color: #666; margin: 0; padding-left: 20px;">
                <li>高清原始画质</li>
                <li>${wallpaperType}支持</li>
                <li>完全免费下载</li>
                <li>一键下载全部</li>
              </ul>
            </div>
          </div>

          <!-- Footer -->
          <div style="text-align: center; color: #666; font-size: 14px;">
            <p style="margin: 10px 0;">
              祝您使用愉快！ 💖
            </p>
            <p style="margin: 10px 0;">
              <a href="https://www.labubuwallpaper.shop/" style="color: #8b5cf6; text-decoration: none;">
                访问我们的网站获取更多壁纸
              </a>
            </p>
            <p style="margin: 10px 0; font-size: 12px; color: #999;">
              如果您不想再收到邮件 ，请回复"取消订阅"
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ message: 'Failed to send email', error: error.message });
    }

    console.log('Email sent successfully:', data);
    return res.status(200).json({ 
      message: 'Subscription successful and email sent!',
      deviceType: deviceType,
      downloadUrl: downloadUrl
    });

  } catch (error) {
    console.error('Subscription error:', error);
    return res.status(500).json({ 
      message: 'Failed to process subscription', 
      error: error.message 
    });
  }
}
