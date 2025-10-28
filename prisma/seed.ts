import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/** ---------- utils ---------- **/
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randint = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const randfloat = (min: number, max: number) =>
  Math.random() * (max - min) + min;

const randomDateBetween = (start: Date, end: Date) =>
  new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

const fromYearMonth = (year: number, month: number) => {
  const day = randint(1, 28); // 安全に28日まで
  return new Date(Date.UTC(year, month - 1, day, randint(6, 21), randint(0, 59)));
};

// 都市中心座標から最大約1.2kmのジッター
const jitterLatLng = (lat: number, lng: number) => {
  const meters = randfloat(80, 1200);
  const dLat = meters / 111_111; // 1度あたり約111.111km
  const dLng = meters / (111_111 * Math.cos((lat * Math.PI) / 180));
  // ランダム方向（±）
  return {
    lat: lat + (Math.random() < 0.5 ? -dLat : dLat),
    lng: lng + (Math.random() < 0.5 ? -dLng : dLng),
  };
};

/** ---------- master data ---------- **/
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
];

type CitySeed = {
  enName: string;
  jaName: string;
  countryIndex: number;
  lat: number;
  lng: number;
};

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
];

const troubles = [
  { enName: 'Lost Luggage', jaName: '荷物紛失' },
  { enName: 'Transportation Issues', jaName: '交通機関のトラブル' },
  { enName: 'Food Poisoning', jaName: '食中毒' },
  { enName: 'Accommodation Problems', jaName: '宿泊施設のトラブル' },
  { enName: 'Tourist Scam', jaName: '観光詐欺' },
];

const sampleUsers = [
  { name: '田中太郎', email: 'tanaka@example.com' },
  { name: '佐藤花子', email: 'sato@example.com' },
  { name: '山田次郎', email: 'yamada@example.com' },
  { name: '鈴木美咲', email: 'suzuki@example.com' },
  { name: '高橋健', email: 'takahashi@example.com' },
  { name: '渡辺麻衣', email: 'watanabe@example.com' },
  { name: '小林駿', email: 'kobayashi@example.com' },
  { name: '加藤由美', email: 'kato@example.com' },
  { name: '吉田大輔', email: 'yoshida@example.com' },
  { name: '山本愛', email: 'yamamoto@example.com' },
  { name: '松本拓也', email: 'matsumoto@example.com' },
  { name: '井上理恵', email: 'inoue@example.com' },
  { name: '木村智也', email: 'kimura@example.com' },
  { name: '林真由美', email: 'hayashi@example.com' },
  { name: '斎藤隆', email: 'saito@example.com' },
  { name: '清水香織', email: 'shimizu@example.com' },
  { name: '森川雅彦', email: 'morikawa@example.com' },
  { name: '橋本沙織', email: 'hashimoto@example.com' },
  { name: '中村和也', email: 'nakamura@example.com' },
  { name: '池田美穂', email: 'ikeda@example.com' },
  // ちょい増量
  { name: '大野光', email: 'ohno@example.com' },
  { name: '藤田彩', email: 'fujita@example.com' },
  { name: '長谷川悠', email: 'hasegawa@example.com' },
  { name: '岡本真', email: 'okamoto@example.com' },
  { name: '近藤葵', email: 'kondo@example.com' },
];

const nouns = ['空港', '駅', 'ホテル', '市場', '美術館', '屋台', '旧市街', 'ショッピングモール', '海辺', '郊外'];
const foods = ['フォー', 'パエリア', '寿司', 'ピザ', 'パスタ', 'チーズ', 'タコス', 'バインミー', 'カレー', 'ケバブ'];
const transport = ['地下鉄', 'バス', 'トラム', 'タクシー', 'Uber', '電車'];

