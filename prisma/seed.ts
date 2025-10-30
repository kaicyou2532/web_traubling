import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ------------ helpers ------------
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randint = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randfloat = (min: number, max: number) => Math.random() * (max - min) + min;

const randomDateBetween = (start: Date, end: Date) =>
  new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

const fromYearMonth = (year: number, month: number) => {
  const day = randint(1, 28);
  return new Date(Date.UTC(year, month - 1, day, randint(6, 21), randint(0, 59)));
};

// 都市中心座標 ± ~1.2km
const jitterLatLng = (lat: number, lng: number) => {
  const meters = randfloat(80, 1200);
  const dLat = meters / 111_111;
  const dLng = meters / (111_111 * Math.cos((lat * Math.PI) / 180));
  return {
    lat: lat + (Math.random() < 0.5 ? -dLat : dLat),
    lng: lng + (Math.random() < 0.5 ? -dLng : dLng),
  };
};

// バッチ実行ユーティリティ（逐次）
async function chunked<T>(items: T[], size: number, worker: (batch: T[]) => Promise<void>) {
  for (let i = 0; i < items.length; i += size) {
    const batch = items.slice(i, i + size);
    await worker(batch);
  }
}

// ------------ master data ------------
const countries = [
  { enName: 'Japan', jaName: '日本' },
  { enName: 'United States', jaName: 'アメリカ' },
  { enName: 'United Kingdom', jaName: 'イギリス' },
  { enName: 'France', jaName: 'フランス' },
  { enName: 'Germany', jaName: 'ドイツ' },
  { enName: 'Italy', jaName: 'イタリア' },
  { enName: 'Spain', jaName: 'スペイン' },
  { enName: 'Australia', jaName: 'オーストラリア' },
  { enName: 'Canada', jaName: 'カナダ' },
  { enName: 'South Korea', jaName: '韓国' },
  { enName: 'China', jaName: '中国' },
  { enName: 'Thailand', jaName: 'タイ' },
  { enName: 'Singapore', jaName: 'シンガポール' },
  { enName: 'Malaysia', jaName: 'マレーシア' },
  { enName: 'Indonesia', jaName: 'インドネシア' },
  { enName: 'Philippines', jaName: 'フィリピン' },
  { enName: 'Vietnam', jaName: 'ベトナム' },
  { enName: 'India', jaName: 'インド' },
  { enName: 'Brazil', jaName: 'ブラジル' },
  { enName: 'Mexico', jaName: 'メキシコ' },
  { enName: 'Netherlands', jaName: 'オランダ' },
  { enName: 'Switzerland', jaName: 'スイス' },
  { enName: 'Austria', jaName: 'オーストリア' },
  { enName: 'Portugal', jaName: 'ポルトガル' },
  { enName: 'Greece', jaName: 'ギリシャ' },
];

type CitySeed = { enName: string; jaName: string; countryIndex: number; lat: number; lng: number; };

