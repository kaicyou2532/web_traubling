/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // ドメインリストは空でも OK
    domains: [],

    // すべての https ホスト／パスを許可
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',   // ワイルドカードで全ホスト
        port: '',         // ポート指定なし
        pathname: '/**',  // 任意のパスを許可
      },
    ],
  },
};

export default nextConfig;