/** ---------- content generators ---------- **/
const titleTemplates: Record<string, string[]> = {
  'Lost Luggage': ['{cityJa}で荷物が出てこなかった日', '{cityJa}空港でロストバゲージに遭遇'],
  'Flight Delay': ['{cityJa}行きフライトが大幅遅延', '悪天候で{cityJa}到着が深夜に…'],
  'Food Poisoning': ['{cityJa}で食あたり…回復までの記録', '屋台で体調不良になった話（{cityJa}）'],
  'Pickpocketing': ['{cityJa}でスリ被害に注意！', '混雑の{noun}でスマホを盗られかけた'],
  'Language Barrier': ['言葉が通じずに焦った瞬間（{cityJa}）', '{cityJa}での注文が通じない！どう乗り切ったか'],
  'Transportation Issues': ['{transport}が止まって動けない（{cityJa}）', '{cityJa}で乗り間違えた話'],
  'Accommodation Problems': ['予約と違う部屋！？（{cityJa}）', '{cityJa}の宿で設備トラブル'],
  'Currency Exchange': ['両替で損した…（{cityJa}）', '{cityJa}での両替はどこが良かった？'],
  'Medical Emergency': ['{cityJa}で急な発熱、病院へ', '旅先で病院にお世話になった（{cityJa}）'],
  'Lost Passport': ['{cityJa}でパスポート紛失！対応の流れ', '領事館へ駆け込んだ日（{cityJa}）'],
  'Visa Issues': ['ビザの思わぬ落とし穴（{cityJa}）', '入国審査で止められた話'],
  'Weather Disruption': ['悪天候で予定総崩れ（{cityJa}）', '{cityJa}で突然の豪雨に翻弄'],
  'Internet Connection': ['Wi-Fi難民になった日（{cityJa}）', '通信手段がなくて詰んだ（{cityJa}）'],
  'ATM Problems': ['ATMで引き出せない…（{cityJa}）', 'カードが使えず途方に暮れた'],
  'Overcharging': ['観光地価格で大出費（{cityJa}）', 'タクシーで高額請求に遭遇（{cityJa}）'],
  'Cultural Misunderstanding': ['文化の違いでヒヤリ（{cityJa}）', '知らずにNG行為をしてしまった'],
  'Tourist Scam': ['よくある詐欺の誘いに遭遇（{cityJa}）', '呼び込みに要注意！'],
  'Public Transportation': ['路線図が難しすぎた（{cityJa}）', '出口を間違えて迷子に…（{cityJa}）'],
  'Restaurant Issues': ['注文と違う料理が来た（{cityJa}）', 'アレルギー伝わらずヒヤリ（{cityJa}）'],
  'Shopping Problems': ['荷物が重量オーバーに（{cityJa}）', '返品で揉めた話（{cityJa}）'],
};

const bodyTemplates: Record<string, string[]> = {
  'Lost Luggage': [
    '{month}月の{cityJa}到着時、ターンテーブルで1時間待っても荷物が出てこず…。スタッフに確認すると乗継遅延とのこと。翌日夕方にホテルへ配送され助かりましたが、着替えがなくて寒かったです。教訓：機内持込に1泊分！',
  ],
  'Flight Delay': [
    '悪天候でフライトが{delay}時間遅延し、{cityJa}着は深夜。{transport}も終わっていて空港で仮眠しました。航空会社のミールクーポンは出たものの疲労感は大きめ。遅延時は保険と代替交通の事前確認が大事だと痛感。',
  ],
  'Food Poisoning': [
    '{cityJa}の屋台で食べた{food}が美味しかったのですが、翌日から発熱と腹痛。病院では軽い細菌性との診断で点滴。保険で費用はカバーされました。水分補給と無理しない行程が大切。',
  ],
  'Pickpocketing': [
    '{cityJa}の{noun}で写真に夢中になっている間にポケットが開いていました。幸い二重ロックのポーチだったので未遂で済みました。前ポケット&ファスナー徹底が有効。',
  ],
  'Language Barrier': [
    '{cityJa}のローカル食堂で英語メニューなし。指差しと翻訳アプリで何とか注文しましたが、想像と違う料理に。最低限のあいさつと食関連単語を事前メモしておくと安心。',
  ],
  'Transportation Issues': [
    '{cityJa}で{transport}が運休。振替案内も現地語のみで戸惑いましたが、駅員さんが親切に教えてくれて助かりました。オフライン路線図と現金少額は常備！',
  ],
  'Accommodation Problems': [
    '{cityJa}の宿で空調が故障。満室で部屋替えできず扇風機対応に。翌朝に割引対応してくれました。チェックイン時に設備チェックを軽くするのがおすすめ。',
  ],
  'Currency Exchange': [
    '{cityJa}中心部の両替所はレートが悪く、郊外の店舗の方が良心的でした。比較アプリで複数店を事前チェックした方が安心。',
  ],
  'Medical Emergency': [
    '{cityJa}で発熱し、旅行保険の24hデスクに連絡→提携病院へ。キャッシュレスで診療できスムーズでした。常備薬と保険証券番号はスマホ&紙で二重管理。',
  ],
  'Lost Passport': [
    '{cityJa}でパスポートを紛失。警察で紛失届→領事館で渡航書発行と、意外と手順が多いです。顔写真をデータで持っていて時短になりました。',
  ],
  'Visa Issues': [
    '{cityJa}入国時にビザの滞在条件について追加質問。往復航空券やホテル予約の提示で解決。紙とPDFの両方を用意しておくと安心。',
  ],
  'Weather Disruption': [
    '{cityJa}で突然の豪雨。屋内の美術館やカフェ巡りに予定変更して結果的に良い体験に。柔軟なプランBは必須。',
  ],
  'Internet Connection': [
    'ホテルWi-Fiが不安定でテザリングも速度制限に。現地SIMを購入して解決。到着当日に通信手段を確保すると旅が楽になります。',
  ],
  'ATM Problems': [
    '{cityJa}のATMでカードが認識されず。銀行アプリで海外利用の有効化を忘れていました…。少額の現金と複数カードのバックアップが安心。',
  ],
  'Overcharging': [
    '{cityJa}のタクシーでメーター未使用の高額請求。相場と違うと感じたら降車前に明確に確認、領収書は必ずもらう！',
  ],
  'Cultural Misunderstanding': [
    '{cityJa}の宗教施設で写真撮影がNGの場所をうっかり撮ってしまい注意されました。掲示が現地語のみだったので、事前にマナーを調べる大切さを実感。',
  ],
  'Tourist Scam': [
    '{cityJa}観光地で「無料ツアー」の呼びかけ。口コミを確認すると典型的な手口でした。甘い勧誘ほど慎重に。',
  ],
  'Public Transportation': [
    '{cityJa}の路線が複雑で乗り換えをミス。駅構内図をしっかり見る&人に聞く勇気でリカバリ。',
  ],
  'Restaurant Issues': [
    '{cityJa}のレストランで注文と違う料理。写真メニューがない場合は番号と要点をはっきり伝えるのがコツ。',
  ],
  'Shopping Problems': [
    'お土産を買いすぎて重量オーバー。帰国便の手荷物規定を甘く見ていました。携帯はかりが1つあると便利！',
  ],
};

