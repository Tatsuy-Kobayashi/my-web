document.addEventListener('DOMContentLoaded', async function () {
    'use strict'; // 状態遷移重視・エラーフラグ管理ありの完全版スクリプト

    // ------------------------
    // 状態定義
    // ------------------------
    const STATE = {
        DOM_LOADING: 'DOM_LOADING',
        DATA_INITIALIZATION: 'DATA_INITIALIZATION',
        NETWORK_INITIALIZATION: 'NETWORK_INITIALIZATION',
        HASH_BOOTSTRAP: 'HASH_BOOTSTRAP',
        BOOTSTRAP_SEARCH: 'BOOTSTRAP_SEARCH',
        IDLE: 'IDLE',
        SEARCHING: 'SEARCHING',
        ERROR: 'ERROR'
    };
    // ------------------------
    // エラーフラグ
    // ------------------------
    const errorFlags = {
        missingDom: false,
        visNotAvailable: false,
        invalidData: false,
        networkInitFailed: false
    };

    let currentState = STATE.DOM_LOADING; // 「DOM読み込み中」で初期化

    // ------------------------
    // データ（ノード）
    // ------------------------
    // id: ノードID
    // label: ラベル
    // labelEn: 英語ラベル
    // url: ノードクリック時に開くURL
    // level: 深さ（現在は学問のみが明示的に持つ）
    // mainPath: ルートからのパス情報（多親対応）
    // auxPath: 補助パス情報（複数可、多親対応）
    // released: 公開フラグ（0: 未公開、1: 公開）
    // isPaid: 有料フラグ（0: 無料、1: 有料）
    // datePublished: 公開日
    // dateModified: 更新日
    // description: ノード説明文
    // keywords: タグ配列
    // iconClass: アイコンのCSSクラス（FontAwesome等）
    // imageUrl: プレビュー画像のURL
    // thumbnailUrl: サムネイル画像のURL配列（複数解像度対応）
    // ------------------------
    console.log('[INIT] Loading siteData...');
    const siteData = [
        { id: 0, label: "学問", labelEn: "Academic Disciplines", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/academic_discipline.html", level: 0, mainPath: ["0"], released: 1, isPaid: 0, datePublished: "2024-09-28", dateModified: "2024-12-25", description: "あらゆる事物は何かしらの学問の一領域として捉えることができる", iconClass: "fa-graduation-cap", imageUrl: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/Yukichi_Fukuzawa_1891.png" },

        // 深さ1
        { id: 1, label: "人文科学", labelEn: "Humanities", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/humanities/humanities.html", mainPath: ["0:1"], released: 0, isPaid: 0, iconClass: "fa-folder fa-fw" },
        { id: 2, label: "社会科学", labelEn: "Social Sciences", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/social_science/social_science.html", mainPath: ["0:2"], released: 0, isPaid: 0, iconClass: "fa-folder fa-fw" },
        { id: 3, label: "形式科学", labelEn: "Formal Sciences", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/formal_science.html", mainPath: ["0:3"], released: 1, isPaid: 0, iconClass: "fa-shapes" },
        { id: 4, label: "自然科学", labelEn: "Natural Sciences", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/natural_science/natural_science.html", mainPath: ["0:4"], released: 1, isPaid: 0, iconClass: "fa-leaf" },
        { id: 5, label: "応用科学", labelEn: "Applied Sciences", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/academic_discipline.html", mainPath: ["0:5"], released: 0, isPaid: 0, iconClass: "fa-folder fa-fw" },
        { id: 6, label: "学際領域", labelEn: "Interdisciplinary Fields", url: "https://tatsuy-kobayashi.github.io/my-web/docs/#", mainPath: ["0:6"], released: 0, isPaid: 0, iconClass: "fa-folder fa-fw" },

        // 深さ2
        // 人文科学1
        { id: 10, label: "哲学", labelEn: "Philosophy", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/humanities/philosophy/philosophy.html", mainPath: ["0:1:10"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        { id: 11, label: "芸術学", labelEn: "Art Studies", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/humanities/art_study/art_study.html", mainPath: ["0:1:11"], released: 1, isPaid: 0, iconClass: "fa-folder fa-fw" },
        /*{ id: 11, label: "宗教学", labelEn: "Religious Studies", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/humanities/religious_study/religious_study.html", mainPath: ["0:1:11"] },*/
        { id: 12, label: "言語学", labelEn: "Linguistics", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/humanities/linguistics/linguistics.html", mainPath: ["0:1:12"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        { id: 13, label: "心理学", labelEn: "Psychology", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/humanities/psychology/psychology.html", mainPath: ["0:1:13"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        { id: 14, label: "人類学", labelEn: "Anthropology", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/humanities/anthropology/anthropology.html", mainPath: ["0:1:14"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        { id: 15, label: "考古学", labelEn: "Archaeology", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/humanities/archaeology/archaeology.html", mainPath: ["0:1:15"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        // 社会科学2
        { id: 20, label: "社会学", labelEn: "Sociology", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/social_science/sociology/sociology.html", mainPath: ["0:2:20"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        { id: 21, label: "地理学", labelEn: "Geography", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/social_science/geography/geography.html", mainPath: ["0:2:21"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        { id: 22, label: "歴史学", labelEn: "Historical Science", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/social_science/historical_science/historical_science.html", mainPath: ["0:2:22"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        { id: 23, label: "政治学", labelEn: "Political Science", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/social_science/political_science/political_science.html", mainPath: ["0:2:23"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        { id: 24, label: "経済学", labelEn: "Economics", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/social_science/economics/economics.html", mainPath: ["0:2:24"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        { id: 25, label: "教育学", labelEn: "Pedagogy", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/social_science/pedagogy/pedagogy.html", mainPath: ["0:2:25"], released: 0, isPaid: 0, iconClass: "fa-folder fa-fw" },
        // 形式科学3
        { id: 30, label: "数学", labelEn: "Mathematics", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/mathematics.html", mainPath: ["0:3:30"], released: 1, isPaid: 0, datePublished: "2024-09-30", dateModified: "2025-01-04", description: "数学とは、数量および空間図形の性質について研究する学問。", keywords: ["学問", "数学", "情報理論", "物理学", "プログラミング", "教育"], iconClass: "fa-folder fa-fw", thumbnailUrl: ["https://tatsuy-kobayashi.github.io/my-web/docs/images/image-30-120x68.png", "https://tatsuy-kobayashi.github.io/my-web/docs/images/image-30-160x90.png", "https://tatsuy-kobayashi.github.io/my-web/docs/images/image-30-320x180.png"] },
        { id: 31, label: "統計学", labelEn: "Statistics", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/statistics/statistics.html", mainPath: ["0:3:31"], released: 0, isPaid: 0, description: "統計学とは、確率論を基盤にして、集団全体の性質を一部の標本を調べることによって推定するための処理・分析方法について研究する学問。", thumbnailUrl: ["https://tatsuy-kobayashi.github.io/my-web/docs/images/image-30-120x68.png", "https://tatsuy-kobayashi.github.io/my-web/docs/images/image-30-160x90.png", "https://tatsuy-kobayashi.github.io/my-web/docs/images/image-30-320x180.png"] },
        // 自然科学4
        { id: 40, label: "物理学", labelEn: "Physics", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/natural_science/physics/physics.html", mainPath: ["0:4:40"], released: 1, isPaid: 0, iconClass: "icon-physics" },
        { id: 41, label: "化学", labelEn: "Chemistry", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/natural_science/chemistry/chemistry.html", mainPath: ["0:4:41"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        { id: 42, label: "生物学", labelEn: "Biology", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/natural_science/biology/biology.html", mainPath: ["0:4:42"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        { id: 43, label: "地学", labelEn: "Earth Science", url: "https://tatsuy-kobayashi.github.io/my-web/docs/#", mainPath: ["0:4:43"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        // 応用科学5
        { id: 50, label: "情報学", labelEn: "Informatics", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/applied_science/informatics/informatics.html", mainPath: ["0:5:50"], released: 1, isPaid: 0, iconClass: "fa-folder fa-fw" },
        { id: 51, label: "工学", labelEn: "Engineering", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/applied_science/engineering/engineering.html", mainPath: ["0:5:51"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        { id: 52, label: "農学", labelEn: "Agricultural Science", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/applied_science/agricultural_science/agricultural_science.html", mainPath: ["0:5:52"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        { id: 53, label: "医学", labelEn: "Medical Science", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/applied_science/medical_science/medical_science.html", mainPath: ["0:5:53"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },

        // 深さ3
        // 数学30
        { id: 300, label: "数学用語", labelEn: "Mathematical Terms", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/mathematical_terms/mathematical_terms.html", mainPath: ["0:3:30:300"], released: 0, isPaid: 0, keywords: ["一覧"], iconClass: "fa-folder fa-fw" },
        { id: 301, label: "数学基礎論", labelEn: "Foundations of Mathematics", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/foundations_of_mathematics/foundations_of_mathematics.html", mainPath: ["0:3:30:301"], released: 1, isPaid: 1, datePublished: "2025-12-28", dateModified: "2026-01-04", description: "数学基礎論の全体像を解説。構文論と意味論、モデル理論、証明論、型理論、集合論、圏論など、現代数学の基礎を支える主要分野をPythonの実装例とともに学べる包括的な入門記事。", keywords: ["ゲーデル", "Pythonによる解説", "ヒルベルト・プログラム"], iconClass: "fa-folder fa-fw", thumbnailUrl: ["https://tatsuy-kobayashi.github.io/my-web/docs/images/image-30-120x68.png", "https://tatsuy-kobayashi.github.io/my-web/docs/images/image-30-160x90.png", "https://tatsuy-kobayashi.github.io/my-web/docs/images/image-30-320x180.png"] },
        { id: 302, label: "数論", labelEn: "Number Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/number_theory/number_theory.html", mainPath: ["0:3:30:302"], released: 1, isPaid: 0, iconClass: "fa-folder fa-fw" },
        { id: 303, label: "代数学", labelEn: "Algebra", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/algebra.html", mainPath: ["0:3:30:303"], iconClass: "fa-folder fa-fw" },
        { id: 304, label: "解析学", labelEn: "Analysis", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/analysis.html", mainPath: ["0:3:30:304"], iconClass: "fa-folder fa-fw" },
        { id: 305, label: "幾何学", labelEn: "Geometry", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/geometry/geometry.html", mainPath: ["0:3:30:305"], iconClass: "fa-folder fa-fw" },
        { id: 306, label: "離散数学", labelEn: "Discrete Mathematics", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/discrete_mathematics/discrete_mathematics.html", mainPath: ["0:3:30:306"], iconClass: "fa-folder fa-fw" },
        { id: 307, label: "確率論", labelEn: "Probability Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/probability_theory/probability_theory.html", mainPath: ["0:3:30:307"], iconClass: "fa-folder fa-fw" },
        // 物理学40
        { id: 400, label: "物理用語", labelEn: "Physical Terms", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/natural_science/physics/physical_terms/physical_terms.html", mainPath: ["0:4:40:400"], released: 0 },
        { id: 401, label: "古典物理学", labelEn: "Classical Physics", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/natural_science/physics/classical_physics/classical_physics.html", mainPath: ["0:4:40:401"], released: 0 },
        { id: 402, label: "量子物理学", labelEn: "Quantum Physics", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/natural_science/physics/quantum_physics/quantum_physics.html", mainPath: ["0:4:40:402"], released: 0 },
        { id: 403, label: "超ひも理論", labelEn: "Superstring Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/natural_science/physics/superstring_theory/superstring_theory.html", mainPath: ["0:4:40:403"], released: 0 },
        // 情報学50
        { id: 500, label: "IT用語", labelEn: "it_terms", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/applied_science/informatics/it_terms/it_terms.html", mainPath: ["0:5:50:500"], released: 1 },
        { id: 501, label: "情報理論", labelEn: "Information Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/applied_science/informatics/information_theory/information_theory.html", mainPath: ["0:5:50:501"], released: 0 },
        { id: 502, label: "計算理論", labelEn: "Theory of Computation", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/applied_science/informatics/theory_of_computation/theory_of_computation.html", mainPath: ["0:5:50:502"], released: 0 },
        { id: 503, label: "計算機科学", labelEn: "Computer Science", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/applied_science/informatics/computer_science/computer_science.html", mainPath: ["0:5:50:503"], released: 0 },
        { id: 504, label: "計算機工学", labelEn: "Computer Engineering", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/applied_science/informatics/computer_engineering/computer_engineering.html", mainPath: ["0:5:50:504"], released: 0 },
        { id: 505, label: "情報システム", labelEn: "Information System", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/applied_science/informatics/information_system/information_system.html", mainPath: ["0:5:50:505"], released: 0 }
    ];

    // 1. データの取得 (パスは実際の環境に合わせて調整してください)
    //const response = await fetch('../../../../../searchSource.json');
    //const data = await response.json();

    // ------------------------
    // データ（ノード）
    // ------------------------
    // id: ノードID
    // label: ラベル
    // labelEn: 英語ラベル
    // description: ノード説明文
    // sections: セクション配列
    // keywords: タグ配列
    // iconClass: アイコンのCSSクラス（FontAwesome等）
    // ------------------------
    console.log('[INIT] Loading searchSource...');
    const searchSource = [
        { id: 0, label: "学問", labelEn: "Academic Disciplines", description: "あらゆる事物は何かしらの学問の一領域として捉えることができる", sections: [], keywords: [], iconClass: "fa-graduation-cap" },

        // 深さ1
        { id: 1, label: "人文科学", labelEn: "Humanities", sections: [], keywords: [], iconClass: "fa-folder fa-fw" },
        { id: 2, label: "社会科学", labelEn: "Social Sciences", sections: [], keywords: [], iconClass: "fa-folder fa-fw" },
        { id: 3, label: "形式科学", labelEn: "Formal Sciences", sections: [], keywords: [], iconClass: "fa-shapes" },
        { id: 4, label: "自然科学", labelEn: "Natural Sciences", sections: [], keywords: [], iconClass: "fa-leaf" },
        { id: 5, label: "応用科学", labelEn: "Applied Sciences", sections: [], keywords: [], iconClass: "fa-folder fa-fw" },
        { id: 6, label: "学際領域", labelEn: "Interdisciplinary Fields", sections: [], keywords: [], iconClass: "fa-folder fa-fw" },

        // 深さ2
        // 人文科学1
        { id: 10, label: "哲学", labelEn: "Philosophy", sections: [], keywords: [], iconClass: "fa-folder fa-fw" },
        { id: 11, label: "芸術学", labelEn: "Art Studies", sections: [], keywords: [], iconClass: "fa-folder fa-fw" },
        /*{ id: 11, label: "宗教学", labelEn: "Religious Studies", sections: [], keywords: [] },*/
        { id: 12, label: "言語学", labelEn: "Linguistics", sections: [], keywords: [], iconClass: "fa-folder fa-fw" },
        { id: 13, label: "心理学", labelEn: "Psychology", sections: [], keywords: [], iconClass: "fa-folder fa-fw" },
        { id: 14, label: "人類学", labelEn: "Anthropology", sections: [], keywords: [], iconClass: "fa-folder fa-fw" },
        { id: 15, label: "考古学", labelEn: "Archaeology", sections: [], keywords: [], iconClass: "fa-folder fa-fw" },
        // 社会科学2
        { id: 20, label: "社会学", labelEn: "Sociology", sections: [], keywords: [], iconClass: "fa-folder fa-fw" },
        { id: 21, label: "地理学", labelEn: "Geography", sections: [], keywords: [], iconClass: "fa-folder fa-fw" },
        { id: 22, label: "歴史学", labelEn: "Historical Science", sections: [], keywords: [], iconClass: "fa-folder fa-fw" },
        { id: 23, label: "政治学", labelEn: "Political Science", sections: [], keywords: [], iconClass: "fa-folder fa-fw" },
        { id: 24, label: "経済学", labelEn: "Economics", sections: [], keywords: [], iconClass: "fa-folder fa-fw" },
        { id: 25, label: "教育学", labelEn: "Pedagogy", sections: [], keywords: [], iconClass: "fa-folder fa-fw" },
        // 形式科学3
        { id: 30, label: "数学", labelEn: "Mathematics", sections: [
            {
                h2: "数とは何か（仮）",
                text: "数は数である。1, 2, 3, 10, 42。自然数？整数？実数？よく分からないが、とりあえず数える。count, counting, カウント。数学っぽいが中身は薄い。"
            },
            {
                h2: "線形代数っぽい話",
                text: "行列Aとベクトルxについて Ax = b を考える。Aが正則でないと困る。det(A)=0 は危険。線形？非線形？ときどき曖昧。",
                math: "Ax=b, \\det(A)=0"
            },
            {
                h2: "微分積分の雰囲気",
                text: "微分すると増える。積分すると溜まる。d/dx や ∫ はよく出る記号。lim x→0 とか書きたくなるが、厳密性は気にしない。",
                math: "\\frac{d}{dx}f(x), \\int f(x)dx, \\lim_{x\\to0}"
            },
            {
                h2: "確率・統計（テスト用）",
                text: "確率は0から1まで。P(A|B) とか書く。平均、分散、標準偏差。なぜ正規分布が好きなのかは謎。",
                math: "P(A|B), \\mu, \\sigma^2"
            },
            {
                h2: "離散数学の断片",
                text: "グラフG=(V,E)。頂点と辺。木だけど森。DFS, BFS, 動的計画法？アルゴリズムと数学の境界が曖昧。",
                math: "G=(V,E)"
            },
            {
                h2: "論理記号の練習",
                text: "∀x∃y P(x,y)。真か偽か。and/or/not。∧∨¬⇒⇔。意味は深いが、ここではただ並べる。",
                math: "\\forall x \\exists y\\, P(x,y)"
            },
            {
                h2: "集合っぽい何か",
                text: "集合A⊂B⊂C。∅ は空っぽ。要素か部分集合かで混乱することがある。∈ と ⊂ は違う。",
                math: "A \\subset B, x \\in A, \\varnothing"
            },
            {
                h2: "数学とプログラミング",
                text: "for文は数学的帰納法に似ている（たぶん）。再帰、関数、型。数学なのかコードなのか分からなくなる瞬間。"
            },
            {
                h2: "意味のないテスト文章",
                text: "これは検索テスト用の文章です。数学、Math, MATH, math。123abc。正規表現.*テスト。"
            }
        ], keywords: ["学問", "数学", "情報理論", "物理学", "プログラミング", "教育"], iconClass: "fa-folder fa-fw" },
        { id: 31, label: "統計学", labelEn: "Statistics", description: "統計学とは、確率論を基盤にして、集団全体の性質を一部の標本を調べることによって推定するための処理・分析方法について研究する学問。", sections: [], keywords: [], iconClass: "fa-folder fa-fw" },
        // 自然科学4
        { id: 40, label: "物理学", labelEn: "Physics", sections: [], keywords: [], iconClass: "icon-physics" },
        { id: 41, label: "化学", labelEn: "Chemistry", sections: [], keywords: [], iconClass: "fa-folder fa-fw" },
        { id: 42, label: "生物学", labelEn: "Biology", sections: [], keywords: [], iconClass: "fa-folder fa-fw" },
        { id: 43, label: "地学", labelEn: "Earth Science", sections: [], keywords: [], iconClass: "fa-folder fa-fw" },
        // 応用科学5
        { id: 50, label: "情報学", labelEn: "Informatics", sections: [], keywords: [], iconClass: "fa-folder fa-fw" },
        { id: 51, label: "工学", labelEn: "Engineering", sections: [], keywords: [], iconClass: "fa-folder fa-fw" },
        { id: 52, label: "農学", labelEn: "Agricultural Science", sections: [], keywords: [], iconClass: "fa-folder fa-fw" },
        { id: 53, label: "医学", labelEn: "Medical Science", sections: [], keywords: [], iconClass: "fa-folder fa-fw" },

        // 深さ3
        // 数学30
        { id: 300, label: "数学用語", labelEn: "Mathematical Terms", sections: [], keywords: ["一覧"], iconClass: "fa-folder fa-fw" },
        { id: 301, label: "数学基礎論", labelEn: "Foundations of Mathematics", description: "数学基礎論の全体像を解説。構文論と意味論、モデル理論、証明論、型理論、集合論、圏論など、現代数学の基礎を支える主要分野をPythonの実装例とともに学べる包括的な入門記事。", sections: [
            {
                h2: "概要：数学を「数学」する",
                text: "&emsp;数学基礎論（Foundations of Mathematics）は、数学的な推論や証明、そして数学的構造そのものを数学的な手法を用いて研究する分野である。一般に、数学は数や図形についての真理を探究するが、論理学は「真理とは何か」「証明とは何か」というメタな問いを対象とする。&emsp;19世紀末から20世紀初頭にかけて、カントール（Cantor）による集合論の創始やパラドックスの発見を契機に、数学を厳密な基礎の上に再構築しようとする機運が高まりました。ヒルベルト（Hilbert）は、数学の無矛盾性を有限の立場から確立しようとする「ヒルベルト・プログラム」を提唱し、これが現代の証明論の源流となった。また、タルスキ（Tarski）らによる意味論の形式化はモデル理論へと発展し、ゲーデル（Gödel）の不完全性定理やチャーチ（Church）、チューリング（Turing）による計算可能性の研究と相まって、現代数学の深淵な構造を明らかにしてきた。"
            },
            {
                h2: "構文論と意味論：形式と内容の分離",
                text: "&emsp;数学基礎論において最も基本的かつ重要な視点は、構文論と意味論の区別である。構文論（Syntax）: 記号の操作や並び方に注目する立場。ここでは「証明」や「形式的推論」が扱われる。例えば、「A から B が証明可能である（A ⊢ B）」という概念は、記号変形の規則のみに基づいて定義される。意味論（Semantics）: 記号に数学的な対象（実体）を対応させ、その「真偽（truth）」を問う立場。ここでは「モデル（model）」や「充足（satisfaction）」が扱われる。例えば、「モデル M において論理式 φ が真である（M ⊨ φ）」という概念は、記号の解釈に基づいて定義される。この図は、構文論と意味論の二つの世界の関係を示したもの&emsp;ゲーデルの完全性定理（Gödel's Completeness Theorem）は、一階述語論理において、これら二つの側面が一致すること（⊢ A ⇔ ⊨ A 証明可能ならば真であり、真ならば証明可能である）を示した重要な定理である。",
                math: "A \\vdash B M \\vDash \\varphi $\\vdash A \\iff \\vDash A$",
                diagrams: "意味論Semantics構文論Syntax推論規則導出解釈充足健全性Soundness完全性Completeness論理式Formula証明Proof定理Theorem構造Structure真偽Truth ValueモデルModel"
            },
            {
                h2: "モデル理論：構造と真理の関係",
                text: "&emsp;モデル理論（Model Theory）は、形式言語の文（sentence）と、それを満たす（あるいは棄却する）構造（structure）との関係を研究する分野である。構造（Structure）: 構造 A とは、空でない集合 A（台集合、universe）と、その上の定数、関数、関係の集まりからなる。例えば、自然数全体 ℕ に、通常の 0、後者関数 s（+1 すること）、加法 +、乗法 ⋅ を備えたものは構造 (ℕ,0,s,+,⋅) である。言語 L の文 σ が構造 A で真であることを A ⊨ σ と書く。A が文の集合 T のすべてを真にするとき、A は T のモデルであるという。"
            }
        ], keywords: ["ゲーデル", "Pythonによる解説", "ヒルベルト・プログラム"], iconClass: "fa-folder fa-fw" },
        { id: 302, label: "数論", labelEn: "Number Theory", sections: [], keywords: [], iconClass: "fa-folder fa-fw" },
        { id: 303, label: "代数学", labelEn: "Algebra", sections: [], keywords: [], iconClass: "fa-folder fa-fw" },
        { id: 304, label: "解析学", labelEn: "Analysis", sections: [], keywords: [], iconClass: "fa-folder fa-fw" },
        { id: 305, label: "幾何学", labelEn: "Geometry", sections: [], keywords: [], iconClass: "fa-folder fa-fw" },
        { id: 306, label: "離散数学", labelEn: "Discrete Mathematics", sections: [], keywords: [], iconClass: "fa-folder fa-fw" },
        { id: 307, label: "確率論", labelEn: "Probability Theory", sections: [], keywords: [], iconClass: "fa-folder fa-fw" },
        // 物理学40
        { id: 400, label: "物理用語", labelEn: "Physical Terms", sections: [], keywords: [], iconClass: "fa-folder fa-fw" },
        { id: 401, label: "古典物理学", labelEn: "Classical Physics", sections: [], keywords: [], iconClass: "fa-folder fa-fw" },
        { id: 402, label: "量子物理学", labelEn: "Quantum Physics", sections: [], keywords: [], iconClass: "fa-folder fa-fw" },
        { id: 403, label: "超ひも理論", labelEn: "Superstring Theory", sections: [], keywords: [], iconClass: "fa-folder fa-fw" },
        // 情報学50
        { id: 500, label: "IT用語", labelEn: "it_terms", sections: [], keywords: [], iconClass: "fa-folder fa-fw" },
        { id: 501, label: "情報理論", labelEn: "Information Theory", sections: [], keywords: [], iconClass: "fa-folder fa-fw" },
        { id: 502, label: "計算理論", labelEn: "Theory of Computation", sections: [], keywords: [], iconClass: "fa-folder fa-fw" },
        { id: 503, label: "計算機科学", labelEn: "Computer Science", sections: [], keywords: [], iconClass: "fa-folder fa-fw" },
        { id: 504, label: "計算機工学", labelEn: "Computer Engineering", sections: [], keywords: [], iconClass: "fa-folder fa-fw" },
        { id: 505, label: "情報システム", labelEn: "Information System", sections: [], keywords: [], iconClass: "fa-folder fa-fw" }
    ];

    // 本来はここで fetch('/api/stats/popular') 等を行う
    // const ranking = await fetch('/api/popular').then(r => r.json());
    // container.innerHTML = 'Loading popular articles...';

    // ------------------------
    // データ（記事閲覧数）
    // ------------------------
    const ranking = [
        { id: 3011, label: "集合論",  url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/foundations_of_mathematics/set_theory/set_theory.html", totalViews: 90210, weeklyViews: 420, monthlyViews: 1800 },
        { id: 304022, label: "特殊関数", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/foundations_of_analysis/theory_of_functions/special_functions/special_functions.html", totalViews: 80123, weeklyViews: 380, monthlyViews: 1600 }
    ];

    // グローバル: データが持つ最大の depth（level）
    let maxAvailableLevel = 0;
    // ------------------------
    // 関数名   : vof_ensureLevelsFromPaths(nodes)
    // 名称     : paths から各ノードの level を計算
    // 内容     : nodes に含まれる mainPath を元に、各ノードの階層（level）を計算する。ノードの階層は、グラフの構造を決定づけるため、原則として mainPath に基づいて計算する
    // 引数     : nodes - ノード配列
    // 戻り値   : maxAvailableLevel (int)
    // ------------------------
    function vof_ensureLevelsFromPaths(nodes) {
        maxAvailableLevel = 0;

        for (const n of nodes) {
            // mainPath が存在しない場合は validateData で弾かれるため、ここでは安全に参照可能
            // 階層決定は mainPath を基準とする
            const paths = n.mainPath;

            if (!paths || paths.length === 0) continue;
            const depths = paths.map(p => p.split(":").length - 1);
            n.level = Math.min(...depths);       // ルートが level 0 として整合
            if (typeof n.level === 'number' && Number.isFinite(n.level)) {
                maxAvailableLevel = Math.max(maxAvailableLevel, n.level);
            }
        }
        return maxAvailableLevel;
    }

    // **
    // * カテゴリ検索結果生成関数
    // * levelが現在より下（数値が大きい）記事を表示
    // * @param {Array|Object} allData siteData.jsonの中身
    // * @param {Object} currentEntry 現在の記事データ
    //
    function renderCategorySearchResult(allData, current, maxDepth) {
        const container = document.getElementById('category-list');
        if (!container) return;

        // siteData（allData）から子孫を取得する。
        // current.dir_path に依存せず mainPath を用いた抽出に委ねる。
        if (!Array.isArray(allData)) {
            try {
                allData = Object.values(allData);
            } catch (e) {
                allData = [];
            }
        }
        console.log('siteData')

        // mainPath を使って現在ノードの下位（descendant）を階層的に表示する実装
        const getFirstPath = (node) => {
            if (!node) return '';
            if (Array.isArray(node.mainPath) && node.mainPath.length > 0) return node.mainPath[0];
            if (typeof node.mainPath === 'string') return node.mainPath;
            return '';
        };

        const currentPath = getFirstPath(current);
        if (!currentPath) return;

        // currentPath の下位にあるノードを descendants として抽出
        const descendants = allData.filter(item => {
            const mps = Array.isArray(item.mainPath) ? item.mainPath : [item.mainPath];
            return mps.some(mp => typeof mp === 'string' && mp.startsWith(currentPath + ':'));
        });

        const currentId = current && current.id;
        // map: key=node.id -> { node, matchedAuxPaths: [], matchedPenultimateIds: Set }
        const auxMatchesMap = new Map();
        if (currentId != null) {
            allData.forEach(item => {
                if (!item || !item.auxPath) return;
                const auxArr = Array.isArray(item.auxPath) ? item.auxPath : [item.auxPath];
                auxArr.forEach(ap => {
                    if (typeof ap !== 'string') return;
                    // 数値配列化
                    const parts = ap.split(':').map(s => parseInt(s.trim(), 10)).filter(n => Number.isFinite(n));
                    if (parts.length === 0) return;
                    // currentId を含む auxPath のみ扱う
                    if (!parts.includes(currentId)) return;
                    // penultimate を抽出（length>=2 でなければ無視）
                    const penultimate = parts.length >= 2 ? parts[parts.length - 2] : null;
                    if (!auxMatchesMap.has(item.id)) {
                        auxMatchesMap.set(item.id, { node: item, matchedAuxPaths: [], matchedPenultimateIds: new Set() });
                    }
                    const entry = auxMatchesMap.get(item.id);
                    entry.matchedAuxPaths.push(ap);
                    if (Number.isFinite(penultimate)) entry.matchedPenultimateIds.add(penultimate);
                });
            });
        }
        // auxMatchesMap を配列化（必要に応じて descendants と併合して扱う）
        const auxMatches = Array.from(auxMatchesMap.values());
        console.log('auxMatches:', auxMatches);

        // parentId -> [ { tailId, node }, ... ] 形式に変換しておく
        const auxInsertionsByParent = new Map();
        auxMatchesMap.forEach(({ node, matchedAuxPaths }) => {
            if (!Array.isArray(matchedAuxPaths)) return;
            matchedAuxPaths.forEach(ap => {
                if (typeof ap !== 'string') return;
                const parts = ap.split(':').map(s => parseInt(s.trim(), 10)).filter(n => Number.isFinite(n));
                if (parts.length < 2) return; // penultimate + tail が必要
                const penultimate = parts[parts.length - 2];
                const tail = parts[parts.length - 1];
                if (!Number.isFinite(penultimate) || !Number.isFinite(tail)) return;
                const arr = auxInsertionsByParent.get(penultimate) || [];
                arr.push({ tailId: tail, node });
                auxInsertionsByParent.set(penultimate, arr);
            });
        });

        if (!descendants || descendants.length === 0) return;

        // parentPath の直下だけを返す（直下の子）
        const immediateChildrenOf = (parentPath) => {
            const parentParts = parentPath.split(':').filter(Boolean);
            const results = [];
            descendants.forEach(item => {
                const mps = Array.isArray(item.mainPath) ? item.mainPath : [item.mainPath];
                mps.forEach(mp => {
                    if (typeof mp !== 'string') return;
                    if (!mp.startsWith(parentPath + ':')) return;
                    const parts = mp.split(':').filter(Boolean);
                    if (parts.length === parentParts.length + 1) {
                        if (!results.find(r => r.id === item.id)) {
                            results.push(item);
                        }
                    }
                });
            });

            // --- auxPath による挿入: auxMatchesMap から parentPath の最後の ID を親として参照するものを追加 ---
            const parentId = parseInt(parentParts[parentParts.length - 1], 10);
            if (!Number.isNaN(parentId)) {
                const insertions = auxInsertionsByParent.get(parentId);
                if (Array.isArray(insertions) && insertions.length > 0) {
                    insertions.forEach(({ tailId, node }) => {
                        // 重複挿入を避ける:
                        const exists = results.some(r => {
                            // 既に同ノードを mainPath として追加済み（同じ実ノードID）ならスキップ
                            if (!r.__isAux && r.id === node.id) return true;
                            // 既に同じ aux 挿入（同じ元ノード & tail）を追加済みならスキップ
                            if (r.__isAux && r.__auxOriginalId === node.id && r.__auxTailId === tailId) return true;
                            return false;
                        });
                        if (!exists) {
                            // 合成オブジェクト: ソートキーとして __auxTailId を持たせる（id は変更しない）
                            const synthetic = Object.assign({}, node, {
                                __isAux: true,
                                __auxOriginalId: node.id,
                                __auxTailId: tailId
                            });
                            results.push(synthetic);
                        }
                    });
                }
            }
            // ソート: aux 挿入ノードは __auxTailId を優先キーとする。なければ mainPath の末尾ID、最後に node.id。
            const getSortKey = (item) => {
                if (item && Number.isFinite(item.__auxTailId)) return item.__auxTailId;
                const p = getFirstPath(item) || '';
                if (p) {
                    const last = parseInt(p.split(':').pop(), 10);
                    if (Number.isFinite(last)) return last;
                }
                return (item && Number.isFinite(item.id)) ? item.id : 0;
            };
            results.sort((a, b) => getSortKey(a) - getSortKey(b));
            return results;
        };

        // preview-link 構造に合わせた HTML を作るヘルパ
        const makePreviewHtml = (node) => {
            if (Number(node.released) === 1) {
                const desc = node.description || '説明はありません。';
                const img = node.imageUrl || '';
                let s = `<div class="link-container">`;
                s += `<a href="${node.url}" class="preview-link" data-title="${(node.label||'').replace(/\"/g,'&quot;')}" data-description="${(desc||'').replace(/\"/g,'&quot;')}" data-image="${img}">${node.label}</a>`;
                s += `<div class="link-preview">`;
                s += `<a href="${node.url}" class="link-preview-clickable">`;
                if (img) s += `<img class="preview-image" src="${img}" alt="Preview image">`;
                else s += `<img class="preview-image" src="" alt="Preview image" style="display:none;">`;
                s += `<h3 class="preview-title">${node.label}</h3>`;
                s += `<p class="preview-description">${desc}</p>`;
                s += `</a>`;
                s += `</div>`;
                s += `</div>`;
                return s;
            } else {
                return `${node.label}`;
            }
        };

        // 再帰的にリストを構築
        const buildList = (parentPath, depth = 0, maxDepth) => {
            const children = immediateChildrenOf(parentPath);
            if (!children || children.length === 0) return '';
            let out = '';
            children.forEach(child => {
                const childPath = getFirstPath(child);
                const hasDesc = descendants.some(d => {
                    const dps = Array.isArray(d.mainPath) ? d.mainPath : [d.mainPath];
                    return dps.some(mp => typeof mp === 'string' && mp.startsWith(childPath + ':'));
                });
                out += '<li class="li_pulldownList">';
                // 深い子を持つ場合または現在ノードの直下の子（parentPath === currentPath）の場合は
                // <details><summary> でラップする。ただし内部リストは存在する場合のみ追加する。
                if ((hasDesc || parentPath === currentPath) && depth < maxDepth) {
                    out += '<details class="details_pulldownList">';
                    out += `<summary class="summary_pulldownList">${makePreviewHtml(child)}</summary>`;
                    const inner = buildList(childPath, depth + 1, maxDepth);
                    if (inner) out += inner;
                    out += '</details>';
                } else {
                    out += makePreviewHtml(child);
                }
                out += '</li>';
            });
            return out;
        };

        let html = '<ul class="ul_pulldownList">';
        html += buildList(currentPath, 0, maxDepth);
        html += '</ul> <!-- /.ul_pulldownList -->';

        container.innerHTML = html;
    }

    function renderTagList(allData) {
        const container = document.getElementById('tagsList');
        if (!container) return;

        // allData を配列に統一
        if (!Array.isArray(allData)) {
            try {
                allData = Object.values(allData);
            } catch (e) {
                allData = [];
            }
        }
        // キーワードをプール（重複除去）
        const pool = new Set();
        allData.forEach(item => {
            if (!item) return;
            const kws = Array.isArray(item.keywords) ? item.keywords : [];
            kws.forEach(k => {
                if (k == null) return;
                const s = String(k).trim();
                if (s) pool.add(s);
            });
        });

        const tags = Array.from(pool);
        if (tags.length === 0) {
            container.innerHTML = '';
            return;
        }

        // 文字コード順（UTF-16 code unit）で辞書順ソート
        tags.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));

        // HTML 生成
        let html = '';
        const escapeHtml = (str) => String(str).replace(/[&<>"]+/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]||ch));
        tags.forEach((tag, idx) => {
            html += `<span class="tag-label" data-index="${idx}">`;
            html += `<a href="#" class="tag-search-link" data-tag="${escapeHtml(tag)}" title="タグ: ${escapeHtml(tag)}"><span class="tag-label-text"># ${String(tag)}</span></a>`;
            html += `</span>`;
        });

        container.innerHTML = html;

        // タグ検索のイベントハンドラ
        const tagLinks = container.querySelectorAll('.tag-search-link');
        tagLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const tag = link.getAttribute('data-tag');
                performTagSearch(tag, searchSource);
            });
        });
    }

    // アイコン検索
    function renderIconBtnList(allData) {
        const container = document.getElementById('iconBtnList');
        if (!container) return;

        // allData を配列に統一
        if (!Array.isArray(allData)) {
            try {
                allData = Object.values(allData);
            } catch (e) {
                allData = [];
            }
        }

        // iconClass を集める（文字列または配列に対応）
        const pool = new Set();
        allData.forEach(item => {
            if (!item || item.iconClass == null) return;
            if (Array.isArray(item.iconClass)) {
                item.iconClass.forEach(ic => {
                    if (ic == null) return;
                    const s = String(ic).trim();
                    if (s) pool.add(s);
                });
            } else if (typeof item.iconClass === 'string') {
                const s = item.iconClass.trim();
                if (s) pool.add(s);
            } else {
                // その他の型（例: オブジェクト等）は無視
            }
        });

        const icons = Array.from(pool);
        console.log('iconClass array created:', icons);
        if (icons.length === 0) {
            container.innerHTML = '';
            return;
        }

        // 文字コード順（UTF-16 code unit）で辞書順ソート
        icons.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));

        // HTML 生成
        let html = '<span class="icon-label" data-index="home"><a href="https://tatsuy-kobayashi.github.io/my-web/docs/"><span class="icon-label-content"><i class="fa fa-home fa-fw" aria-hidden="true"></i></span></a></span>';
        const escapeHtml = (str) => String(str).replace(/[&<>"]+/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]||ch));
        icons.forEach((icon, idx) => {
            html += `<span class="icon-label" data-index="${idx}">`;
            html += `<a href="#" class="icon-search-link" data-icon="${escapeHtml(icon)}" title="アイコン: ${escapeHtml(icon)}">`;
            html += `<span class="icon-label-content"><i class="fa ${String(icon)}"></i></span>`;
            html += `</a>`;
            html += `</span>`;
        });

        container.innerHTML = html;

        // アイコン検索のイベントハンドラ
        const iconLinks = container.querySelectorAll('.icon-search-link');
        iconLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const iconClass = link.getAttribute('data-icon');
                performIconSearch(iconClass, searchSource);
            });
        });
    }

    // ------------------------
    // DOM要素参照（安全に取得）
    // ------------------------
    function $id(id) {
        const el = document.getElementById(id);
        if (!el) console.warn(`[WARN] DOM element not found: #${id}`);
        return el;
    }

    const dom = {
        contentIntegSearch: $id('contentIntegSearch'),
        contentIntegSearchResult: $id('contentIntegSearchResult')
    };

    // DOM 要素が揃っているか簡易チェック
    if (!dom.contentIntegSearch || !dom.contentIntegSearchResult) {
        console.error('[ERROR] 必要な DOM 要素が見つかりません。処理を中止します。');
        errorFlags.missingDom = true;
        currentState = STATE.ERROR;
        return;
    }

    // ------------------------
    // 関数名   : buildEdgesFromPaths(filteredNodes)
    // 名称     : paths からエッジ情報を生成する処理
    // 内容     : filteredNodes に含まれる paths を元に、エッジ情報を生成する
    // 引数     : filteredNodes - ユーザ操作で選択されたノード配列
    // 戻り値   : edges - 生成されたエッジ配列
    // ------------------------
    function buildEdgesFromPaths(filteredNodes) {
        const visible = new Set(filteredNodes.map(n => n.id));
        const edges = [];
        const dedup = new Set();

        for (const n of filteredNodes) {
            const paths = n.mainPath || [];
            for (const pathStr of paths) {
                const parts = pathStr.split(":").map(Number);

                // 末尾が自身のIDで終わっているか（データ健全性チェック）
                // if (parts[parts.length - 1] !== n.id) continue;

                for (let i = 0; i < parts.length - 1; i++) {
                    const from = parts[i];
                    const to   = parts[i + 1];
                    // 可視ノード同士のみエッジを張る
                    if (!visible.has(from) || !visible.has(to)) continue;

                    const key = `${from}->${to}`;
                    if (!dedup.has(key)) {
                        dedup.add(key);
                        edges.push({ from, to });
                    }
                }
            }
        }
        return edges;
    }

    // ------------------------
    // vis-network 管理（初回生成は1度だけ）
    // ------------------------
    let network = null; // vis-network インスタンス
    let networkInitialized = false; // 初期化済みフラグを失敗で初期化

    // ------------------------
    // 関数名   : searchContentInit()
    // 名称     : 高度な検索機能ページの初期化
    // 内容     : 高度な検索機能用の HTML コンテンツを読み込み、初期化を行う
    // 引数     : void
    // 戻り値   : Promise<boolean> - 成功なら true、失敗なら false
    // ------------------------
    async function searchContentInit() {
        currentState = STATE.DATA_INITIALIZATION;
        console.log('[STATE] SEARCH_CONTENT_INITIALIZATION');

        const containerSearch = document.getElementById('contentIntegSearch');
        if (!containerSearch) return;
        const containerResult = document.getElementById('contentIntegSearchResult');
        if (!containerResult) return;

        try {
            // resultコンテナをクリア
            containerResult.style.display = 'none';
            containerResult.innerHTML = '';
            console.log('[INIT] contentIntegSearchResult cleared');

            // 挿入後のDOM初期化（目次トグルなど）
            initializeSearchUI();

            return true;
        } catch (error) {
            console.error('[ERROR] searchContentInit failed:', error);
            containerSearch.innerHTML = '<p style="color: red;">検索機能の読み込みに失敗しました。</p>';
            errorFlags.networkInitFailed = true;
            currentState = STATE.ERROR;
            return false;
        }
    }

    // ------------------------
    // 関数名   : initializeSearchUI()
    // 名称     : 検索UI要素の初期化
    // 内容     : HTML挿入後のUIイベントハンドラを設定
    // 引数     : void
    // 戻り値   : void
    // ------------------------
    function initializeSearchUI() {
        console.log('[UI] Initializing search UI...');

        // searchContentInit() で HTML を挿入済みであれば #network は存在する想定
        dom.networkContainer = dom.networkContainer || document.getElementById('network') || (dom.contentIntegSearch && dom.contentIntegSearch.querySelector('#network'));
        if (!dom.networkContainer) {
            console.error('[ERROR] network container (#network) not found. vis.Network を初期化できません。');
            errorFlags.missingDom = true;
            currentState = STATE.ERROR;
            return false;
        }

        // 目次トグル機能
        initializeTocToggle();

        const useId = 0;
        const useNode = siteData.find(n => n.useId === 0 || siteData[0]);
        console.log('Current node:', useNode);

        if (!useNode) {
            console.warn('Current node not found in siteData.');
            return;
        }

        const computedMax = vof_ensureLevelsFromPaths(siteData);
        // カテゴリ検索
        renderCategorySearchResult(siteData, useNode, computedMax);
        // タグ検索
        renderTagList(searchSource);
        // アイコン検索
        renderIconBtnList(searchSource);

        // サイト圏図式（動的グラフ）
        if (networkInitialized) return true;
        if (typeof vis === 'undefined' || !vis.Network) {
            console.error('[ERROR] vis-network が読み込まれていません。');
            errorFlags.visNotAvailable = true;
            currentState = STATE.ERROR;
            return false;
        }

        try {
            const nodes = new vis.DataSet([]); // 空で初期化
            const edges = new vis.DataSet([]);
            const data = { nodes, edges };
            const options = {
                layout: { hierarchical: false },
                physics: { enabled: true, solver: "forceAtlas2Based", forceAtlas2Based: { gravitationalConstant: -40, springLength: 60, springConstant: 0.2 }, stabilization: { enabled: true, iterations: 200 } },
                interaction: { hover: true, zoomView: true },
                edges: { arrows: "to", smooth: { enabled: false } }
            };

            network = new vis.Network(dom.networkContainer, data, options);
            networkInitialized = true;
            console.log('[NETWORK] vis.Network 初期化完了');
        } catch (e) {
            console.error('[ERROR] network 初期化に失敗しました:', e);
            errorFlags.networkInitFailed = true;
            currentState = STATE.ERROR;
            return false;
        }

        // ========================
        // 単純文字列検索のイベントハンドラ設定
        // ========================
        const substringInput = document.getElementById('labelSubstringSearchInput');
        const substringBtn = document.getElementById('labelSubstringSearchBtn');

        if (substringInput && substringBtn) {
            // クリックイベント：検索ボタン
            substringBtn.addEventListener('click', () => {
                console.log('[UI] Substring search button clicked');
                inputSubstringReceive();
            });

            // エンターキーでも検索実行
            substringInput.addEventListener('keypress', (event) => {
                if (event.key === 'Enter') {
                    console.log('[UI] Substring search Enter key pressed');
                    inputSubstringReceive();
                }
            });

            // オプション：入力中にリアルタイム判定（デバッグ用）
            substringInput.addEventListener('input', (event) => {
                const input = event.target.value;
                const analysisResult = determineInputType(input);
                console.log('[UI] Real-time input analysis:', analysisResult.type);
                // 必要に応じてUIに反映
            });

            console.log('[UI] Substring search event handlers attached');
        } else {
            console.warn('[UI] Substring search input or button element not found');
        }

        console.log('[UI] Search UI initialization complete');
        return true;
    }

    function initializeTocToggle() {

        // 目次のコンテナ
        const tocContent = document.querySelector('.toc-content');
        if (!tocContent) {
            console.warn('[TOC] #toc not found');
            return;
        }

        // トグルボタン
        const toggleButton = document.querySelector('.toc-toggle-button');
        if (!toggleButton) {
            console.warn('[TOC] #toc-toggle not found');
            return;
        }

        // 初期状態
        tocContent.dataset.open = 'true';

        // クリックイベント
        toggleButton.addEventListener('click', () => {
            if (tocContent.style.display === 'none' || tocContent.style.display === '') {
                tocContent.style.display = 'block';
                toggleButton.textContent = '隠す';
            } else {
                tocContent.style.display = 'none';
                toggleButton.textContent = '表示';
            }

            console.log('[TOC] toggled.');
        });
    }

    // ------------------------
    // STATE 1: DATA_INITIALIZATION
    // （ここでは簡単なバリデーションを行う）
    // ------------------------
    function validateData() {
        currentState = STATE.DATA_INITIALIZATION;
        console.log('[STATE] DATA_INITIALIZATION');

        // ノード id 重複チェック
        const ids = new Set();
        for (const n of siteData) {
            if (ids.has(n.id)) {
                console.error('[ERROR] siteData に重複 id が存在します:', n.id);
                errorFlags.invalidData = true;
            }
            ids.add(n.id);
        }

        // エッジの参照チェックpaths の整合チェック: 各 path の各要素が存在するか、および path の末尾が自身の id であるか
        for (const n of siteData) {
            if (!n.mainPath) continue;
            for (const p of n.mainPath) {
                const parts = p.split(':').map(Number);
                if (parts[parts.length - 1] !== n.id) {
                    console.error('[ERROR] paths の末尾が node.id と一致しません:', n.id, p);
                    errorFlags.invalidData = true;
                    continue;
                }
                for (const pid of parts) {
                    if (!ids.has(pid)) {
                        console.error('[ERROR] paths が存在しないノードを参照しています:', p, 'missing:', pid);
                        errorFlags.invalidData = true;
                    }
                }
            }
        }

        if (errorFlags.invalidData) {
            currentState = STATE.ERROR;
            return false;
        }

        // 2層までを表示
        const maxis2 = 2;
        maxAvailableLevel = (typeof maxis2 === 'number' && Number.isFinite(maxis2)) ? maxis2 : 0;
        console.log('[DATA] computed maxAvailableLevel =', maxAvailableLevel);

        return true;
    }

    // ------------------------
    // STATE 2: NETWORK_INITIALIZATION
    // ------------------------
    function initializeNetwork() {
        currentState = STATE.NETWORK_INITIALIZATION;
        console.log('[STATE] NETWORK_INITIALIZATION');

        // 初回描画：デフォルト（min/max）による描画をしないで空で開始することも選べる
        // 今は初期値を用いて描画
        currentState = STATE.SEARCHING;

        let min = 0;
        let max = maxAvailableLevel;

        // filter nodes and edges
        const filteredNodes = siteData.filter(n => (typeof n.level === 'number') && n.level >= min && n.level <= max);
        const filteredEdges = buildEdgesFromPaths(filteredNodes);
        console.log('[NETWORK] Initial filtered edges:', filteredEdges.length);

        if (!initializeSearchUI()) return;
        try {
            const nodes = new vis.DataSet(filteredNodes);
            const edges = new vis.DataSet(filteredEdges);
            network.setData({ nodes, edges });
            console.log('[NETWORK] setData 実行: nodes=', filteredNodes.length, 'edges=', filteredEdges.length);
        } catch (e) {
            console.error('[ERROR] setNetworkData 失敗:', e);
        }

        currentState = STATE.IDLE;
        console.log('[SEARCH] performDepthSearch done');

        return true;
    }

    // ========================
    // 検索入力方式判定機能
    // ========================

    /**
     * 入力方式の定義
     */
    const SEARCH_INPUT_TYPES = {
        PLAIN_TEXT: 'plainText',           // 平文検索
        LOGICAL_OPERATORS: 'logicalOps',   // AND/OR/NOT演算子検索
        REGEX: 'regex',                    // 正規表現検索
        UNKNOWN: 'unknown'                 // 未判定
    };

    /**
     * 関数名   : determineInputType()
     * 名称     : 検索入力の方式を判定
     * 内容     : ユーザー入力を解析し、どの検索方式かを判定
     *          1. 正規表現（/.../ または /.../(flags)）
     *          2. 論理演算子（AND, OR, NOT キーワード）
     *          3. 平文（その他）
     * 引数     : query (string) - ユーザーの入力文字列
     * 戻り値   : object
     *           {
     *             type: SEARCH_INPUT_TYPES のいずれか
     *             original: 元の入力文字列
     *             normalized: 処理用に正規化された値
     *             isValid: パース可能か（特に正規表現）
     *             error: エラーメッセージ（あれば）
     *           }
     * ========================
     */
    function determineInputType(query) {
        if (!query || typeof query !== 'string') {
            return {
                type: SEARCH_INPUT_TYPES.UNKNOWN,
                original: query,
                normalized: '',
                isValid: false,
                error: '入力が空です'
            };
        }

        const trimmed = query.trim();

        // 1. 正規表現判定: /.../ または /.../(flags) の形式
        const regexPattern = /^\/(.*)\/([a-zA-Z]*)$/;
        const regexMatch = trimmed.match(regexPattern);

        if (regexMatch) {
            const pattern = regexMatch[1];
            const flags = regexMatch[2] || '';

            try {
                // 正規表現として有効か検証
                new RegExp(pattern, flags);
                return {
                    type: SEARCH_INPUT_TYPES.REGEX,
                    original: trimmed,
                    normalized: {
                        pattern: pattern,
                        flags: flags,
                        regexStr: trimmed
                    },
                    isValid: true,
                    error: null
                };
            } catch (e) {
                return {
                    type: SEARCH_INPUT_TYPES.REGEX,
                    original: trimmed,
                    normalized: { pattern: pattern, flags: flags },
                    isValid: false,
                    error: '正規表現のパースに失敗しました: ' + e.message
                };
            }
        }

        // 2. 論理演算子判定: AND, OR, NOT キーワードを含むか
        // 複数単語が AND/OR/NOT でつなげられているか判定
        const logicalOpPattern = /\b(AND|OR|NOT)\b/gi;
        const hasLogicalOps = logicalOpPattern.test(trimmed);

        if (hasLogicalOps) {
            // 論理演算子を検出
            return {
                type: SEARCH_INPUT_TYPES.LOGICAL_OPERATORS,
                original: trimmed,
                normalized: parseLogicalOperators(trimmed),
                isValid: true,
                error: null
            };
        }

        // 3. デフォルト：平文検索
        return {
            type: SEARCH_INPUT_TYPES.PLAIN_TEXT,
            original: trimmed,
            normalized: trimmed,
            isValid: true,
            error: null
        };
    }

    /**
     * 関数名   : parseLogicalOperators()
     * 名称     : 論理演算子の解析
     * 内容     : AND/OR/NOT を含むクエリを構文木に解析
     * 引数     : query (string) - 論理演算子を含むクエリ文字列
     * 戻り値   : object - パース結果
     *           {
     *             type: 'and' | 'or' | 'not' | 'term'
     *             value: 単語（type='term'の場合）
     *             operands: 子要素配列（複合演算の場合）
     *           }
     * 注記     : 簡易実装。複雑な式はサポートしていない
     * ========================
     */
    function parseLogicalOperators(query) {
        // スペースで分割し、AND/OR/NOT とそれ以外を分離
        const tokens = query.trim().split(/\s+/);
        const result = {
            type: 'expression',
            operands: [],
            operators: []
        };

        let currentTerm = [];

        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i].toUpperCase();

            if (token === 'AND' || token === 'OR' || token === 'NOT') {
                // 演算子直前の単語をtermsに追加
                if (currentTerm.length > 0) {
                    result.operands.push({
                        type: 'term',
                        value: currentTerm.join(' ')
                    });
                    currentTerm = [];
                }
                // 演算子を記録
                result.operators.push(token.toLowerCase());
            } else {
                // 通常の単語
                currentTerm.push(tokens[i]);
            }
        }

        // 最後の単語を追加
        if (currentTerm.length > 0) {
            result.operands.push({
                type: 'term',
                value: currentTerm.join(' ')
            });
        }

        return result;
    }

    /**
     * 関数名   : inputSubstringReceive()
     * 名称     : 単純文字列検索入力を受け取る
     * 内容     : #labelSubstringSearchInput からユーザー入力を取得し、
     *          入力方式を判定して処理を分岐
     * 引数     : void
     * 戻り値   : boolean - 処理が正常に進行したか
     * ========================
     */
    function inputSubstringReceive() {
        const inputElement = document.getElementById('labelSubstringSearchInput');

        if (!inputElement) {
            console.error('[SEARCH] labelSubstringSearchInput element not found');
            return false;
        }

        const userInput = inputElement.value;
        console.log('[SEARCH] inputSubstringReceive called with input:', userInput);

        // 入力方式を判定
        const analysisResult = determineInputType(userInput);
        console.log('[SEARCH] Input type analysis:', analysisResult);

        if (!analysisResult.isValid) {
            console.warn('[SEARCH] Invalid input:', analysisResult.error);
            alert('入力エラー: ' + analysisResult.error);
            return false;
        }

        // 入力方式に応じた処理を分岐
        switch (analysisResult.type) {
            case SEARCH_INPUT_TYPES.PLAIN_TEXT:
                console.log('[SEARCH] Plain text search mode');
                return performPlainTextSearch(analysisResult.normalized, searchSource);

            case SEARCH_INPUT_TYPES.LOGICAL_OPERATORS:
                console.log('[SEARCH] Logical operators search mode');
                return performLogicalOperatorsSearch(analysisResult.normalized, searchSource);

            case SEARCH_INPUT_TYPES.REGEX:
                console.log('[SEARCH] Regex search mode');
                return performRegexSearch(analysisResult.normalized, searchSource);

            default:
                console.warn('[SEARCH] Unknown input type');
                return false;
        }
    }

    /**
     * 関数名   : performPlainTextSearch()
     * 名称     : 平文検索の実行
     * 内容     : 指定された文字列をsearchSourceから検索
     * 引数     : searchQuery (string) - 検索文字列
     *          source (array) - 検索対象データ
     * 戻り値   : boolean
     * ========================
     */
    function performPlainTextSearch(searchQuery, source) {
        console.log('[SEARCH] Performing plain text search for:', searchQuery);

        const results = [];
        const queryLower = searchQuery.toLowerCase();

        for (const item of source) {
            let matches = false;

            // label, labelEn をチェック
            if (item.label && item.label.toLowerCase().includes(queryLower)) {
                matches = true;
            } else if (item.labelEn && item.labelEn.toLowerCase().includes(queryLower)) {
                matches = true;
            }

            // sections 内をチェック
            if (!matches && item.sections && Array.isArray(item.sections)) {
                for (const section of item.sections) {
                    const sectionText = (section.h2 || '') + ' ' + (section.text || '');
                    if (sectionText.toLowerCase().includes(queryLower)) {
                        matches = true;
                        break;
                    }
                }
            }

            if (matches) {
                results.push(item);
            }
        }

        console.log('[SEARCH] Plain text search results count:', results.length);
        showSearchResultsWithFragment(results, { type: SEARCH_INPUT_TYPES.PLAIN_TEXT, original: searchQuery, normalized: searchQuery });
        return true;
    }

    /**
     * 関数名   : performLogicalOperatorsSearch()
     * 名称     : 論理演算子検索の実行
     * 内容     : AND/OR/NOT を含むクエリで検索
     * 引数     : parsedQuery (object) - parseLogicalOperatorsの戻り値
     *          source (array) - 検索対象データ
     * 戻り値   : boolean
     * ========================
     */
    function performLogicalOperatorsSearch(parsedQuery, source) {
        console.log('[SEARCH] Performing logical operators search:', parsedQuery);

        const results = [];

        for (const item of source) {
            if (evaluateLogicalExpression(item, parsedQuery)) {
                results.push(item);
            }
        }

        console.log('[SEARCH] Logical search results count:', results.length);
        showSearchResultsWithFragment(results, parsedQuery);
        return true;
    }

    /**
     * 関数名   : evaluateLogicalExpression()
     * 名称     : 論理式の評価
     * 内容     : 単一アイテムが論理式にマッチするか判定
     * 引数     : item (object) - searchSourceの1要素
     *          expression (object) - パース済み論理式
     * 戻り値   : boolean
     * ========================
     */
    function evaluateLogicalExpression(item, expression) {
        if (!expression.operands || expression.operands.length === 0) {
            return false;
        }

        const itemText = (
            (item.label || '') + ' ' +
            (item.labelEn || '') + ' ' +
            (item.sections ? item.sections.map(s => (s.h2 || '') + ' ' + (s.text || '')).join(' ') : '')
        ).toLowerCase();

        // 各operandがマッチするか判定
        const matches = expression.operands.map(operand => {
            if (operand.type === 'term') {
                return itemText.includes(operand.value.toLowerCase());
            }
            return false;
        });

        // operatorsに基づいて結果を結合
        let result = matches[0];
        for (let i = 0; i < expression.operators.length; i++) {
            const op = expression.operators[i];
            const nextMatch = matches[i + 1];

            if (op === 'and') {
                result = result && nextMatch;
            } else if (op === 'or') {
                result = result || nextMatch;
            }
        }

        // NOTの処理（簡易版）
        // NOT が先頭にある場合は結果を反転
        if (expression.operators.length > 0 && expression.operators[0] === 'not') {
            result = !result;
        }

        return result;
    }

    /**
     * 関数名   : performRegexSearch()
     * 名称     : 正規表現検索の実行
     * 内容     : 正規表現パターンでsearchSourceを検索
     * 引数     : regexInfo (object) - { pattern, flags }
     *          source (array) - 検索対象データ
     * 戻り値   : boolean
     * ========================
     */
    function performRegexSearch(regexInfo, source) {
        console.log('[SEARCH] Performing regex search:', regexInfo);

        const regex = new RegExp(regexInfo.pattern, regexInfo.flags);
        const results = [];

        for (const item of source) {
            let matches = false;

            // label, labelEn をテスト
            if ((item.label && regex.test(item.label)) ||
                (item.labelEn && regex.test(item.labelEn))) {
                matches = true;
            }

            // sections 内をテスト
            if (!matches && item.sections && Array.isArray(item.sections)) {
                for (const section of item.sections) {
                    const sectionText = (section.h2 || '') + ' ' + (section.text || '');
                    if (regex.test(sectionText)) {
                        matches = true;
                        break;
                    }
                }
            }

            if (matches) {
                results.push(item);
            }
        }

        console.log('[SEARCH] Regex search results count:', results.length);
        showSearchResultsWithFragment(results, { type: SEARCH_INPUT_TYPES.REGEX, original: regexInfo.regexStr || (regexInfo.pattern || ''), normalized: regexInfo });
        return true;
    }

    /**
     * 関数名   : performTagSearch()
     * 名称     : タグ検索の実行
     * 内容     : 指定されたタグを持つアイテムを検索
     * 引数     : tag (string) - 検索対象タグ
     *          source (array) - 検索対象データ
     * 戻り値   : boolean
     * ========================
     */
    function performTagSearch(tag, source) {
        console.log('[SEARCH] Performing tag search for:', tag);

        const results = [];

        for (const item of source) {
            if (!item.keywords) continue;
            const keywords = Array.isArray(item.keywords) ? item.keywords : [item.keywords];
            for (const kw of keywords) {
                if (String(kw).trim() === String(tag).trim()) {
                    results.push(item);
                    break;
                }
            }
        }

        console.log('[SEARCH] Tag search results count:', results.length);
        showSearchResultsWithFragment(results, { type: 'tag', original: tag, normalized: tag });
        return true;
    }

    /**
     * 関数名   : performIconSearch()
     * 名称     : アイコン検索の実行
     * 内容     : 指定されたアイコンクラスを持つアイテムを検索
     * 引数     : iconClass (string) - 検索対象アイコンクラス
     *          source (array) - 検索対象データ
     * 戻り値   : boolean
     * ========================
     */
    function performIconSearch(iconClass, source) {
        console.log('[SEARCH] Performing icon search for:', iconClass);

        const results = [];

        for (const item of source) {
            if (!item.iconClass) continue;
            const icons = Array.isArray(item.iconClass) ? item.iconClass : [item.iconClass];
            for (const ic of icons) {
                if (String(ic).trim() === String(iconClass).trim()) {
                    results.push(item);
                    break;
                }
            }
        }

        console.log('[SEARCH] Icon search results count:', results.length);
        showSearchResultsWithFragment(results, { type: 'icon', original: iconClass, normalized: iconClass });
        return true;
    }

    // ========================
    // フラグメント生成と結果表示（URLフラグメントを付与）
    // ========================

    function djb2Hash(str) {
        let h = 5381;
        for (let i = 0; i < str.length; i++) {
            h = ((h << 5) + h) + str.charCodeAt(i);
            // keep in 32-bit int range
            h = h & 0xFFFFFFFF;
        }
        return (h >>> 0).toString(16);
    }

    function generateSearchFragment(queryInfo) {
        const base = (typeof queryInfo === 'string') ? queryInfo : (queryInfo.original || queryInfo.query || '');
        const normalized = queryInfo && queryInfo.normalized ? queryInfo.normalized : '';
        const payload = String(base) + '|' + (queryInfo && queryInfo.type ? queryInfo.type : '') + '|' + JSON.stringify(normalized);
        const hash = djb2Hash(payload);
        const ts = Date.now();
        const frag = 'q=' + encodeURIComponent(String(base)) + '&type=' + encodeURIComponent(queryInfo && queryInfo.type ? queryInfo.type : '') + '&h=' + hash + '&ts=' + ts;
        return frag;
    }

    function showSearchResultsWithFragment(results, queryInfo) {
        // 一意なフラグメントを生成
        const fragment = generateSearchFragment(queryInfo || {});

        // URL を更新（ハッシュ）
        try {
            const newUrl = location.pathname + '#' + fragment;
            history.pushState(null, '', newUrl);
        } catch (e) {
            // fallback
            location.hash = fragment;
        }

        // 検索画面を隠して、結果コンテナを表示
        try {
            const searchPanel = document.getElementById('contentIntegSearch');
            if (searchPanel) searchPanel.style.display = 'none';
        } catch (e) { /* ignore */ }

        try {
            const resultContainer = document.getElementById('contentIntegSearchResult');
            if (resultContainer) resultContainer.style.display = 'block';
        } catch (e) { /* ignore */ }

        // queryInfo に fragment を付与して表示に渡す
        const qi = Object.assign({}, queryInfo || {}, { fragment });
        displaySearchResults(results, qi);
    }

    // フラグメント解析
    function parseSearchFragment(hash) {
        if (!hash) return null;
        const raw = hash.replace(/^#/, '');
        const params = {};
        for (const pair of raw.split('&')) {
            const idx = pair.indexOf('=');
            if (idx === -1) continue;
            const k = pair.substring(0, idx);
            const v = pair.substring(idx + 1);
            params[k] = v;
        }
        params.raw = raw;
        return params;
    }

    // ハッシュ起動復元処理
    function bootstrapSearchFromHash() {
        const hash = location.hash;
        if (!hash) return false;
        const params = parseSearchFragment(hash);
        if (!params || !params.q) return false;

        const q = decodeURIComponent(params.q || '');
        const searchType = params.type || '';
        // 判定し直して結果を作る（URLフラグメント自体はそのまま表示に使う）
        const analysis = determineInputType(q);
        if (!analysis.isValid) {
            console.warn('[BOOTSTRAP] invalid query in fragment:', analysis.error);
            return false;
        }

        // 検索ロジック（performXxxSearch と同等だがハッシュは上書きしない）
        let results = [];
        if (searchType === 'tag') {
            // タグ検索の復元
            for (const item of searchSource) {
                if (!item.keywords) continue;
                const keywords = Array.isArray(item.keywords) ? item.keywords : [item.keywords];
                for (const kw of keywords) {
                    if (String(kw).trim() === String(q).trim()) {
                        results.push(item);
                        break;
                    }
                }
            }
        } else if (searchType === 'icon') {
            // アイコン検索の復元
            for (const item of searchSource) {
                if (!item.iconClass) continue;
                const icons = Array.isArray(item.iconClass) ? item.iconClass : [item.iconClass];
                for (const ic of icons) {
                    if (String(ic).trim() === String(q).trim()) {
                        results.push(item);
                        break;
                    }
                }
            }
        } else if (analysis.type === SEARCH_INPUT_TYPES.PLAIN_TEXT) {
            const queryLower = String(analysis.normalized).toLowerCase();
            for (const item of searchSource) {
                let matches = false;
                if (item.label && item.label.toLowerCase().includes(queryLower)) matches = true;
                else if (item.labelEn && item.labelEn.toLowerCase().includes(queryLower)) matches = true;
                if (!matches && item.sections && Array.isArray(item.sections)) {
                    for (const section of item.sections) {
                        const sectionText = (section.h2 || '') + ' ' + (section.text || '');
                        if (sectionText.toLowerCase().includes(queryLower)) { matches = true; break; }
                    }
                }
                if (matches) results.push(item);
            }
        } else if (analysis.type === SEARCH_INPUT_TYPES.LOGICAL_OPERATORS) {
            for (const item of searchSource) {
                if (evaluateLogicalExpression(item, analysis.normalized || analysis)) results.push(item);
            }
        } else if (analysis.type === SEARCH_INPUT_TYPES.REGEX) {
            const regexInfo = analysis.normalized || {};
            try {
                const regex = new RegExp(regexInfo.pattern, regexInfo.flags);
                for (const item of searchSource) {
                    let matches = false;
                    if ((item.label && regex.test(item.label)) || (item.labelEn && regex.test(item.labelEn))) matches = true;
                    if (!matches && item.sections && Array.isArray(item.sections)) {
                        for (const section of item.sections) {
                            const sectionText = (section.h2 || '') + ' ' + (section.text || '');
                            if (regex.test(sectionText)) { matches = true; break; }
                        }
                    }
                    if (matches) results.push(item);
                }
            } catch (e) {
                console.warn('[BOOTSTRAP] invalid regex from fragment:', e.message);
                return false;
            }
        } else {
            return false;
        }

        // UI 表示制御：検索画面を隠し結果を表示
        try { const sp = document.getElementById('contentIntegSearch'); if (sp) sp.style.display = 'none'; } catch (e) {}
        try { const rc = document.getElementById('contentIntegSearchResult'); if (rc) rc.style.display = 'block'; } catch (e) {}

        // 表示: fragment を保持した queryInfo を渡す
        const qi = {
            original: q,
            type: searchType || (analysis && analysis.type),
            normalized: analysis && analysis.normalized ? analysis.normalized : q,
            fragment: params.raw
        };
        displaySearchResults(results, qi);
        return true;
    }

    // ハッシュ変更時に復元を試みる（ユーザが別タブからハッシュを付けて開く等に対応）
    window.addEventListener('hashchange', () => {
        try { bootstrapSearchFromHash(); } catch (e) { console.error('[HASH] bootstrap failed:', e); }
    });

    /**
     * 関数名   : displaySearchResults()
     * 名称     : 検索結果の表示
     * 内容     : 検索結果をDOM に挿入
     * 引数     : results (array) - マッチしたアイテム
     *          queryInfo (object) - クエリ情報
     * 戻り値   : void
     */
    // ========================
    function displaySearchResults(results, queryInfo) {
        console.log('[SEARCH] Displaying', results.length, 'results');

        const resultContainer = document.getElementById('contentIntegSearchResult');
        if (!resultContainer) {
            console.error('[SEARCH] Result container not found');
            return;
        }

        // siteData を配列に統一
        if (!Array.isArray(siteData)) {
            try {
                siteData = Object.values(siteData);
            } catch (e) {
                siteData = [];
            }
        }

        // results.id と同じ id を持つノードを siteData から探す
        const findTargetPage = (id) => siteData.find(n => n && n.id === id);

        // 結果HTMLの構築
        let resultHtml = '<div class="main search-results">';

        // 戻るボタンを追加
        resultHtml += '<div style="margin-bottom: 20px;">';
        resultHtml += '<button id="backToSearchBtn" style="padding: 8px 16px; cursor: pointer;">← 検索画面に戻る</button>';
        resultHtml += '</div>';

        resultHtml += `<h1>検索結果 ( ${results.length} 件がヒット)</h1>`;

        // クエリ情報があれば簡易表示（内部デバッグ用）
        try {
            if (queryInfo) {
                const qstr = (queryInfo.original || queryInfo.query || '');
                const frag = queryInfo.fragment ? ('<code>' + String(queryInfo.fragment) + '</code>') : '';
                if (qstr || frag) {
                    resultHtml += '<p class="search-query-info" style="overflow-wrap: break-word;">クエリ: ' + (String(qstr).replace(/</g,'&lt;')) + ' ' + frag + '</p>';
                }
            }
        } catch (e) {
            // ignore
        }

        if (results.length === 0) {
            resultHtml += '<p>マッチする結果がありません。</p>';
        } else {
            resultHtml += '<ul>';
            for (const result of results) {
                const targetPage = findTargetPage(result.id) || {};
                resultHtml += '<li>';
                resultHtml += `<a href="${targetPage.url}">`;
                resultHtml += '<strong>' + (result.label || 'N/A') + '</strong>';
                if (result.labelEn) {
                    resultHtml += ' (' + result.labelEn + ')';
                }
                resultHtml += '</a>';
                resultHtml += '</li>';
            }
            resultHtml += '</ul>';
        }

        resultHtml += '</div>';
        resultContainer.innerHTML = resultHtml;

        // 戻るボタンのイベントリスナーを追加
        const backBtn = document.getElementById('backToSearchBtn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                console.log('[SEARCH] Back to search button clicked');
                returnToSearchScreen();
            });
        }
    }

    /**
     * 関数名   : returnToSearchScreen()
     * 名称     : 検索画面に戻る
     * 内容     : 結果表示を隠し、検索画面を再表示
     * 引数     : void
     * 戻り値   : void
     */
    function returnToSearchScreen() {
        try {
            const searchPanel = document.getElementById('contentIntegSearch');
            if (searchPanel) searchPanel.style.display = 'block';
        } catch (e) { /* ignore */ }

        try {
            const resultContainer = document.getElementById('contentIntegSearchResult');
            if (resultContainer) {
                resultContainer.style.display = 'none';
                resultContainer.innerHTML = '';
            }
        } catch (e) { /* ignore */ }

        // URL をクエリなしの検索ページに戻す
        try {
            history.pushState(null, '', location.pathname);
        } catch (e) {
            location.hash = '';
        }

        // 入力フィールドをクリア
        try {
            const input = document.getElementById('labelSubstringSearchInput');
            if (input) input.value = '';
        } catch (e) { /* ignore */ }

        console.log('[SEARCH] Returned to search screen');
    }

    // ブラウザの戻る/進む操作に対応
    window.addEventListener('popstate', (event) => {
        // ハッシュが無い = 検索画面に戻す
        if (!location.hash) {
            returnToSearchScreen();
        } else {
            // フラグメントあり → 再度結果を復元
            bootstrapSearchFromHash();
        }
    });

    // ------------------------
    // 初期化フロー（状態遷移順）
    // ------------------------
    (function mainFlow() {
        try {
            console.log('[MAIN] start state machine');
            // STATE 1: search content initialization
            if (!searchContentInit()) {
                console.error('[MAIN] search content initialization failed - abort');
                return;
            }
            console.log('[MAIN] start state machine');

            initializeTocToggle();

            // STATE 1: data validation
            if (!validateData()) {
                console.error('[MAIN] data validation failed - abort');
                return;
            }

            // STATE 2: network init
            if (!initializeNetwork()) {
                console.error('[MAIN] network initialization failed - abort');
                return;
            }

            // フラグメントがあれば復元
            try { bootstrapSearchFromHash(); } catch (e) { console.error('[MAIN] bootstrapSearchFromHash error:', e); }

            // otherwise draw default graph according to selects
            currentState = STATE.IDLE;
            console.log('[MAIN] entering IDLE state');
        } catch (e) {
            console.error('[MAIN] unexpected error:', e);
            currentState = STATE.ERROR;
        }
    })();

    // ------------------------
    // 公開（デバッグ用）
    // ------------------------
    window.__SiteGraph = {
        STATE,
        getCurrentState: () => currentState,
        getErrorFlags: () => ({ ...errorFlags }),
        reinitNetwork: () => { networkInitialized = false; return initializeSearchUI(); }
    };
});
