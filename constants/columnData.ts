export interface Article {
  id: string;
  title: string;
  category: ArticleCategory;
  excerpt: string;
  content: ArticleContent[];
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  image: string;
  publishedAt: string;
  readingTime: number; // minutes
  isFeatured?: boolean;
  tags?: string[]; // タグ追加
  date?: string; // 日付表示用（YYYY.MM.DD形式）
}

export type ArticleCategory = 'health' | 'nutrition' | 'parenting' | 'education' | 'support';

export interface ArticleContent {
  type: 'heading' | 'paragraph' | 'highlight' | 'image' | 'list';
  content: string | string[];
  alt?: string; // for images
}

export const categoryColors: Record<ArticleCategory, { color: string; label: string; bgColor: string }> = {
  health: {
    color: '#EF4444',
    label: '健康・発達',
    bgColor: '#FEE2E2'
  },
  nutrition: {
    color: '#F59E0B',
    label: '栄養・食事',
    bgColor: '#FEF3C7'
  },
  parenting: {
    color: '#10B981',
    label: '育児のコツ',
    bgColor: '#D1FAE5'
  },
  education: {
    color: '#3B82F6',
    label: '教育・遊び',
    bgColor: '#DBEAFE'
  },
  support: {
    color: '#8B5CF6',
    label: '制度・支援',
    bgColor: '#EDE9FE'
  },
};