const commentSnippets = [
  '体験談助かります！',
  'これから行くので参考にします。',
  '保険の重要性…身にしみますね。',
  '現地の方が優しいの救いですね。',
  '同じ場所で似た経験しました。',
  'オフライン地図、たしかに有効！',
  'チップ文化むずかしい…',
  '写真NGは気をつけます。',
  'SIMは空港で買うのが楽でした。',
  '次回の旅で試してみます！',
];

function buildTitle(troubleEn: string, cityJa: string) {
  const pool = titleTemplates[troubleEn] ?? ['{cityJa}での体験記'];
  const raw = pick(pool);
  return raw
    .replaceAll('{cityJa}', cityJa)
    .replaceAll('{noun}', pick(nouns))
    .replaceAll('{transport}', pick(transport));
}

function buildBody(troubleEn: string, cityJa: string, month: number) {
  const pool = bodyTemplates[troubleEn] ?? ['{cityJa}での出来事を記録します。'];
  const raw = pick(pool);
  const delay = randint(2, 8);
  return raw
    .replaceAll('{cityJa}', cityJa)
    .replaceAll('{food}', pick(foods))
    .replaceAll('{month}', String(month))
    .replaceAll('{noun}', pick(nouns))
    .replaceAll('{transport}', pick(transport))
    .replaceAll('{delay}', String(delay));
}

