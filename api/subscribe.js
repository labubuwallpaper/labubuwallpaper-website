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

    // Set different email content based on device type
    let subject, downloadUrl, deviceName, wallpaperType, instructions;

    if (deviceType === 'iphone') {
      subject = '📱 Your iPhone Labubu Live Photo Wallpapers Are Here!';
      downloadUrl = 'https://www.labubuwallpaper.shop/downloads/iphone/';
      deviceName = 'iPhone';
      wallpaperType = 'Live Photo format';
      instructions = `
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #333; margin: 0 0 10px 0;">📱 iPhone Setup Instructions:</h4>
          <ol style="color: #666; margin: 0; padding-left: 20px;">
            <li>Download wallpapers to Photos app</li>
            <li>Settings → Wallpaper → Choose New Wallpaper</li>
            <li>Press and hold screen to see Live Photo effects</li>
          </ol>
        </div>
      `;
    } else if (deviceType === 'android' ) {
      subject = '🤖 Your Android Labubu Dynamic Wallpapers Are Here!';
      downloadUrl = 'https://www.labubuwallpaper.shop/downloads/android/';
      deviceName = 'Android';
      wallpaperType = 'Dynamic MP4 format';
      instructions = `
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #333; margin: 0 0 10px 0;">🤖 Android Setup Instructions:</h4>
          <ol style="color: #666; margin: 0; padding-left: 20px;">
            <li>Download wallpapers to your device</li>
            <li>Install Video Live Wallpaper or similar app</li>
            <li>Settings → Wallpaper → Live Wallpaper</li>
            <li>Select downloaded MP4 file</li>
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
              🎨 Thank You for Subscribing to Labubu Wallpapers!
            </h1>
            <p style="color: #666; font-size: 16px; margin: 0;">
              Premium ${wallpaperType} wallpapers optimized for ${deviceName}
            </p>
          </div>

          <!-- Main Content -->
          <div style="background: rgba(255, 255, 255, 0.9); border-radius: 15px; padding: 30px; margin-bottom: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
            <p style="font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 25px;">
              Dear Labubu enthusiast, thank you for your interest in our free Labubu wallpapers! We've prepared a high-quality wallpaper collection just for you.
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${downloadUrl}" style="background: linear-gradient(135deg, #ff6b9d, #8b5cf6); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; font-size: 16px; box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);">
                🎨 Download ${deviceName} Wallpapers Now
              </a>
            </div>

            ${instructions}

            <div style="background: #e0f2fe; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h4 style="color: #333; margin: 0 0 10px 0;">✨ Features:</h4>
              <ul style="color: #666; margin: 0; padding-left: 20px;">
                <li>High-definition original quality</li>
                <li>${wallpaperType} support</li>
                <li>Completely free download</li>
                <li>One-click download all</li>
                <li>Regular updates with new designs</li>
              </ul>
            </div>
          </div>

          <!-- Footer -->
          <div style="text-align: center; color: #666; font-size: 14px;">
            <p style="margin: 10px 0;">
              Enjoy your new wallpapers! 💖
            </p>
            <p style="margin: 10px 0;">
              <a href="https://www.labubuwallpaper.shop/" style="color: #8b5cf6; text-decoration: none;">
                Visit our website for more wallpapers
              </a>
            </p>
            <p style="margin: 10px 0; font-size: 12px; color: #999;">
              If you no longer wish to receive emails, please reply with "unsubscribe"
            </p>
          </div>
        </div>
      `,
    } );

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
    return res.status(500).json({ message: 'Failed to process subscription', error: error.message });
  }
}
