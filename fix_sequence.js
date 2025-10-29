const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixPostSequence() {
  try {
    console.log('Checking Post table sequence...');
    
    // 現在の最大IDを取得
    const latestPost = await prisma.post.findFirst({
      orderBy: { id: 'desc' },
      select: { id: true }
    });
    
    console.log('Latest post ID:', latestPost?.id || 'No posts exist');
    
    // PostgreSQLのシーケンスをリセット
    const maxId = latestPost?.id || 0;
    await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('"Post"', 'id'), ${maxId + 1}, false)`;
    
    console.log(`Post sequence reset to ${maxId + 1}`);
    
    // テスト用の投稿を作成
    console.log('Testing post creation...');
    const testPost = await prisma.post.create({
      data: {
        userId: 'cmha03ie10000kh5xkt1mw7ig', // 現在ログインしているユーザーID
        countryId: 1,
        cityId: 1,
        troubleId: 1,
        travelMonth: 10,
        travelYear: 2024,
        title: 'Test Post',
        content: 'This is a test post',
        latitude: null,
        longitude: null,
      },
    });
    
    console.log('Test post created successfully:', testPost.id);
    
    // テスト投稿を削除
    await prisma.post.delete({
      where: { id: testPost.id }
    });
    
    console.log('Test post deleted. Sequence is working properly.');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixPostSequence();