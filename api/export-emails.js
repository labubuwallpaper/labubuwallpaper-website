import { Redis } from '@upstash/redis';

// 初始化 Upstash Redis 客户端
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// 简单的密码保护（您可以修改这个密码）
const EXPORT_PASSWORD = 'labubu2025';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // 检查密码
  const { password } = req.query;
  if (password !== EXPORT_PASSWORD) {
    return res.status(401).json({ 
      message: 'Unauthorized. Please provide the correct password.',
      usage: 'Add ?password=your_password to the URL'
    });
  }

  try {
    // 获取所有订阅者邮箱
    const subscribers = await redis.smembers('subscribers');
    
    if (!subscribers || subscribers.length === 0) {
      return res.status(200).json({
        message: 'No subscribers found',
        count: 0,
        data: []
      });
    }

    // 获取每个邮箱的详细信息
    const emailDetails = [];
    for (const email of subscribers) {
      try {
        const details = await redis.get(`email:${email}`);
        if (details) {
          emailDetails.push({
            email: details.email,
            subscribedAt: details.subscribedAt,
            status: details.status || 'active'
          });
        } else {
          // 如果没有详细信息，只添加邮箱
          emailDetails.push({
            email: email,
            subscribedAt: 'Unknown',
            status: 'active'
          });
        }
      } catch (error) {
        console.error(`Error fetching details for ${email}:`, error);
        emailDetails.push({
          email: email,
          subscribedAt: 'Error',
          status: 'unknown'
        });
      }
    }

    // 按订阅时间排序（最新的在前）
    emailDetails.sort((a, b) => {
      if (a.subscribedAt === 'Unknown' || a.subscribedAt === 'Error') return 1;
      if (b.subscribedAt === 'Unknown' || b.subscribedAt === 'Error') return -1;
      return new Date(b.subscribedAt) - new Date(a.subscribedAt);
    });

    // 检查是否请求CSV格式
    const { format } = req.query;
    if (format === 'csv') {
      // 生成CSV内容
      const csvHeader = 'Email,Subscribed At,Status\n';
      const csvRows = emailDetails.map(item => 
        `"${item.email}","${item.subscribedAt}","${item.status}"`
      ).join('\n');
      const csvContent = csvHeader + csvRows;

      // 设置CSV下载响应头
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="labubu-subscribers-${new Date().toISOString().split('T')[0]}.csv"`);
      return res.status(200).send(csvContent);
    }

    // 默认返回JSON格式
    return res.status(200).json({
      message: 'Subscribers exported successfully',
      count: emailDetails.length,
      exportedAt: new Date().toISOString(),
      data: emailDetails,
      usage: {
        csv: 'Add ?format=csv to download as CSV file',
        example: `https://www.labubuwallpaper.shop/api/export-emails?password=${EXPORT_PASSWORD}&format=csv`
      }
    } );

  } catch (error) {
    console.error('Export error:', error);
    return res.status(500).json({ 
      message: 'Failed to export subscribers', 
      error: error.message 
    });
  }
}