const cities: CitySeed[] = [
  { enName: 'Tokyo', jaName: '東京', countryIndex: 0, lat: 35.6762, lng: 139.6503 },
  { enName: 'Osaka', jaName: '大阪', countryIndex: 0, lat: 34.6937, lng: 135.5023 },
  { enName: 'Kyoto', jaName: '京都', countryIndex: 0, lat: 35.0116, lng: 135.7681 },
  { enName: 'New York', jaName: 'ニューヨーク', countryIndex: 1, lat: 40.7128, lng: -74.006 },
  { enName: 'Los Angeles', jaName: 'ロサンゼルス', countryIndex: 1, lat: 34.0522, lng: -118.2437 },
  { enName: 'San Francisco', jaName: 'サンフランシスコ', countryIndex: 1, lat: 37.7749, lng: -122.4194 },
  { enName: 'London', jaName: 'ロンドン', countryIndex: 2, lat: 51.5074, lng: -0.1278 },
  { enName: 'Manchester', jaName: 'マンチェスター', countryIndex: 2, lat: 53.4808, lng: -2.2426 },
  { enName: 'Edinburgh', jaName: 'エディンバラ', countryIndex: 2, lat: 55.9533, lng: -3.1883 },
  { enName: 'Paris', jaName: 'パリ', countryIndex: 3, lat: 48.8566, lng: 2.3522 },
  { enName: 'Lyon', jaName: 'リヨン', countryIndex: 3, lat: 45.764, lng: 4.8357 },
  { enName: 'Nice', jaName: 'ニース', countryIndex: 3, lat: 43.7102, lng: 7.262 },
  { enName: 'Berlin', jaName: 'ベルリン', countryIndex: 4, lat: 52.52, lng: 13.405 },
  { enName: 'Munich', jaName: 'ミュンヘン', countryIndex: 4, lat: 48.1351, lng: 11.582 },
  { enName: 'Hamburg', jaName: 'ハンブルク', countryIndex: 4, lat: 53.5511, lng: 9.9937 },
  { enName: 'Rome', jaName: 'ローマ', countryIndex: 5, lat: 41.9028, lng: 12.4964 },
  { enName: 'Milan', jaName: 'ミラノ', countryIndex: 5, lat: 45.4642, lng: 9.19 },
  { enName: 'Venice', jaName: 'ベネチア', countryIndex: 5, lat: 45.4408, lng: 12.3155 },
  { enName: 'Madrid', jaName: 'マドリード', countryIndex: 6, lat: 40.4168, lng: -3.7038 },
  { enName: 'Barcelona', jaName: 'バルセロナ', countryIndex: 6, lat: 41.3851, lng: 2.1734 },
  { enName: 'Sydney', jaName: 'シドニー', countryIndex: 7, lat: -33.8688, lng: 151.2093 },
  { enName: 'Melbourne', jaName: 'メルボルン', countryIndex: 7, lat: -37.8136, lng: 144.9631 },
  { enName: 'Toronto', jaName: 'トロント', countryIndex: 8, lat: 43.6532, lng: -79.3832 },
  { enName: 'Vancouver', jaName: 'バンクーバー', countryIndex: 8, lat: 49.2827, lng: -123.1207 },
  { enName: 'Seoul', jaName: 'ソウル', countryIndex: 9, lat: 37.5665, lng: 126.978 },
  { enName: 'Busan', jaName: '釜山', countryIndex: 9, lat: 35.1796, lng: 129.0756 },
  { enName: 'Beijing', jaName: '北京', countryIndex: 10, lat: 39.9042, lng: 116.4074 },
  { enName: 'Shanghai', jaName: '上海', countryIndex: 10, lat: 31.2304, lng: 121.4737 },
  { enName: 'Bangkok', jaName: 'バンコク', countryIndex: 11, lat: 13.7563, lng: 100.5018 },
  { enName: 'Phuket', jaName: 'プーケット', countryIndex: 11, lat: 7.8804, lng: 98.3923 },
  { enName: 'Amsterdam', jaName: 'アムステルダム', countryIndex: 20, lat: 52.3676, lng: 4.9041 },
  { enName: 'Rotterdam', jaName: 'ロッテルダム', countryIndex: 20, lat: 51.9244, lng: 4.4777 },
  { enName: 'Zurich', jaName: 'チューリッヒ', countryIndex: 21, lat: 47.3769, lng: 8.5417 },
  { enName: 'Geneva', jaName: 'ジュネーブ', countryIndex: 21, lat: 46.2044, lng: 6.1432 },
  { enName: 'Vienna', jaName: 'ウィーン', countryIndex: 22, lat: 48.2082, lng: 16.3738 },
  { enName: 'Salzburg', jaName: 'ザルツブルク', countryIndex: 22, lat: 47.8095, lng: 13.055 },
  { enName: 'Lisbon', jaName: 'リスボン', countryIndex: 23, lat: 38.7223, lng: -9.1393 },
  { enName: 'Porto', jaName: 'ポルト', countryIndex: 23, lat: 41.1579, lng: -8.6291 },
  { enName: 'Athens', jaName: 'アテネ', countryIndex: 24, lat: 37.9838, lng: 23.7275 },
  { enName: 'Santorini', jaName: 'サントリーニ', countryIndex: 24, lat: 36.3932, lng: 25.4615 },
];

type TroubleKey = 'Food' | 'Transport' | 'Money' | 'Accommodation' | 'Other';
const troubles = [
  { key: 'Food', enName: 'Food', jaName: '食事' },
  { key: 'Transport', enName: 'Transport', jaName: '交通' },
  { key: 'Money', enName: 'Money', jaName: '金銭面のトラブル' },
  { key: 'Accommodation', enName: 'Accommodation', jaName: '宿泊' },
  { key: 'Other', enName: 'Other', jaName: 'その他' },
] as const;

const baseUsers = [
  '田中太郎','佐藤花子','山田次郎','鈴木美咲','高橋健','渡辺麻衣','小林駿','加藤由美','吉田大輔','山本愛',
  '松本拓也','井上理恵','木村智也','林真由美','斎藤隆','清水香織','森川雅彦','橋本沙織','中村和也','池田美穂',
  '大野光','藤田彩','長谷川悠','岡本真','近藤葵'
];
const allUserNames = [...baseUsers, ...Array.from({ length: 35 }, (_, i) => `ゲスト${i + 1}`)];

const nouns = ['空港', '駅', 'ホテル', '市場', '美術館', '屋台', '旧市街', 'ショッピングモール', '海辺', '郊外'];
const foods = ['フォー', 'パエリア', '寿司', 'ピザ', 'パスタ', 'チーズ', 'タコス', 'バインミー', 'カレー', 'ケバブ'];
const transport = ['地下鉄', 'バス', 'トラム', 'タクシー', 'Uber', '電車'];