export const mockArticles: Article[] = [
  {
    id: '1',
    title: '2歳児の成長発達：この時期に見られる変化と親のサポート方法',
    category: 'health',
    excerpt: '2歳は「魔の2歳児」と呼ばれることもありますが、実は脳の発達が著しい大切な時期です。この時期の特徴と適切なサポート方法をご紹介します。',
    tags: ['2歳児', 'イヤイヤ期', '発達', '身体発達'],
    date: '2025.10.01',
    content: [
      {
        type: 'heading',
        content: '2歳児の身体的発達'
      },
      {
        type: 'paragraph',
        content: '2歳になると、歩く・走る・跳ぶといった基本的な運動能力が著しく向上します。また、手先の器用さも発達し、クレヨンで丸を描いたり、大きなボタンを留めたりすることができるようになります。'
      },
      {
        type: 'highlight',
        content: '💡 この時期は、安全な環境で思い切り体を動かせる機会を作ることが大切です。公園での遊びや、室内での運動遊びを積極的に取り入れましょう。'
      },
      {
        type: 'heading',
        content: '言葉の発達'
      },
      {
        type: 'paragraph',
        content: '2歳前半では2語文（「ママ、いた」など）、2歳後半では3語文以上を話すようになります。語彙も急速に増え、1日に何個も新しい言葉を覚えることもあります。'
      },
      {
        type: 'list',
        content: [
          '絵本の読み聞かせを毎日の習慣に',
          '子どもの言葉を繰り返して確認する',
          '質問には丁寧に答える',
          '無理に言葉を強要しない'
        ]
      },
      {
        type: 'heading',
        content: '「イヤイヤ期」への対応'
      },
      {
        type: 'paragraph',
        content: 'この時期は自我が芽生え、何でも「イヤ！」と言いたがることがあります。これは成長の証であり、自己主張できるようになった証拠です。'
      },
      {
        type: 'highlight',
        content: '💡 選択肢を与える（「赤い服と青い服、どっちにする？」）ことで、子どもの自主性を尊重しながらスムーズに行動できることがあります。'
      },
      {
        type: 'paragraph',
        content: '焦らず、子どものペースを大切にしながら、成長を見守りましょう。困ったときは、保育士や保健師に相談することも大切です。'
      }
    ],
    author: {
      name: '山田 花子',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=600',
      role: '保育士・子育てアドバイザー'
    },
    image: 'https://images.pexels.com/photos/1257110/pexels-photo-1257110.jpeg?auto=compress&cs=tinysrgb&w=800',
    publishedAt: '2025-10-01',
    readingTime: 5,
    isFeatured: true
  },
  {
    id: '2',
    title: '離乳食から幼児食へ：1歳半からの食事の進め方',
    category: 'nutrition',
    excerpt: '離乳食を卒業して幼児食に移行する時期の食事のポイントと、好き嫌いへの対応方法をご紹介します。',
    tags: ['幼児食', '栄養バランス', '好き嫌い', '食育'],
    date: '2025.09.28',
    content: [
      {
        type: 'heading',
        content: '幼児食とは'
      },
      {
        type: 'paragraph',
        content: '幼児食は、1歳半頃から5歳頃までの子どもに適した食事のことです。大人の食事に近づきますが、まだ消化機能が未熟なため、調理方法や味付けに配慮が必要です。'
      },
      {
        type: 'highlight',
        content: '💡 幼児食の基本は「薄味・軟らかめ・小さめ」。大人の食事から取り分ける場合は、味付け前に取り分けるのがおすすめです。'
      },
      {
        type: 'heading',
        content: '栄養バランスのポイント'
      },
      {
        type: 'list',
        content: [
          '主食・主菜・副菜をバランスよく',
          '1日3食＋おやつ2回が基本',
          'カルシウムと鉄分を意識的に',
          '水分補給をこまめに'
        ]
      },
      {
        type: 'heading',
        content: '好き嫌いへの対応'
      },
      {
        type: 'paragraph',
        content: 'この時期は味覚が発達し、好き嫌いが出てくることがあります。無理に食べさせるのではなく、調理法を変えたり、一緒に料理をしたりして、楽しく食事をすることを心がけましょう。'
      },
      {
        type: 'paragraph',
        content: '食べムラがあっても、1週間単位でバランスが取れていれば問題ありません。楽しい食卓の雰囲気を大切にしてください。'
      }
    ],
    author: {
      name: '佐藤 美咲',
      avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=600',
      role: '管理栄養士'
    },
    image: 'https://images.pexels.com/photos/1324803/pexels-photo-1324803.jpeg?auto=compress&cs=tinysrgb&w=800',
    publishedAt: '2025-09-28',
    readingTime: 6,
    isFeatured: true
  },
  {
    id: '3',
    title: 'トイレトレーニングの始め方：焦らず進める3つのステップ',
    category: 'parenting',
    excerpt: 'トイレトレーニングを始めるタイミングと、子どものペースに合わせた進め方をご紹介します。',
    tags: ['トイレトレーニング', '自立', '生活習慣', 'ステップ'],
    date: '2025.09.25',
    content: [
      {
        type: 'heading',
        content: 'トイレトレーニングを始める目安'
      },
      {
        type: 'paragraph',
        content: 'トイレトレーニングを始めるのに適した時期は、個人差がありますが、一般的に以下のサインが見られる頃です。'
      },
      {
        type: 'list',
        content: [
          'おしっこの間隔が2時間以上空く',
          '「出た」「出る」を言葉や仕草で伝えられる',
          '一人で歩いて移動できる',
          '簡単な指示を理解できる'
        ]
      },
      {
        type: 'highlight',
        content: '💡 焦りは禁物！子どものペースを大切にし、失敗しても叱らないことが成功の秘訣です。'
      },
      {
        type: 'heading',
        content: 'ステップ1：トイレに慣れる'
      },
      {
        type: 'paragraph',
        content: 'まずはトイレという場所に慣れることから始めましょう。絵本やDVDでトイレのイメージを持たせたり、おまるや補助便座を見せて興味を引いたりします。'
      },
      {
        type: 'heading',
        content: 'ステップ2：定期的にトイレに誘う'
      },
      {
        type: 'paragraph',
        content: '起床後、食後、外出前など、タイミングを決めて定期的にトイレに誘います。成功したら大いに褒めることが大切です。'
      },
      {
        type: 'heading',
        content: 'ステップ3：パンツに移行する'
      },
      {
        type: 'paragraph',
        content: '日中の成功率が高くなってきたら、パンツに移行します。最初は失敗も多いですが、着替えを用意して焦らず進めましょう。'
      },
      {
        type: 'paragraph',
        content: '夜のおむつは、日中のトレーニングが完了してから、子どもの体の発達に合わせて外していきます。焦らず、子どものペースを尊重しましょう。'
      }
    ],
    author: {
      name: '鈴木 太郎',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=600',
      role: '保育士'
    },
    image: 'https://images.pexels.com/photos/4473601/pexels-photo-4473601.jpeg?auto=compress&cs=tinysrgb&w=800',
    publishedAt: '2025-09-25',
    readingTime: 7,
    isFeatured: true
  },
  {
    id: '4',
    title: '雨の日でも楽しめる！室内遊びのアイデア10選',
    category: 'education',
    excerpt: '雨の日や寒い日でも、家の中で楽しく過ごせる遊びのアイデアをご紹介します。',
    tags: ['室内遊び', '創造力', 'アイデア', '雨の日'],
    date: '2025.09.22',
    content: [
      {
        type: 'paragraph',
        content: '外で遊べない日が続くと、子どもも親もストレスが溜まりがち。でも工夫次第で、室内でも十分に楽しめます！'
      },
      {
        type: 'heading',
        content: '体を動かす遊び'
      },
      {
        type: 'list',
        content: [
          '新聞紙を使った遊び（丸める、破る、玉入れ）',
          '風船バレーボール',
          'かくれんぼ',
          '障害物コース作り'
        ]
      },
      {
        type: 'heading',
        content: '創造力を育む遊び'
      },
      {
        type: 'list',
        content: [
          'お絵かき・ぬり絵',
          '粘土遊び',
          '折り紙',
          '段ボール工作'
        ]
      },
      {
        type: 'highlight',
        content: '💡 一緒に料理をするのもおすすめ！混ぜる、こねる、型抜きなど、子どもができることはたくさんあります。'
      },
      {
        type: 'heading',
        content: '学びにつながる遊び'
      },
      {
        type: 'list',
        content: [
          '絵本の読み聞かせ',
          'パズル',
          '数や文字のカード遊び',
          'ごっこ遊び（お店屋さん、お医者さんなど）'
        ]
      },
      {
        type: 'paragraph',
        content: '大切なのは、親も一緒に楽しむこと。笑顔で過ごせば、雨の日も楽しい思い出になります。'
      }
    ],
    author: {
      name: '田中 明美',
      avatar: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=600',
      role: '幼児教育専門家'
    },
    image: 'https://images.pexels.com/photos/3662630/pexels-photo-3662630.jpeg?auto=compress&cs=tinysrgb&w=800',
    publishedAt: '2025-09-22',
    readingTime: 5
  },
  {
    id: '5',
    title: '札幌市の保育園入園申し込み：スケジュールと必要書類',
    category: 'support',
    excerpt: '札幌市の認可保育園への入園申し込みについて、スケジュールと必要な書類をまとめました。',
    tags: ['入園申し込み', '札幌市', '必要書類', 'スケジュール'],
    date: '2025.09.20',
    content: [
      {
        type: 'heading',
        content: '入園申し込みのスケジュール'
      },
      {
        type: 'paragraph',
        content: '札幌市では、4月入園の一斉申し込みは、前年の11月頃に行われます。年度途中の入園希望の場合は、入園希望月の前月10日までに申し込みが必要です。'
      },
      {
        type: 'highlight',
        content: '💡 申し込みは早めに！特に0〜2歳児クラスは競争率が高いため、余裕を持って準備しましょう。'
      },
      {
        type: 'heading',
        content: '必要な書類'
      },
      {
        type: 'list',
        content: [
          '給付認定等申請書',
          '保育を必要とする証明書類（就労証明書など）',
          'マイナンバー確認書類',
          '本人確認書類',
          '児童の健康状態申告書'
        ]
      },
      {
        type: 'paragraph',
        content: '就労証明書は勤務先に記入してもらう必要があるため、早めに依頼しましょう。自営業の方は、開業届の写しなどが必要になります。'
      },
      {
        type: 'heading',
        content: '利用調整（選考）について'
      },
      {
        type: 'paragraph',
        content: '札幌市では、保育の必要性の高い家庭から優先的に入園が決定されます。両親の就労時間、兄弟の在園状況などが考慮されます。'
      },
      {
        type: 'paragraph',
        content: '詳しい情報は、札幌市のホームページや、各区の保健センターで確認できます。不明な点があれば、気軽に相談しましょう。'
      }
    ],
    author: {
      name: '高橋 健一',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=600',
      role: '保育コンシェルジュ'
    },
    image: 'https://images.pexels.com/photos/8613089/pexels-photo-8613089.jpeg?auto=compress&cs=tinysrgb&w=800',
    publishedAt: '2025-09-20',
    readingTime: 6
  },
  {
    id: '6',
    title: '夜泣き対策：月齢別の原因と対処法',
    category: 'health',
    excerpt: '赤ちゃんの夜泣きに悩んでいませんか？月齢別の原因と効果的な対処法をご紹介します。',
    tags: ['夜泣き', '睡眠', '月齢別', '対処法'],
    date: '2025.09.18',
    content: [
      {
        type: 'paragraph',
        content: '夜泣きは多くの親が経験する悩みの一つ。原因を理解して、適切に対応することで、少しでも楽になる方法を見つけましょう。'
      },
      {
        type: 'heading',
        content: '生後3〜4ヶ月頃の夜泣き'
      },
      {
        type: 'paragraph',
        content: 'この時期は、昼夜のリズムが整い始める時期です。お腹が空いている、おむつが濡れているなどの理由が多いです。'
      },
      {
        type: 'heading',
        content: '生後6〜8ヶ月頃の夜泣き'
      },
      {
        type: 'paragraph',
        content: '脳の発達により、夢を見るようになったり、昼間の刺激を処理したりすることで夜泣きが増えることがあります。'
      },
      {
        type: 'highlight',
        content: '💡 夜泣きがひどい時は、抱っこで安心させたり、子守唄を歌ったりするのが効果的です。'
      },
      {
        type: 'heading',
        content: '1歳以降の夜泣き'
      },
      {
        type: 'paragraph',
        content: '夜驚症や悪夢が原因のこともあります。また、日中の生活リズムの乱れが影響することもあります。'
      },
      {
        type: 'list',
        content: [
          '日中しっかり体を動かす',
          '寝る前のルーティンを作る',
          '寝室の環境を整える（温度、明るさ）',
          '寝る前の興奮を避ける'
        ]
      },
      {
        type: 'paragraph',
        content: '夜泣きは必ず終わりが来ます。辛い時は家族に協力してもらい、一人で抱え込まないことが大切です。'
      }
    ],
    author: {
      name: '中村 由美',
      avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=600',
      role: '助産師'
    },
    image: 'https://images.pexels.com/photos/1910236/pexels-photo-1910236.jpeg?auto=compress&cs=tinysrgb&w=800',
    publishedAt: '2025-09-18',
    readingTime: 5
  },
  {
    id: '7',
    title: 'アレルギー対応食：安全に美味しく食べるためのポイント',
    category: 'nutrition',
    excerpt: '食物アレルギーのあるお子さんのための、栄養バランスを保ちながら美味しく食べられる工夫をご紹介します。',
    tags: ['アレルギー', '代替食材', '安全', '栄養'],
    date: '2025.09.15',
    content: [
      {
        type: 'paragraph',
        content: '食物アレルギーがあっても、工夫次第で楽しく美味しい食事ができます。栄養バランスを保ちながら、安全な食生活を送るためのポイントをお伝えします。'
      },
      {
        type: 'heading',
        content: '主なアレルゲンと代替食材'
      },
      {
        type: 'paragraph',
        content: '卵アレルギー：つなぎには片栗粉や山芋、パン粉などを使用。卵の栄養は鶏肉や大豆製品で補えます。'
      },
      {
        type: 'paragraph',
        content: '乳アレルギー：豆乳やアーモンドミルクで代替。カルシウムは小魚や緑黄色野菜から摂取できます。'
      },
      {
        type: 'highlight',
        content: '💡 食品表示をしっかり確認！加工食品には意外なところにアレルゲンが含まれていることがあります。'
      },
      {
        type: 'heading',
        content: '外食時の注意点'
      },
      {
        type: 'list',
        content: [
          '事前にお店にアレルギーを伝える',
          'アレルギー対応メニューがあるか確認',
          '調理器具の共用による混入リスクを確認',
          '万が一に備えて薬を持参'
        ]
      },
      {
        type: 'heading',
        content: '保育園・幼稚園との連携'
      },
      {
        type: 'paragraph',
        content: '入園時にアレルギーについて詳しく伝え、医師の診断書を提出しましょう。給食やおやつの献立を事前に確認し、必要に応じてお弁当を持参することもあります。'
      },
      {
        type: 'paragraph',
        content: 'アレルギーは年齢とともに改善することもあります。定期的に医師の診断を受けながら、適切に対応していきましょう。'
      }
    ],
    author: {
      name: '佐藤 美咲',
      avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=600',
      role: '管理栄養士'
    },
    image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800',
    publishedAt: '2025-09-15',
    readingTime: 6
  },
  {
    id: '8',
    title: '兄弟げんかへの対応：親の上手な関わり方',
    category: 'parenting',
    excerpt: '兄弟げんかは成長の証。でも毎日続くと疲れてしまいますよね。上手な対応方法をご紹介します。',
    tags: ['兄弟げんか', '社会性', '関わり方', '工夫'],
    date: '2025.09.12',
    content: [
      {
        type: 'paragraph',
        content: '兄弟げんかは、社会性を学ぶ大切な機会でもあります。親はどこまで介入すべきか、悩むことも多いでしょう。'
      },
      {
        type: 'heading',
        content: '見守るべきけんか'
      },
      {
        type: 'paragraph',
        content: '軽い口論や、おもちゃの取り合い程度であれば、少し離れた場所から見守りましょう。子どもたち自身で解決する力を育てることができます。'
      },
      {
        type: 'heading',
        content: '介入すべきけんか'
      },
      {
        type: 'list',
        content: [
          '暴力を振るっている',
          '一方的にいじめている',
          '危険な状況になっている',
          '感情的になりすぎて収拾がつかない'
        ]
      },
      {
        type: 'highlight',
        content: '💡 介入する時は、どちらかの味方をするのではなく、両方の気持ちを聞いて、一緒に解決策を考えましょう。'
      },
      {
        type: 'heading',
        content: '上の子への配慮'
      },
      {
        type: 'paragraph',
        content: '下の子が生まれると、上の子は「お兄ちゃん/お姉ちゃんなんだから」と言われがちです。でも、上の子もまだ小さな子ども。甘えたい気持ちを受け止めてあげることが大切です。'
      },
      {
        type: 'heading',
        content: 'けんかを減らす工夫'
      },
      {
        type: 'list',
        content: [
          '一人ひとりと過ごす時間を作る',
          'おもちゃは個人用と共有用を分ける',
          '上手に遊べた時は具体的に褒める',
          '疲れている時はけんかが増えることを理解する'
        ]
      },
      {
        type: 'paragraph',
        content: '兄弟げんかは、将来の人間関係を築く練習でもあります。長い目で見守りましょう。'
      }
    ],
    author: {
      name: '山田 花子',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=600',
      role: '保育士・子育てアドバイザー'
    },
    image: 'https://images.pexels.com/photos/4473889/pexels-photo-4473889.jpeg?auto=compress&cs=tinysrgb&w=800',
    publishedAt: '2025-09-12',
    readingTime: 6
  }
];