/** ---------- main ---------- **/
async function main() {
  console.log('� シードデータ投入を開始');

  // 既存データ削除（外部キー順に）
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
  const createdCountries = await Promise.all(
    countries.map((c, i) =>
      prisma.country.create({ data: { id: i + 1, enName: c.enName, jaName: c.jaName } })
    )
  );

  // 都市（緯度経度を保存）
  const createdCities = await Promise.all(
    cities.map((c, i) =>
      prisma.city.create({
        data: {
          id: i + 1,
          enName: c.enName,
          jaName: c.jaName,
          countryId: createdCountries[c.countryIndex].id,
          photoUrl: `https://example.com/photos/${c.enName.toLowerCase()}.jpg`,
        },
      })
    )
  );

  // トラブル
  const createdTroubles = await Promise.all(
    troubles.map((t, i) =>
      prisma.trouble.create({ data: { id: i + 1, enName: t.enName, jaName: t.jaName } })
    )
  );

  // ユーザー & プロフィール
  const createdUsers = await Promise.all(
    sampleUsers.map(async (u) => {
      const user = await prisma.user.create({
        data: {
          name: u.name,
          email: u.email,
          image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u.name)}`,
          profile: `${u.name}です。旅の気づきをメモしています。`,
        },
      });
      await prisma.profile.create({
        data: {
          userId: user.id,
          bio: `こんにちは！${u.name}です。🌍 ${randint(6, 22)}カ国を訪問。公共交通とローカル飯が好き。`,
          avatarUrl: user.image,
        },
      });
      return user;
    })
  );

  // 投稿
  const postsCount = 280; // 少し増量
  const startYear = 2020;
  const endYear = 2024;

  const postRecords = [];
  for (let i = 0; i < postsCount; i++) {
    const user = pick(createdUsers);
    const city = pick(createdCities);
    const trouble = pick(createdTroubles);

    const country =
      createdCountries.find((c) => c.id === (city as any).countryId) ?? createdCountries[0];

    const travelYear = randint(startYear, endYear);
    const travelMonth = randint(1, 12);
    const createdAt = randomDateBetween(
      fromYearMonth(travelYear, travelMonth),
      new Date(Date.UTC(travelYear, travelMonth - 1, 28, 23, 59))
    );

    const citySeed = cities[createdCities.indexOf(city)];
    const { lat, lng } = jitterLatLng(citySeed.lat, citySeed.lng);

    const title = buildTitle(trouble.enName, (city as any).jaName);
    const content = buildBody(trouble.enName, (city as any).jaName, travelMonth);

    postRecords.push(
      prisma.post.create({
        data: {
          title: `${title}`,
          content,
          userId: user.id,
          cityId: (city as any).id,
          countryId: country.id,
          troubleId: trouble.id,
          travelYear,
          travelMonth,
          latitude: lat,
          longitude: lng,
          likeCount: 0, // 後で集計
          createdAt,
        },
      })
    );
  }

  const createdPosts = await Promise.all(postRecords);

  // コメント（内容を少し文脈寄せ）
  const commentCreates = [];
  for (let i = 0; i < 650; i++) {
    const post = pick(createdPosts);
    const user = pick(createdUsers);
    const extra = pick([
      `（${randint(1, 3)}月に${randint(1, 2)}週間滞在しました）`,
      '次は保険もしっかり確認していきます。',
      '現地アプリを事前にDLしておきます。',
      '夜間の移動は避けるようにします。',
      'Googleマップのオフライン保存、便利ですよね。',
      '',
    ]);

    commentCreates.push(
      prisma.comment.create({
        data: {
          content: `${pick(commentSnippets)} ${extra}`.trim(),
          postId: post.id,
          userId: user.id,
          createdAt: randomDateBetween(post.createdAt, new Date(Date.UTC(2025, 0, 1))),
        },
      })
    );
  }
  const createdComments = await Promise.all(commentCreates);

  // いいね（重複排除）
  const likeSet = new Set<string>();
  const likeCreates = [];
  for (let i = 0; i < 1400; i++) {
    const post = pick(createdPosts);
    const user = pick(createdUsers);
    const key = `${post.id}:${user.id}`;
    if (likeSet.has(key)) continue;
    likeSet.add(key);
    likeCreates.push(
      prisma.like.create({
        data: {
          postId: post.id,
          userId: user.id,
          createdAt: randomDateBetween(post.createdAt, new Date(Date.UTC(2025, 0, 1))),
        },
      })
    );
  }
  const createdLikes = await Promise.all(likeCreates);

  // likeCountを正しく反映
  await Promise.all(
    createdPosts.map(async (p) => {
      const cnt = await prisma.like.count({ where: { postId: p.id } });
      await prisma.post.update({ where: { id: p.id }, data: { likeCount: cnt } });
    })
  );

  console.log('✅ 完了');
  console.log(`
📊 作成サマリ
- 国: ${createdCountries.length}
- 都市: ${createdCities.length}（全て緯度経度付き）
- トラブル: ${createdTroubles.length}
- ユーザー: ${createdUsers.length}
- 投稿: ${createdPosts.length}
- コメント: ${createdComments.length}
- いいね: ${createdLikes.length}
  `);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
