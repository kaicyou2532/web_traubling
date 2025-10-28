import UserPage from '@/app/components/UserPage';

interface UserProfilePageProps {
  params: {
    userId: string;
  };
}

export default function UserProfilePage({ params }: UserProfilePageProps) {
  return <UserPage userId={params.userId} />;
}

// ページのメタデータを設定
export async function generateMetadata({ params }: UserProfilePageProps) {
  try {
    // ユーザー情報を取得してメタデータに使用
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/user/${params.userId}`);
    if (response.ok) {
      const user = await response.json();
      return {
        title: `${user.name || 'ユーザー'} - Troubling`,
        description: user.bio || `${user.name}さんのプロフィール`,
      };
    }
  } catch (error) {
    console.error('メタデータ生成エラー:', error);
  }

  return {
    title: 'ユーザープロフィール - Troubling',
    description: 'ユーザーのプロフィールページ',
  };
}