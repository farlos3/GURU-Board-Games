import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  // ตรวจสอบว่าเป็น GET request
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // ดึง query parameters
    const {
      searchQuery = '',
      categories = [],
      playerCount = 4,
      playTime = 60,
      page = 1,
      limit = 10
    } = req.query;

    // TODO: เชื่อมต่อกับ database
    // ตัวอย่างการค้นหาและกรองข้อมูล
    const searchParams = {
      searchQuery,
      categories: Array.isArray(categories) ? categories : [categories],
      playerCount: parseInt(playerCount),
      playTime: parseInt(playTime),
      page: parseInt(page),
      limit: parseInt(limit)
    };

    // TODO: ดึงข้อมูลจาก database ตามเงื่อนไขการค้นหา
    // ตัวอย่างการส่งข้อมูลกลับ
    const searchResults = {
      games: [], // TODO: ใส่ข้อมูลเกมที่ค้นพบ
      total: 0,  // TODO: ใส่จำนวนเกมทั้งหมดที่ค้นพบ
      page: searchParams.page,
      totalPages: 0 // TODO: คำนวณจำนวนหน้าทั้งหมด
    };

    // บันทึกประวัติการค้นหา (ถ้า login แล้ว)
    const session = await getSession({ req });
    if (session) {
      const searchHistory = {
        userId: session.user.id,
        searchParams,
        timestamp: new Date().toISOString()
      };
      // TODO: บันทึกประวัติการค้นหาลง database
    }

    // ส่งข้อมูลกลับ
    return res.status(200).json({
      success: true,
      data: searchResults
    });

  } catch (error) {
    console.error('Error in search API:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 