const titleTemplates: Record<TroubleKey, string[]> = {
  Food: ['{city}で食あたり…回復までの記録', '屋台で体調不良になった話（{city}）', '{city}の食でお腹を壊した日'],
  Transport: ['{xport}が止まって動けない（{city}）', '{city}で乗り間違えた話', '{city}の交通ストで予定総崩れ'],
  Money: ['両替と物価で大失敗（{city}）', 'タクシーの高額請求を回避できず（{city}）', '{city}でカードが使えず困った'],
  Accommodation: ['予約と違う部屋！？（{city}）', '{city}の宿で設備トラブル', '深夜チェックインで一悶着（{city}）'],
  Other: ['文化の違いでヒヤリ（{city}）', '写真撮影NGを知らず注意…（{city}）', '{city}で通信手段がなくて詰んだ'],
};

const bodyTemplates: Record<TroubleKey, string[]> = {
  Food: [
    '{month}月の{city}で屋台の{food}が美味しくて食べ過ぎ、翌日から腹痛と発熱。病院では軽い細菌性との診断で点滴。保険でカバーされ助かりました。水分補給と無理しない行程が大切。',
    '{city}のローカル食堂で注文が通じず辛さが想定外に…。胃腸薬が役立ちました。翻訳アプリと辛さレベル確認は必須。',
  ],
  Transport: [
    '{city}で{xport}が運休。振替案内が現地語のみで戸惑いましたが、駅員さんの案内とオフライン路線図でリカバリ。',
    '空港着が深夜になり{xport}が終了。配車アプリで高額に…。昼到着便にする教訓を得ました。',
  ],
  Money: [
    '{city}中心の両替所はレートが悪く郊外の方が良心的でした。事前比較と少額ずつの両替が安心。',
    'カードの海外利用設定を忘れて決済できず。アプリで即時有効化して解決。バックアップカード必須。',
  ],
  Accommodation: [
    '{city}の宿で空調が故障。満室で部屋替えできず扇風機対応、翌朝に割引対応。チェックイン時に設備確認を。',
    '予約サイトの写真と実物が違う…。フロント交渉と予約サイト経由の相談で次泊から部屋チェンジできました。',
  ],
  Other: [
    '{city}の宗教施設で写真NGをうっかり撮って注意されました。事前にマナー確認は重要。',
    'ホテルWi-Fiが不安定でテザリングも速度制限。現地SIMを購入して解決。到着日に通信手段確保が吉。',
  ],
};

const commentSnippets = [
  '体験談助かります！',
  'これから行くので参考にします。',
  '保険の重要性…身にしみますね。',
  '現地の方が優しいの救いですね。',
  '同じ場所で似た経験しました。',
  'オフライン地図、たしかに有効！',
  '次回の旅で試してみます！',
  '現金のバックアップ大事ですね。',
  '翻訳アプリ準備しておきます。',
  '夜間移動は避けるようにします。',
];

function buildTitle(k: TroubleKey, cityJa: string) {
  return pick(titleTemplates[k]).replace('{city}', cityJa).replace('{xport}', pick(transport));
}
function buildBody(k: TroubleKey, cityJa: string, month: number) {
  return pick(bodyTemplates[k])
    .replaceAll('{city}', cityJa)
    .replaceAll('{month}', String(month))
    .replaceAll('{food}', pick(foods))
    .replaceAll('{xport}', pick(transport));
}

