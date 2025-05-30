import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  // ตรวจสอบว่าเป็น POST request
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // ตรวจสอบการ login
    const session = await getSession({ req });
    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { gameId, updateData } = req.body;
    const userId = session.user.id;

    // ตรวจสอบว่ามี updateData และ gameId หรือไม่
    if (!gameId || !updateData) {
      return res.status(400).json({ message: 'Missing gameId or updateData' });
    }

    // TODO: เชื่อมต่อกับ database และอัปเดตสถานะเกมสำหรับ user นี้
    // updateData อาจมี isFavorite, isLiked, userRating หรือทั้งหมด
    const updatedState = {
      userId,
      gameId,
      ...updateData,
      timestamp: new Date().toISOString()
    };

    console.log('Updating game state:', updatedState);

    // ส่งข้อมูลกลับ
    return res.status(200).json({
      success: true,
      data: updatedState
    });

  } catch (error) {
    console.error('Error in updateState API:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 