// ------------ main ------------
async function main() {
  console.log('🌱 シードデータ投入を開始');

  // 既存データ削除（下位→上位）
  await prisma.like.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.city.deleteMany();
  await prisma.country.deleteMany();
  await prisma.trouble.deleteMany();
  await prisma.user.deleteMany();
  console.log('🧹 既存データを削除');

  // 国
  await prisma.country.createMany({
    data: countries.map((c, i) => ({ id: i + 1, enName: c.enName, jaName: c.jaName })),
  });

  // 都市
  await prisma.city.createMany({
    data: cities.map((c, i) => ({
      id: i + 1,
      enName: c.enName,
      jaName: c.jaName,
      countryId: c.countryIndex + 1, // countryは1始まり
      photoUrl: `https://example.com/photos/${c.enName.toLowerCase()}.jpg`,
    })),
  });

  // トラブル 5 カテゴリ
  await prisma.trouble.createMany({
    data: troubles.map((t, i) => ({ id: i + 1, enName: t.enName, jaName: t.jaName })),
  });

  // ユーザー（まず Users を createMany → 取得して Profiles 作成）
  const userRows = allUserNames.map((name, idx) => ({
    name,
    email: name.startsWith('ゲスト') ? `guest${idx}@example.com` :
      `${encodeURIComponent(name)}@example.com`.toLowerCase().replace(/%/g, ''),
    image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
    profile: `${name}です。旅の気づきをメモしています。`,
  }));
  await prisma.user.createMany({ data: userRows, skipDuplicates: true });

  const users = await prisma.user.findMany({
    select: { id: true, name: true, image: true, email: true },
  });

  // Profiles を createMany
  await prisma.profile.createMany({
    data: users.map(u => ({
      userId: u.id,
      bio: `こんにちは！${u.name}です。🌍 ${randint(6, 22)}カ国を訪問。公共交通とローカル飯が好き。`,
      avatarUrl: u.image,
    })),
    skipDuplicates: true,
  });

  // 投稿（増量 & createMany）
  const postsCount = 800; // ★必要なら増減
  const startYear = 2020, endYear = 2024;

  // id を自前で振る（autoincrement でもOKだが、likeCount更新を楽にするため）
  let nextPostId = 1;
  const postData = Array.from({ length: postsCount }).map(() => {
    const user = pick(users);
    const cityId = randint(1, cities.length);
    const citySeed = cities[cityId - 1];
    const cityJa = citySeed.jaName;
    const countryId = citySeed.countryIndex + 1;

    const troubleId = randint(1, troubles.length);
    const troubleKey = troubles[troubleId - 1].key;

    const travelYear = randint(startYear, endYear);
    const travelMonth = randint(1, 12);
    const createdAt = randomDateBetween(
      fromYearMonth(travelYear, travelMonth),
      new Date(Date.UTC(travelYear, travelMonth - 1, 28, 23, 59))
    );

    const { lat, lng } = jitterLatLng(citySeed.lat, citySeed.lng);

    const id = nextPostId++;
    return {
      id,
      title: buildTitle(troubleKey, cityJa),
      content: buildBody(troubleKey, cityJa, travelMonth),
      userId: user.id,
      cityId,
      countryId,
      troubleId,
      travelYear,
      travelMonth,
      latitude: lat,
      longitude: lng,
      likeCount: 0,
      createdAt,
    };
  });

  await chunked(postData, 300, async (batch) => {
    await prisma.post.createMany({ data: batch as any });
  });

  // コメント（createMany + バッチ）
  const commentsCount = 2200; // ★必要なら増減
  const commentRows = Array.from({ length: commentsCount }).map(() => {
    const postId = randint(1, postsCount);
    const user = pick(users);
    const postCreatedAt = postData[postId - 1].createdAt;
    return {
      content: `${pick(commentSnippets)} ${pick([
        `（${randint(1, 3)}月に${randint(1, 2)}週間滞在しました）`,
        '現地アプリを事前にDLしておきます。',
        'Googleマップのオフライン保存、便利ですよね。',
        '夜間の移動は避けるようにします。',
        '次は保険もしっかり確認していきます。',
        '',
      ])}`.trim(),
      postId,
      userId: user.id,
      createdAt: randomDateBetween(postCreatedAt, new Date(Date.UTC(2025, 0, 1))),
    };
  });

  await chunked(commentRows, 1000, async (batch) => {
    await prisma.comment.createMany({ data: batch as any });
  });

  // いいね（重複避けて createMany + バッチ）
  const likesTarget = 6000; // ★必要なら増減
  const likeSet = new Set<string>();
  const likeRows: { postId: number; userId: string; createdAt: Date }[] = [];
  while (likeRows.length < likesTarget) {
    const postId = randint(1, postsCount);
    const user = pick(users);
    const key = `${postId}:${user.id}`;
    if (likeSet.has(key)) continue;
    likeSet.add(key);
    likeRows.push({
      postId,
      userId: user.id,
      createdAt: randomDateBetween(postData[postId - 1].createdAt, new Date(Date.UTC(2025, 0, 1))),
    });
  }

  await chunked(likeRows, 2000, async (batch) => {
    await prisma.like.createMany({ data: batch as any, skipDuplicates: true });
  });

  // likeCount を集計して更新（groupBy → 小分け update）
  const grouped = await prisma.like.groupBy({
    by: ['postId'],
    _count: { postId: true },
  });

  await chunked(grouped, 200, async (batch) => {
    for (const g of batch) {
      await prisma.post.update({
        where: { id: g.postId },
        data: { likeCount: g._count.postId },
      });
    }
  });

  console.log('✅ 完了');
  console.log(`
📊 作成サマリ
- 国: ${countries.length}
- 都市: ${cities.length}
- トラブル（5カテゴリ）: ${troubles.length}
- ユーザー: ${users.length}
- 投稿: ${postsCount}
- コメント: ${commentsCount}
- いいね: ${likesTarget}
  `);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
