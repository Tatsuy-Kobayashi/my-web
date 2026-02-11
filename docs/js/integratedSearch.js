// ----------------------------------------------------------------------------
// ファイル名    : integratedSearch.js
// 名称          : ページの各パーツを生成するスクリプト
// 内容          : ページの内容に応じて、関連リンクやナビゲーションリンクを生成・挿入する
// このプログラムの著作権及び、このプログラムに関する技術は（株）Fibrantixがその知的財産権を所有し
// ており、所有者の事前の許可なくその全部又は一部を問わず、第三者に開示してはならない。
// Copyright(c) 2025 Fibrantix CO.,LTD. All Rights Reserved
// ----------------------------------------------------------------------------
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
        { id: 505, label: "情報システム", labelEn: "Information System", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/applied_science/informatics/information_system/information_system.html", mainPath: ["0:5:50:505"], released: 0 },

        // 深さ4
        // 数学基礎論301
        { id: 3010, label: "数理論理学", labelEn: "Mathematical Logic", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/foundations_of_mathematics/mathematical_logic/mathematical_logic.html", mainPath: ["0:3:30:301:3010"], released: 0 },
        { id: 3011, label: "集合論", labelEn: "Set Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/foundations_of_mathematics/set_theory/set_theory.html", mainPath: ["0:3:30:301:3011"], released: 1, description: "集合の基本概念から応用まで解説。集合の定義、演算（和・積・差集合）、部分集合、冪集合などをPythonのコード例とベン図で分かりやすく学べる。数学の基礎を支える集合論の入門として最適。", keywords: ["Pythonによる解説"], iconClass: "fa-folder fa-fw" },
        //{ id: 3012, label: "圏論", labelEn: "Category Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/foundations_of_mathematics/category_theory/category_theory.html", mainPath: ["0:3:30:301:3010"], released: 0, iconClass: "fa-folder fa-fw" },
        // 数論302
        { id: 3020, label: "数学定数", labelEn: "Mathematical Constants", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/number_theory/mathematical_constant/mathematical_constant.html", mainPath: ["0:3:30:302:3020"], released: 1, keywords: ["一覧"], iconClass: "fa-folder fa-fw" },
        // 代数学303
        { id: 3030, label: "抽象代数学", labelEn: "Abstract Algebra", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/abstract_algebra/abstract_algebra.html", mainPath: ["0:3:30:303:3030"] },
        { id: 3031, label: "普遍代数学", labelEn: "Universal Algebra", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/universal_algebra/universal_algebra.html", mainPath: ["0:3:30:303:3031"] },
        // 解析学304
        { id: 3040, label: "解析学基礎", labelEn: "Foundations of Analysis", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/foundations_of_analysis/foundations_of_analysis.html", mainPath: ["0:3:30:304:3040"], released: 1 },
        { id: 3041, label: "微分積分学", labelEn: "Differential and Integral Calculus", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/calculus/calculus.html", mainPath: ["0:3:30:304:3041"], released: 1 },
        // 多親（代数・解析の両方の子）paths: ["0:3:30:303:3030", "0:3:30:304:3030"]
        { id: 3042, label: "代数解析学", labelEn: "Algebraic Analysis", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/algebraic_analysis/algebraic_analysis.html", mainPath: ["0:3:30:304:3042"], auxPath: ["0:3:30:303:3032"], released: 0 },
        { id: 3043, label: "関数解析学", labelEn: "Functional Analysis", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/functional_analysis/functional_analysis.html", mainPath: ["0:3:30:304:3043"], released: 0 },
        { id: 3044, label: "関数方程式", labelEn: "Functional Equations", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/functional_equation/functional_equation.html", mainPath: ["0:3:30:304:3044"], released: 0 },
        { id: 3045, label: "数値解析", labelEn: "Numerical Analysis", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/numerical_analysis/numerical_analysis.html", mainPath: ["0:3:30:304:3045"], released: 0 },
        { id: 3046, label: "超準解析", labelEn: "Nonstandard Analysis", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/nonstandard_analysis/nonstandard_analysis.html", mainPath: ["0:3:30:304:3046"], released: 0 },
        // 物理学401
        { id: 4010, label: "ニュートン力学", labelEn: "Newtonian Mechanics", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/natural_science/physics/classical_physics/newtonian_mechanics/newtonian_mechanics.html", mainPath: ["0:4:40:401:4010"], released: 0 },
        { id: 4011, label: "統計力学", labelEn: "Statistical Mechanics", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/natural_science/physics/classical_physics/statistical_mechanics/statistical_mechanics.html", mainPath: ["0:4:40:401:4011"], released: 0 },
        { id: 4012, label: "連続体の物理学", labelEn: "Physics of Continuum", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/natural_science/physics/classical_physics/physics_of_continuum/physics_of_continuum.html", mainPath: ["0:4:40:401:4012"], released: 0 },
        // 情報理論501
        { id: 5010, label: "符号理論", labelEn: "Coding Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/applied_science/informatics/information_theory/coding_theory/coding_theory.html", mainPath: ["0:5:50:501:5010"], released: 0 },
        { id: 5011, label: "暗号理論", labelEn: "Cryptography", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/applied_science/informatics/information_theory/cryptography/cryptography.html", mainPath: ["0:5:50:501:5011"], released: 0 },
        { id: 5012, label: "型理論", labelEn: "Type Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/applied_science/informatics/information_theory/type_theory/type_theory.html", mainPath: ["0:5:50:501:5012"], released: 0 },
        { id: 5013, label: "信号処理", labelEn: "Signal Processing", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/applied_science/informatics/information_theory/signal_processing/signal_processing.html", mainPath: ["0:5:50:501:5013"], released: 0 },
        // 計算理論502
        { id: 5020, label: "システム科学", labelEn: "Systems Science", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/applied_science/informatics/theory_of_computation/systems_science/systems_science.html", mainPath: ["0:5:50:502:5020"], released: 0 },
        { id: 5021, label: "プログラム構造", labelEn: "Structure of Programs", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/applied_science/informatics/theory_of_computation/structure_of_programs/structure_of_programs.html", mainPath: ["0:5:50:502:5021"], released: 0 },
        { id: 5022, label: "スキーマ", labelEn: "Schema", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/applied_science/informatics/theory_of_computation/schema/schema.html", mainPath: ["0:5:50:502:5022"], released: 0 },
        { id: 5023, label: "計算モデル", labelEn: "Model of Computation", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/applied_science/informatics/theory_of_computation/model_of_computation/model_of_computation.html", mainPath: ["0:5:50:502:5023"], released: 0 },
        { id: 5024, label: "アルゴリズム", labelEn: "Algorithm", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/applied_science/informatics/theory_of_computation/algorithm/algorithm.html", mainPath: ["0:5:50:502:5024"], released: 0 },
        { id: 5025, label: "計算可能性理論", labelEn: "Computability Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/applied_science/informatics/theory_of_computation/computability_theory/computability_theory.html", mainPath: ["0:5:50:502:5025"], auxPath: ["0:3:30:301:3010:30104"], released: 0 },
        { id: 5026, label: "計算複雑性理論", labelEn: "Computational Complexity Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/applied_science/informatics/theory_of_computation/computational_complexity_theory/computational_complexity_theory.html", mainPath: ["0:5:50:502:5026"], released: 0 },
        { id: 5027, label: "コンピュータ言語", labelEn: "Computer Language", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/applied_science/informatics/theory_of_computation/computer_language/computer_language.html", mainPath: ["0:5:50:502:5027"], released: 0 },
        { id: 5028, label: "プログラム意味論", labelEn: "Program Semantics", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/applied_science/informatics/theory_of_computation/program_semantics/program_semantics.html", mainPath: ["0:5:50:502:5028"], released: 0 },
        { id: 5029, label: "データサイエンス", labelEn: "Data Science", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/applied_science/informatics/theory_of_computation/data_science/data_science.html", mainPath: ["0:5:50:502:5029"], released: 0 },
        // 計算機科学503
        { id: 5030, label: "ハードウェア・エンジニアリング", labelEn: "Hardware Engineering", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/applied_science/informatics/computer_science/hardware_engineering/hardware_engineering.html", mainPath: ["0:5:50:503:5030"], released: 0 },
        { id: 5031, label: "ソフトウェア・エンジニアリング", labelEn: "Software Engineering", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/applied_science/informatics/computer_science/software_engineering/software_engineering.html", mainPath: ["0:5:50:503:5031"], released: 0 },
        { id: 5032, label: "コンピュータ・セキュリティ", labelEn: "Computer Security", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/applied_science/informatics/computer_science/computer_security/computer_security.html", mainPath: ["0:5:50:503:5032"], released: 0 },
        // 情報システム505
        { id: 5050, label: "コンピュータ・システム", labelEn: "Computer System", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/applied_science/informatics/information_system/computer_system/computer_system.html", mainPath: ["0:5:50:505:5050"], released: 0 },
        { id: 5051, label: "組込みシステム", labelEn: "Embedded System", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/applied_science/informatics/information_system/embedded_system/embedded_system.html", mainPath: ["0:5:50:505:5051"], released: 0 },

        // 深さ5
        // 数理論理学3010
        { id: 30100, label: "形式主義", labelEn: "Formalism", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/foundations_of_mathematics/mathematical_logic/formalism/formalism.html", mainPath: ["0:3:30:301:3010:30100"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        { id: 30101, label: "直観主義", labelEn: "Intuitionism", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/foundations_of_mathematics/mathematical_logic/intuitionism/intuitionism.html", mainPath: ["0:3:30:301:3010:30101"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        { id: 30102, label: "証明論", labelEn: "Proof Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/foundations_of_mathematics/mathematical_logic/proof_theory/proof_theory.html", mainPath: ["0:3:30:301:3010:30102"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        { id: 30103, label: "モデル理論", labelEn: "Model Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/foundations_of_mathematics/mathematical_logic/model_theory/model_theory.html", mainPath: ["0:3:30:301:3010:30103"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        //{ id: 30104, label: "計算可能性理論", labelEn: "Computability Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/foundations_of_mathematics/mathematical_logic/computability_theory/computability_theory.html", mainPath: ["0:3:30:301:3010:30104"], released: 0 },
        // 集合論3011
        { id: 30110, label: "素朴集合論", labelEn: "Naive Set Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/foundations_of_mathematics/set_theory/naive_set_theory/naive_set_theory.html", mainPath: ["0:3:30:301:3011:30110"], released: 1, description: "素朴集合論の基礎から応用まで解説。素朴包括原理やパラドックス許容論理を中心に、Pythonによる実装例を交えながら、ラッセルのパラドックスや論理体系の修正についても学べる数学基礎論の入門記事。", keywords: ["プログラミング", "Pythonによる解説"] },
        { id: 30111, label: "公理的集合論", labelEn: "Axiomatic Set Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/foundations_of_mathematics/set_theory/axiomatic_set_theory/axiomatic_set_theory.html", mainPath: ["0:3:30:301:3011:30111"], released: 1, description: "公理的集合論の基礎から発展まで解説。ZF集合論、NBG集合論、MK集合論など主要な体系を比較しながら、各公理の意味や相互関係、数学基礎論における役割を学べる。図解とともに体系的に理解できる入門記事。" },
        { id: 30112, label: "メタ数学", labelEn: "Metamathematics", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/foundations_of_mathematics/set_theory/metamathematics/metamathematics.html", mainPath: ["0:3:30:301:3011:30112"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        { id: 30113, label: "記述集合論", labelEn: "Descriptive Set Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/foundations_of_mathematics/set_theory/descriptive_set_theory/descriptive_set_theory.html", mainPath: ["0:3:30:301:3011:30113"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        { id: 30114, label: "拡張的集合論", labelEn: "Extended Set Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/foundations_of_mathematics/set_theory/extended_set_theory/extended_set_theory.html", mainPath: ["0:3:30:301:3011:30114"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        // 抽象代数学3030
        { id: 30300, label: "代数系一般論", labelEn: "Algebraic Structures", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/abstract_algebra/algebraic_structures/algebraic_structures.html", mainPath: ["0:3:30:303:3030:30300"] },
        { id: 30301, label: "表現論・ホモロジー代数", labelEn: "Representation and Homological Algebra", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/abstract_algebra/representation_homological/representation_homological.html", mainPath: ["0:3:30:303:3030:30301"], auxPath: ["0:3:30:303:3030:30300:303001:3030011"] },
        // 普遍代数学3031
        { id: 30310, label: "代数的構造の一般理論", labelEn: "General Theory of Algebraic Structures", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/general_structure_theory/general_structure_theory.html", mainPath: ["0:3:30:303:3031:30310"] },
        { id: 30311, label: "代数的理論（Lawvere理論）", labelEn: "Lawvere Theories", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/lawvere_theory/lawvere_theory.html", mainPath: ["0:3:30:303:3031:30311"] },
        { id: 30312, label: "モデル理論・論理代数", labelEn: "Model Theory and Algebraic Logic", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/model_theory/model_theory.html", mainPath: ["0:3:30:303:3031:30312"] },
        { id: 30313, label: "圏論的代数学", labelEn: "Categorical Algebra", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/categorical_algebra/categorical_algebra.html", mainPath: ["0:3:30:303:3031:30313"] },
        // 解析学基礎3040
        { id: 30400, label: "実解析", labelEn: "Theory of Real Numbers", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/foundations_of_analysis/real_analysis/real_analysis.html", mainPath: ["0:3:30:304:3040:30400"], released: 1 },
        { id: 30401, label: "複素解析", labelEn: "Complex Analysis", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/foundations_of_analysis/complex_analysis/complex_analysis.html", mainPath: ["0:3:30:304:3040:30401"], released: 0 },
        { id: 30402, label: "関数論", labelEn: "Function Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/foundations_of_analysis/function_theory/function_theory.html", mainPath: ["0:3:30:304:3040:30402"], released: 1 },
        // 微分積分学3041
        { id: 30410, label: "微分法", labelEn: "Differential Calculus", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/calculus/differential_calculus/differential_calculus.html", mainPath: ["0:3:30:304:3041:30410"], released: 1 },
        { id: 30411, label: "測度論", labelEn: "Measure Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/calculus/measure_theory/measure_theory.html", mainPath: ["0:3:30:304:3041:30411"], released: 0 },
        { id: 30412, label: "積分法", labelEn: "Integral Calculus", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/calculus/integral_calculus/integral_calculus.html", mainPath: ["0:3:30:304:3041:30412"], released: 0 },
        { id: 30413, label: "変分法", labelEn: "Calculus of Variations", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/calculus_of_variations/calculus_of_variations.html", mainPath: ["0:3:30:304:3041:30413"], released: 1 },
        //{ id: 30414, label: "調和解析", labelEn: "Harmonic Analysis", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/calculus/harmonic_analysis/harmonic_analysis.html", paths: ["0:3:30:304:3041:30414"], released: 1 },
        // 代数解析学3042
        { id: 30420, label: "テンソル解析", labelEn: "Tensor Analysis", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/algebraic_analysis/tensor_analysis/tensor_analysis.html", mainPath: ["0:3:30:304:3042:30420"], released: 0 },
        // 関数解析学3043
        { id: 30430, label: "関数空間論", labelEn: "Function Space Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/functional_analysis/function_space_theory/function_space_theory.html", mainPath: ["0:3:30:304:3043:30430"], released: 0 },
        { id: 30431, label: "作用素論", labelEn: "Operator Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/functional_analysis/operator_theory/operator_theory.html", mainPath: ["0:3:30:304:3043:30431"], released: 0 },
        { id: 30432, label: "演算子環", labelEn: "Operator Ring", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/functional_analysis/operator_ring/operator_ring.html", mainPath: ["0:3:30:304:3043:30432"], released: 0 },
        { id: 30433, label: "超関数論と分布論", labelEn: "Super Function Theory and Distribution Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/functional_analysis/super_function_theory/super_function_theory.html", mainPath: ["0:3:30:304:3043:30433"], released: 0 },
        { id: 30434, label: "調和解析", labelEn: "Harmonic Analysis", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/functional_analysis/harmonic_analysis/harmonic_analysis.html", mainPath: ["0:3:30:304:3043:30434"], auxPath: ["0:3:30:304:3041:30414"], released: 0 },
        // 関数方程式3044
        { id: 30440, label: "代数的・構造的関数方程式", labelEn: "Algebraic and Structural Functional Equations", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/functional_equation/algebraic_functional_equation/algebraic_functional_equation.html", mainPath: ["0:3:30:304:3044:30440"], released: 0 },
        { id: 30441, label: "解析的条件付関数方程式", labelEn: "Analytic Conditional Functional Equations", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/functional_equation/analytic_conditional_functional_equation/analytic_conditional_functional_equation.html", mainPath: ["0:3:30:304:3044:30441"], released: 0 },
        { id: 30442, label: "離散時間系：差分・漸化式", labelEn: "Discrete-Time Functional Equation: Difference and Differential Equations", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/functional_equation/discrete-time_functional_equation/discrete-time_functional_equation.html", mainPath: ["0:3:30:304:3044:30442"], released: 0 },
        { id: 30443, label: "連続時間系：微分・積分方程式", labelEn: "Continuous-Time Functional Equation: Difference and Differential Equations", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/functional_equation/continuous-time_functional_equation/continuous-time_functional_equation.html", mainPath: ["0:3:30:304:3044:30443"], released: 0 },
        { id: 30444, label: "関数解析的・作用素論的アプローチ", labelEn: "Approach to Functional Analysis and Operator Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/functional_equation/approach_to_functional_analysis_and_operator_theory/approach_to_functional_analysis_and_operator_theory.html", mainPath: ["0:3:30:304:3044:30444"], released: 0 },
        { id: 30445, label: "力学系", labelEn: "Mechanical Systems", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/functional_equation/mechanical_systems/mechanical_systems.html", mainPath: ["0:3:30:304:3044:30445"], released: 0 },
        // 数値解析3045
        { id: 30450, label: "近似理論", labelEn: "Approximation Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/numerical_analysis/approximation_theory/approximation_theory.html", mainPath: ["0:3:30:304:3045:30450"], released: 0, description: "ベルンシュタインの定理" },
        { id: 30451, label: "数値微分・数値積分", labelEn: "Numerical Differentiation and Integration", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/numerical_analysis/numerical_differentiation_and_integration/numerical_differentiation_and_integration.html", mainPath: ["0:3:30:304:3045:30451"], released: 0 },
        { id: 30452, label: "数値テンソル解析", labelEn: "Numerical Tensor Analysis", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/numerical_analysis/numerical_tensor_analysis/numerical_tensor_analysis.html", mainPath: ["0:3:30:304:3045:30452"], released: 0 },
        { id: 30453, label: "常微分方程式の数値解法", labelEn: "Numerical Solution of Ordinary Differential Equations", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/numerical_analysis/numerical_solution_of_ordinary_differential_equations/numerical_solution_of_ordinary_differential_equations.html", mainPath: ["0:3:30:304:3045:30453"], released: 0 },
        { id: 30454, label: "誤差解析と安定性解析", labelEn: "Error Analysis and Stability Analysis", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/numerical_analysis/error_analysis_and_stability_analysis/error_analysis_and_stability_analysis.html", mainPath: ["0:3:30:304:3045:30454"], released: 0 },
        // プログラム構造5021
        { id: 50210, label: "データ表現", labelEn: "Data Representation", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/applied_science/informatics/theory_of_computation/structure_of_programs/data_representation/data_representation.html", mainPath: ["0:5:50:502:5021:50210"], released: 0 },
        { id: 50211, label: "型システム", labelEn: "Type System", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/applied_science/informatics/theory_of_computation/structure_of_programs/type_system/type_system.html", mainPath: ["0:5:50:502:5021:50211"], released: 0 },
        { id: 50212, label: "オブジェクト構造", labelEn: "Object Structure", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/applied_science/informatics/theory_of_computation/structure_of_programs/object_structure/object_structure.html", mainPath: ["0:5:50:502:5021:50212"], released: 0 },
        { id: 50213, label: "計算構造", labelEn: "Computation Structure", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/applied_science/informatics/theory_of_computation/structure_of_programs/computation_structure/computation_structure.html", mainPath: ["0:5:50:502:5021:50213"], released: 0 },
        // 計算モデル5023
        { id: 50230, label: "オートマトン理論", labelEn: "Automaton Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/applied_science/informatics/theory_of_computation/model_of_computation/automaton_theory/automaton_theory.html", mainPath: ["0:5:50:502:5023:50230"], released: 0 },

        // 深さ6
        // 形式主義30100
        { id: 301000, label: "古典論理学", labelEn: "Classical Logic", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/foundations_of_mathematics/mathematical_logic/formalism/classical_logic/classical_logic.html", mainPath: ["0:3:30:301:3010:30100:301000"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        { id: 301001, label: "様相論理", labelEn: "Modal Logic", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/foundations_of_mathematics/mathematical_logic/formalism/modal_logic/modal_logic.html", mainPath: ["0:3:30:301:3010:30100:301001"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        { id: 301002, label: "ファジィ論理", labelEn: "Fuzzy Logic", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/foundations_of_mathematics/mathematical_logic/formalism/fuzzy_logic/fuzzy_logic.html", mainPath: ["0:3:30:301:3010:30100:301002"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        { id: 301003, label: "矛盾許容論理", labelEn: "Paraconsistent Logic", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/foundations_of_mathematics/mathematical_logic/formalism/paraconsistent_logic/paraconsistent_logic.html", mainPath: ["0:3:30:301:3010:30100:301003"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        // 直観主義 30101
        { id: 301010, label: "構成的数学", labelEn: "Constructive Mathematics", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/foundations_of_mathematics/mathematical_logic/intuitionism/constructive_mathematics/constructive_mathematics.html", mainPath: ["0:3:30:301:3010:30101:301010"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        { id: 301011, label: "ハイティング代数", labelEn: "Heyting Algebra", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/foundations_of_mathematics/mathematical_logic/intuitionism/heyting_algebra/heyting_algebra.html", mainPath: ["0:3:30:301:3010:30101:301011"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        { id: 301012, label: "クリプキ意味論", labelEn: "Kripke Semantics", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/foundations_of_mathematics/mathematical_logic/intuitionism/kripke_semantics/kripke_semantics.html", mainPath: ["0:3:30:301:3010:30101:301012"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        // 証明論 30102
        { id: 301020, label: "ヒルベルト・プログラム", labelEn: "Hilbert's Program", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/foundations_of_mathematics/mathematical_logic/proof_theory/hilbert_program/hilbert_program.html", mainPath: ["0:3:30:301:3010:30102:301020"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        { id: 301021, label: "不完全性定理", labelEn: "Incompleteness Theorems", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/foundations_of_mathematics/mathematical_logic/proof_theory/incompleteness_theorems/incompleteness_theorems.html", mainPath: ["0:3:30:301:3010:30102:301021"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        { id: 301022, label: "算術の体系", labelEn: "system of arithmetic", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/foundations_of_mathematics/mathematical_logic/proof_theory/system_of_arithmetic/system_of_arithmetic.html", mainPath: ["0:3:30:301:3010:30102:301022"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        { id: 301023, label: "逆数学", labelEn: "Reverse Mathematics", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/foundations_of_mathematics/mathematical_logic/proof_theory/reverse_mathematics/reverse_mathematics.html", mainPath: ["0:3:30:301:3010:30102:301023"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        // モデル理論 30103
        { id: 301030, label: "基礎モデル理論", labelEn: "Basic Model Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/foundations_of_mathematics/mathematical_logic/model_theory/basic_model_theory/basic_model_theory.html", mainPath: ["0:3:30:301:3010:30103:301030"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        { id: 301031, label: "現代モデル理論", labelEn: "Contemporary Model Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/foundations_of_mathematics/mathematical_logic/model_theory/contemporary_model_theory/contemporary_model_theory.html", mainPath: ["0:3:30:301:3010:30103:301031"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        { id: 301032, label: "超準解析 (意味論)", labelEn: "Non-standard Analysis", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/foundations_of_mathematics/mathematical_logic/model_theory/non-standard_analysis/non-standard_analysis.html", mainPath: ["0:3:30:301:3010:30103:301032"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        // 公理的集合論30111
        { id: 301110, label: "ツェルメロ＝フレンケル集合論", labelEn: "Zermelo-Fraenkel Set Theory with the Axiom of Choice", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/foundations_of_mathematics/set_theory/axiomatic_set_theory/zermelo_fraenkel_choice_set_theory/zermelo_fraenkel_choice_set_theory.html", mainPath: ["0:3:30:301:3011:30111:301110"], released: 1, isPaid: 1 },
        { id: 301111, label: "フォン・ノイマン＝ベルナイス＝ゲーデル集合論", labelEn: "von Neumann–Bernays–Gödel Set Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/foundations_of_mathematics/set_theory/axiomatic_set_theory/nbg_set_theory/nbg_set_theory.html", mainPath: ["0:3:30:301:3011:30111:301111"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        { id: 301112, label: "モース＝ケリー集合論", labelEn: "Morse–Kelley Set Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/foundations_of_mathematics/set_theory/axiomatic_set_theory/mk_set_theory/mk_set_theory.html", mainPath: ["0:3:30:301:3011:30111:301112"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        { id: 301113, label: "新基礎集合論", labelEn: "New Foundations Set Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/foundations_of_mathematics/set_theory/axiomatic_set_theory/new_foundations_set_theory/new_foundations_set_theory.html", mainPath: ["0:3:30:301:3011:30111:301113"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        // メタ数学30112
        { id: 301120, label: "内部モデル理論", labelEn: "Inner Model Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/foundations_of_mathematics/set_theory/metamathematics/inner_model_theory/inner_model_theory.html", mainPath: ["0:3:30:301:3011:30112:301120"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        { id: 301121, label: "独立性証明と強制法", labelEn: "Independence Proofs and Forcing Methods", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/foundations_of_mathematics/set_theory/metamathematics/forcing_method/forcing_method.html", mainPath: ["0:3:30:301:3011:30112:301121"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        { id: 301122, label: "巨大基数論", labelEn: "Large Cardinal Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/foundations_of_mathematics/set_theory/metamathematics/large_cardinal_theory/large_cardinal_theory.html", mainPath: ["0:3:30:301:3011:30112:301122"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        // 記述集合論30113
        //{ id: 301130, label: "ボレル集合・解析集合", labelEn: "Borel and Analytic Sets", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/foundations_of_mathematics/set_theory/descriptive_set_theory/borel_analytic_sets/borel_analytic_sets.html", mainPath: ["0:3:30:301:3011:30113:301130"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        //{ id: 301131, label: "ポーランド空間", labelEn: "Polish Spaces", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/foundations_of_mathematics/set_theory/descriptive_set_theory/polish_spaces/polish_spaces.html", mainPath: ["0:3:30:301:3011:30113:301131"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        { id: 301132, label: "決定性公理", labelEn: "Axiom of Determinacy", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/foundations_of_mathematics/set_theory/descriptive_set_theory/axiom_of_determinacy/axiom_of_determinacy.html", mainPath: ["0:3:30:301:3011:30113:301132"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        // 拡張的集合論30114
        { id: 301140, label: "構成的集合論", labelEn: "Constructive Set Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/foundations_of_mathematics/set_theory/extended_set_theory/constructive_set_theory/constructive_set_theory.html", mainPath: ["0:3:30:301:3011:30114:301140"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        { id: 301141, label: "非整礎集合論", labelEn: "Non-well-founded Set Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/foundations_of_mathematics/set_theory/extended_set_theory/non_well_founded_set_theory/non_well_founded_set_theory.html", mainPath: ["0:3:30:301:3011:30114:301141"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        { id: 301142, label: "ファジィ集合論", labelEn: "Fuzzy Set Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/foundations_of_mathematics/set_theory/extended_set_theory/fuzzy_set_theory/fuzzy_set_theory.html", mainPath: ["0:3:30:301:3011:30114:301142"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        { id: 301143, label: "内部集合論", labelEn: "Internal Set Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/foundations_of_mathematics/set_theory/extended_set_theory/internal_set_theory/internal_set_theory.html", mainPath: ["0:3:30:301:3011:30114:301143"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        // 代数系一般論30300
        { id: 303000, label: "原始的な代数的構造", labelEn: "Primitive Algebraic Structures", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/abstract_algebra/algebraic_structures/primitive_structures/primitive_structures.html", mainPath: ["0:3:30:303:3030:30300:303000"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        { id: 303001, label: "群論", labelEn: "Group Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/abstract_algebra/algebraic_structures/group_theory/group_theory.html", mainPath: ["0:3:30:303:3030:30300:303001"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        { id: 303002, label: "環論", labelEn: "Ring Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/abstract_algebra/algebraic_structures/ring_theory/ring_theory.html", mainPath: ["0:3:30:303:3030:30300:303002"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        { id: 303003, label: "体論", labelEn: "Field Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/abstract_algebra/algebraic_structures/field_theory/field_theory.html", mainPath: ["0:3:30:303:3030:30300:303003"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        { id: 303004, label: "その他の構造", labelEn: "Other Algebraic Structures", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/abstract_algebra/algebraic_structures/other_structures/other_structures.html", mainPath: ["0:3:30:303:3030:30300:303004"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        // 代数的構造の一般理論30310
        { id: 303100, label: "代数・準同型・同値関係・商構造", labelEn: "Algebras, Homomorphisms, Congruence Relations, and Quotients", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/algebras_homomorphisms/algebras_homomorphisms.html", mainPath: ["0:3:30:303:3031:30310:303100"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        { id: 303101, label: "代数的性質", labelEn: "Algebraic Properties", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/algebraic_properties/algebraic_properties.html", mainPath: ["0:3:30:303:3031:30310:303101"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        { id: 303130, label: "圏論", labelEn: "Category Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/category_theory/category_theory.html", mainPath: ["0:3:30:303:3031:30313:303130"], auxPath: ["0:3:30:301:3012"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        { id: 303131, label: "基礎：関手・自然変換・極限・余極限", labelEn: "Functors, Natural Transformations, Limits and Colimits", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/functors_limits/functors_limits.html", mainPath: ["0:3:30:303:3031:30313:303131"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        { id: 303132, label: "構造：モナド・アジュンクション・エンリッチド圏", labelEn: "Monads, Adjunctions, and Enriched Categories", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/monads_adjunctions/monads_adjunctions.html", mainPath: ["0:3:30:303:3031:30313:303132"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        { id: 303133, label: "トポス論", labelEn: "Topos Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/topos_theory/topos_theory.html", mainPath: ["0:3:30:303:3031:30313:303133"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        { id: 303134, label: "高次圏論・圏的ホモトピー論", labelEn: "Higher Category Theory and Homotopical Algebra", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/higher_category_theory/higher_category_theory.html", mainPath: ["0:3:30:303:3031:30313:303134"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        // 実数論30400
        { id: 304000, label: "数列", labelEn: "Sequences", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/foundations_of_analysis/theory_of_real_numbers/sequences/sequences.html", mainPath: ["0:3:30:304:3040:30400:304000"], released: 1 },
        { id: 304001, label: "級数", labelEn: "Series", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/foundations_of_analysis/theory_of_real_numbers/series/series.html", mainPath: ["0:3:30:304:3040:30400:304001"], released: 1 },
        { id: 304002, label: "収束と発散", labelEn: "Convergence and Divergence", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/foundations_of_analysis/theory_of_real_numbers/convergence_and_divergence/convergence_and_divergence.html", mainPath: ["0:3:30:304:3040:30400:304002"], released: 1 },
        { id: 304003, label: "テイラー展開・冪級数", labelEn: "Taylor Expansion and Power Series", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/foundations_of_analysis/theory_of_real_numbers/taylor_and_power_series/taylor_and_power_series.html", mainPath: ["0:3:30:304:3040:30400:304003"], released: 1 },
        { id: 304004, label: "実数の構成", labelEn: "Construction of Real Numbers", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/foundations_of_analysis/theory_of_real_numbers/construction_of_real_numbers/construction_of_real_numbers.html", mainPath: ["0:3:30:304:3040:30400:304004"], released: 1 },
        { id: 304005, label: "関数の極限・連続性", labelEn: "Limits and Continuity of Functions", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/foundations_of_analysis/theory_of_real_numbers/limits_and_continuity/limits_and_continuity.html", mainPath: ["0:3:30:304:3040:30400:304005"], released: 0 },
        // 複素解析30401
        { id: 304010, label: "複素数体", labelEn: "Complex Number Field (Algebraic Definition)", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/foundations_of_analysis/complex_analysis/complex_number_field/complex_number_field.html", mainPath: ["0:3:30:304:3040:30401:304010"], released: 0 },
        { id: 304011, label: "複素関数論", labelEn: "Theory of Complex Functions", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/foundations_of_analysis/complex_analysis/theory_of_complex_functions/theory_of_complex_functions.html", mainPath: ["0:3:30:304:3040:30401:304011"], released: 0 },
        { id: 304012, label: "リーマン面（位相的拡張）", labelEn: "Riemann Surfaces", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/foundations_of_analysis/complex_analysis/riemann_surfaces/riemann_surfaces.html", mainPath: ["0:3:30:304:3040:30401:304012"], released: 0 },
        // 関数論30402
        { id: 304020, label: "連続関数・可微分関数の一般論", labelEn: "General Theory of Continuous and Differentiable Functions", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/foundations_of_analysis/function_theory/general_theory_of_functions/general_theory_of_functions.html", mainPath: ["0:3:30:304:3040:30402:304020"], released: 0 },
        { id: 304021, label: "整関数・三角関数・指数・対数", labelEn: "Entire, Trigonometric, Exponential and Logarithmic Functions", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/foundations_of_analysis/function_theory/special_standard_functions/standard_functions.html", mainPath: ["0:3:30:304:3040:30402:304021"], released: 0 },
        { id: 304022, label: "特殊関数", labelEn: "Special Functions", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/foundations_of_analysis/function_theory/special_functions/special_functions.html", mainPath: ["0:3:30:304:3040:30402:304022"], released: 0 },
        // 微分法30410
        { id: 304100, label: "導関数", labelEn: "Derivative", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/calculus/differential_calculus/derivative/derivative.html", mainPath: ["0:3:30:304:3041:30410:304100"], released: 0 },
        { id: 304101, label: "平均値定理", labelEn: "Mean Value Theorem", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/calculus/differential_calculus/mean_value_theorem/mean_value_theorem.html", mainPath: ["0:3:30:304:3041:30410:304101"], released: 0 },
        { id: 304102, label: "テイラーの定理", labelEn: "Taylor's Theorem", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/calculus/differential_calculus/taylor_theorem/taylor_theorem.html", mainPath: ["0:3:30:304:3041:30410:304102"], released: 0 },
        // 積分法30412
        { id: 304120, label: "リーマン積分", labelEn: "Riemann Integral", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/calculus/integral_calculus/riemann_integral/riemann_integral.html", mainPath: ["0:3:30:304:3041:30412:304120"], released: 0 },
        { id: 304121, label: "ルベーグ積分", labelEn: "Lebesgue Integral", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/calculus/integral_calculus/lebesgue_integral/lebesgue_integral.html", mainPath: ["0:3:30:304:3041:30412:304121"], released: 0 },
        // 変分法30413
        { id: 304130, label: "オイラー–ラグランジュ方程式", labelEn: "Euler–Lagrange Equation", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/calculus_of_variations/euler_lagrange_equation/euler_lagrange_equation.html", mainPath: ["0:3:30:304:3041:30413:304130"], released: 0 },
        { id: 304131, label: "変分原理", labelEn: "Variational Principles", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/calculus_of_variations/variational_principles/variational_principles.html", mainPath: ["0:3:30:304:3041:30413:304131"], released: 0 },
        // 関数空間論30430
        { id: 304300, label: "トポロジカル・ベクトル空間", labelEn: "Topological Vector Space", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/functional_analysis/function_space_theory/topological_vector_space/topological_vector_space.html", mainPath: ["0:3:30:304:3043:30430:304300"], released: 0 },
        // 作用素論30431
        { id: 304310, label: "有界線形作用素", labelEn: "Bounded Linear Operator", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/functional_analysis/operator_theory/bounded_linear_operator/bounded_linear_operator.html", mainPath: ["0:3:30:304:3043:30431:304310"], released: 0 },
        { id: 304311, label: "スペクトル理論", labelEn: "Spectrum Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/functional_analysis/operator_theory/spectrum_theory/spectrum_theory.html", mainPath: ["0:3:30:304:3043:30431:304311"], released: 0 },
        // 調和解析30434
        { id: 304340, label: "群上の調和解析（抽象調和解析）", labelEn: "Harmonic Analysis on Groups (Abstract Harmonic Analysis)", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/functional_analysis/harmonic_analysis/harmonic_analysis_on_groups/harmonic_analysis_on_groups.html", mainPath: ["0:3:30:304:3043:30434:304340"], released: 0 },
        { id: 304341, label: "実変数調和解析", labelEn: "Real Variable Harmonic Analysis (Calderón–Zygmund Theory)", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/functional_analysis/harmonic_analysis/real_variable_harmonic_analysis/real_variable_harmonic_analysis.html", mainPath: ["0:3:30:304:3043:30434:304341"], released: 0, description: "Calderón–Zygmund理論" },
        { id: 304342, label: "変換解析", labelEn: "Transformation Analysis", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/functional_analysis/harmonic_analysis/transformation_analysis/transformation_analysis.html", mainPath: ["0:3:30:304:3043:30434:304342"], released: 0, description: "関数解析的な定式化" },
        { id: 304343, label: "幾何学的調和解析", labelEn: "Geometric Harmonic Analysis", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/functional_analysis/harmonic_analysis/geometric_harmonic_analysis/geometric_harmonic_analysis.html", mainPath: ["0:3:30:304:3043:30434:304343"], released: 0 },
        // 代数的・構造的関数方程式30440
        { id: 304400, label: "Cauchy 型方程式", labelEn: "Cauchy-Type Equations", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/functional_equation/algebraic_functional_equation/cauchy-type_equation/cauchy-type_equation.html", mainPath: ["0:3:30:304:3044:30440:304400"], released: 0, description: "$f(x+y) = f(x) + f(y)$（連続性・可測性・有界性条件下で $f(x)=cx$）" },
        { id: 304401, label: "Jensen 型方程式", labelEn: "Jensen-Type Equations", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/functional_equation/algebraic_functional_equation/jensen-type_equation/jensen-type_equation.html", mainPath: ["0:3:30:304:3044:30440:304401"], released: 0, description: "$f(\frac{x+y}{2}) = \frac{f(x) + f(y)}{2}$" },
        { id: 304402, label: "d’Alembert 型方程式", labelEn: "d’Alembert-Type Equations", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/functional_equation/algebraic_functional_equation/dalembert-type_equation/dalembert-type_equation.html", mainPath: ["0:3:30:304:3044:30440:304402"], released: 0, description: "$f(x+y) + f(x-y) = 2f(x) f(y)$" },
        { id: 304403, label: "多項式・代数的合成方程式", labelEn: "Jensen-Type Equations", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/functional_equation/algebraic_functional_equation/jensen-type_equation/jensen-type_equation.html", mainPath: ["0:3:30:304:3044:30440:304403"], released: 0, description: "$f(p(x)) = p(f(x))$, 逆関数方程式 など" },
        { id: 304404, label: "反復・共形同型方程式", labelEn: "Iterative and Conformal Mapping Equation", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/functional_equation/algebraic_functional_equation/jensen-type_equation/jensen-type_equation.html", mainPath: ["0:3:30:304:3044:30440:304404"], released: 0, description: "Schröder 方程式 $f(\phi(x)) = \lambda \phi(x)$、Abel 方程式 $\phi(f(x)) = \phi(x) + 1$" },
        // 解析的条件付関数方程式30441
        { id: 304410, label: "指数・対数型方程式", labelEn: "Exponential-Type and Logarithmic-Type Equations", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/functional_equation/analytic_conditional_functional_equation/exponential-type_equation/exponential-type_equation.html", mainPath: ["0:3:30:304:3044:30441:304410"], released: 0, description: "$f(x+y) = f(x) f(y)$（連続性下で $f(x)=e^{cx}$）" },
        { id: 304411, label: "特殊関数の再帰定義", labelEn: "Recursive Definition of Special Functions", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/functional_equation/analytic_conditional_functional_equation/recursive_definition_of_special_functions/recursive_definition_of_special_functions.html", mainPath: ["0:3:30:304:3044:30441:304411"], released: 0, description: "Γ 関数の関係式 $\Gamma(x+1) = x \Gamma(x)$、ベッセル関数の漸化式 $J_{\nu-1}(z) + J_{\nu+1}(z) = \frac{2\nu}{z}{} J_{\nu}(z)$" },
        { id: 304412, label: "可微分・解析性仮定下の一般論", labelEn: "General Theory in the Assumption of Differentiability and Analyticity", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/functional_equation/analytic_conditional_functional_equation/general_theory_in_the_assumption_of_differentiability_and_analyticity/general_theory_in_the_assumption_of_differentiability_and_analyticity.html", mainPath: ["0:3:30:304:3044:30441:304412"], released: 0, description: "解析接続を用いる関数方程式の解構成" },
        { id: 304413, label: "複素解析的関数方程式", labelEn: "Complex Analytic Functional Equations", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/functional_equation/analytic_conditional_functional_equation/complex_analytic_functional_equation/complex_analytic_functional_equation.html", mainPath: ["0:3:30:304:3044:30441:304413"], released: 0, description: "両側留数定理に基づく恒等式、リーマンζ関数の関数方程式" },
        // 離散時間系：差分・漸化式30442
        { id: 304420, label: "線形差分方程式", labelEn: "Linear Difference Equations", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/functional_equation/discrete-time_functional_equation/linear_difference_equation/linear_difference_equation.html", mainPath: ["0:3:30:304:3044:30442:304420"], released: 0, description: "定数係数型：$\sum_{k=0}^{m} a_{k} y_{n+k} = g(n)$、変数係数型" },
        { id: 304421, label: "非線形漸化式", labelEn: "Nonlinear Evolution Equations", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/functional_equation/discrete-time_functional_equation/nonlinear_difference_equation/nonlinear_difference_equation.html", mainPath: ["0:3:30:304:3044:30442:304421"], released: 0, description: "ロジスティック写像 $x_{n+1} = r x_{n} (1 - x_{n})$" },
        { id: 304422, label: "q-差分方程式", labelEn: "q-Difference Equations", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/functional_equation/discrete-time_functional_equation/q-difference_equation/q-difference_equation.html", mainPath: ["0:3:30:304:3044:30442:304422"], released: 0, description: "基数変換を伴う離散変分" },
        { id: 304423, label: "時間スケール解析", labelEn: "Time-Scale Calculus", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/functional_equation/discrete-time_functional_equation/time-scale_calculus/time-scale_calculus.html", mainPath: ["0:3:30:304:3044:30442:304423"], released: 0, description: "離散・連続を統一する動的方程式" },
        // 連続時間系：微分・積分方程式30443
        { id: 304430, label: "関数微分方程式", labelEn: "Functional Differential Equations", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/functional_equation/continuous-time_functional_equation/functional_differential_equation/functional_differential_equation.html", mainPath: ["0:3:30:304:3044:30443:304430"], released: 0, description: "遅延微分方程式：$\dot{y}(t) = f(t, y(t), y(t-\tau))$、先進微分方程式" },
        { id: 304431, label: "常微分方程式", labelEn: "Ordinary Differential Equations", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/functional_equation/continuous-time_functional_equation/ordinary_differential_equation/ordinary_differential_equation.html", mainPath: ["0:3:30:304:3044:30443:304431"], released: 0, description: "線形・非線形、初期値問題・境界値問題" },
        { id: 304432, label: "偏微分方程式", labelEn: "Partial Differential Equations", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/functional_equation/continuous-time_functional_equation/partial_differential_equation/partial_differential_equation.html", mainPath: ["0:3:30:304:3044:30443:304432"], released: 0, description: "楕円型／放物型／双曲型の一般形" },
        { id: 304433, label: "積分方程式", labelEn: "Integral Equations", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/functional_equation/continuous-time_functional_equation/integral_equation/integral_equation.html", mainPath: ["0:3:30:304:3044:30443:304433"], released: 0, description: "Fredholm 第1・第2種、、Volterra型" },
        { id: 304434, label: "フラクショナル（分数階）方程式", labelEn: "Fractional Order Equations", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/functional_equation/continuous-time_functional_equation/fractional_order_equation/fractional_order_equation.html", mainPath: ["0:3:30:304:3044:30443:304434"], released: 0, description: "非整数次微分・積分を含むモデル" },
        // 関数解析的・作用素論的アプローチ30444
        { id: 304440, label: "バナッハ・ヒルベルト空間上の作用素方程式", labelEn: "Operator Equations on Banach-Hilbert Space", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/functional_equation/approach_to_functional_analysis_and_operator_theory/operator_equations_on_banach-hilbert_space/operator_equations_on_banach-hilbert_space.html", mainPath: ["0:3:30:304:3044:30444:304440"], released: 0, description: "$(I - K) f = g$（Fredholm 理論）" },
        { id: 304441, label: "スペクトル理論", labelEn: "Spectral Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/functional_equation/approach_to_functional_analysis_and_operator_theory/spectral_theory/spectral_theory.html", mainPath: ["0:3:30:304:3044:30444:304441"], released: 0, description: "固有値問題としての関数方程式" },
        { id: 304442, label: "分布・超関数論による拡張", labelEn: "Distribution and Hyperfunction Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/functional_equation/approach_to_functional_analysis_and_operator_theory/distribution_and_hyperfunction_theory/distribution_and_hyperfunction_theory.html", mainPath: ["0:3:30:304:3044:30444:304442"], released: 0, description: "シュワルツ分布における方程式解" },
        // 力学系30445
        { id: 304450, label: "不変測度・正則写像の方程式", labelEn: "Invariance of Measures and Regular Maps", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/functional_equation/mechanical_systems/invariance_of_measures_and_regular_map/invariance_of_measures_and_regular_map.html", mainPath: ["0:3:30:304:3044:30445:304450"], released: 0, description: "Perron–Frobenius 方程式" },
        { id: 304451, label: "リャプノフ関数方程式", labelEn: "Lyapunov Functional Equations", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/functional_equation/mechanical_systems/lyapunov_functional_equation/lyapunov_functional_equation.html", mainPath: ["0:3:30:304:3044:30445:304451"], released: 0, description: "安定性解析のための不変関数" },
        { id: 304452, label: "フラクタル生成・自己相似方程式", labelEn: "Fractal Generation and Self-Similar Equations", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/functional_equation/mechanical_systems/self-similar_equation/self-similar_equation.html", mainPath: ["0:3:30:304:3044:30445:304452"], released: 0, description: "IFS（Iterated Function System）の自己準同型式" },

        // 深さ7
        // 古典論理学301000
        { id: 3010000, label: "命題論理", labelEn: "Propositional Logic", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/foundations_of_mathematics/mathematical_logic/formalism/classical_logic/propositional_logic/propositional_logic.html", mainPath: ["0:3:30:301:3010:30100:301000:3010000"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        { id: 3010001, label: "述語論理", labelEn: "Propositional Logic", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/foundations_of_mathematics/mathematical_logic/formalism/classical_logic/propositional_logic/propositional_logic.html", mainPath: ["0:3:30:301:3010:30100:301000:3010001"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        // 様相論理301001
        { id: 3010010, label: "可能世界意味論", labelEn: "Possible Worlds Semantics", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/foundations_of_mathematics/mathematical_logic/formalism/modal_logic/possible_worlds_semantics/possible_worlds_semantics.html", mainPath: ["0:3:30:301:3010:30100:301001:3010010"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        { id: 3010011, label: "時相論理", labelEn: "Temporal Logic", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/foundations_of_mathematics/mathematical_logic/formalism/modal_logic/temporal_logic/temporal_logic.html", mainPath: ["0:3:30:301:3010:30100:301001:3010011"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        // ヒルベルト・プログラム301020
        { id: 3010200, label: "有限の立場", labelEn: "Finitary Standpoint", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/foundations_of_mathematics/mathematical_logic/proof_theory/hilbert_program/finitary_standpoint/finitary_standpoint.html", mainPath: ["0:3:30:301:3010:30102:301020:3010200"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        { id: 3010201, label: "無矛盾性証明", labelEn: "Consistency Proofs", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/foundations_of_mathematics/mathematical_logic/proof_theory/hilbert_program/consistency_proof/consistency_proof.html", mainPath: ["0:3:30:301:3010:30102:301020:3010201"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        { id: 3010202, label: "イプシロン算法", labelEn: "Epsilon-Calculus", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/foundations_of_mathematics/mathematical_logic/proof_theory/hilbert_program/epsilon-calculus/epsilon-calculus.html", mainPath: ["0:3:30:301:3010:30102:301020:3010202"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        // ツェルメロ＝フレンケル集合論301110
        { id: 3011100, label: "基礎概念", labelEn: "Fundamental Concepts", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/foundations_of_mathematics/set_theory/axiomatic_set_theory/zermelo_fraenkel_choice_set_theory/fundamental_concepts/fundamental_concepts.html", mainPath: ["0:3:30:301:3011:30111:301110:3011100"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        // 内部モデル理論 301120
        { id: 3011200, label: "構成可能集合", labelEn: "Constructible Universe (L)", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/foundations_of_mathematics/set_theory/metamathematics/inner_model_theory/constructible_universe/constructible_universe.html", mainPath: ["0:3:30:301:3011:30112:301120:3011200"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        // 強制法 301121
        { id: 3011210, label: "連続体仮説の独立性", labelEn: "Independence of the Continuum Hypothesis", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/foundations_of_mathematics/set_theory/metamathematics/forcing/ch_independence/ch_independence.html", mainPath: ["0:3:30:301:3011:30112:301121:3011210"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        { id: 3011211, label: "強制関係とブール値モデル", labelEn: "Forcing Relation and Boolean-Valued Models", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/foundations_of_mathematics/set_theory/metamathematics/forcing/boolean_valued_models/boolean_valued_models.html", mainPath: ["0:3:30:301:3011:30112:301121:3011211"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        // 巨大基数論 301122
        { id: 3011220, label: "到達不能基数", labelEn: "Inaccessible Cardinals", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/foundations_of_mathematics/set_theory/metamathematics/large_cardinals/inaccessible_cardinals/inaccessible_cardinals.html", mainPath: ["0:3:30:301:3011:30112:301122:3011220"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        { id: 3011221, label: "可測基数", labelEn: "Measurable Cardinals", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/foundations_of_mathematics/set_theory/metamathematics/large_cardinals/measurable_cardinals/measurable_cardinals.html", mainPath: ["0:3:30:301:3011:30112:301122:3011221"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        { id: 3011222, label: "超コンパクト基数・膨大基数", labelEn: "Supercompact and Huge Cardinals", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/foundations_of_mathematics/set_theory/metamathematics/large_cardinals/supercompact_huge/supercompact_huge.html", mainPath: ["0:3:30:301:3011:30112:301122:3011222"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        // 構成的集合論 301140
        { id: 3011400, label: "直観主義論理に基づく体系", labelEn: "Intuitionistic Set Theories (IZF, CZF)", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/foundations_of_mathematics/set_theory/extended_set_theory/constructive_set_theory/intuitionistic_set_theories/intuitionistic_set_theories.html", mainPath: ["0:3:30:301:3011:30114:301140:3011400"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        { id: 3011401, label: "トポス理論的集合論", labelEn: "Topos-Theoretic Set Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/foundations_of_mathematics/set_theory/extended_set_theory/constructive_set_theory/topos_set_theory/topos_set_theory.html", mainPath: ["0:3:30:301:3011:30114:301140:3011401"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        // 非整礎集合論 301141
        { id: 3011410, label: "反基礎公理・超集合", labelEn: "Anti-Foundation Axiom and Hypersets", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/foundations_of_mathematics/set_theory/extended_set_theory/non_well_founded_set_theory/afa_hypersets/afa_hypersets.html", mainPath: ["0:3:30:301:3011:30114:301141:3011410"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        // 内部集合論 301143
        { id: 3011430, label: "超準解析の基礎（構文論）", labelEn: "Foundations of Non-standard Analysis (Syntactic)", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/foundations_of_mathematics/set_theory/extended_set_theory/internal_set_theory/non_standard_analysis_foundations/non_standard_analysis_foundations.html", mainPath: ["0:3:30:301:3011:30114:301143:3011430"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        // 原始的な代数的構造303000
        { id: 3030000, label: "マグマ", labelEn: "Magma", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/abstract_algebra/algebraic_structures/primitive_structures/magma/magma.html", mainPath: ["0:3:30:303:3030:30300:303000:3030000"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        { id: 3030001, label: "半群", labelEn: "Semigroup", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/abstract_algebra/algebraic_structures/primitive_structures/semigroup/semigroup.html", mainPath: ["0:3:30:303:3030:30300:303000:3030001"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        { id: 3030002, label: "モノイド", labelEn: "Monoid", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/abstract_algebra/algebraic_structures/primitive_structures/monoid/monoid.html", mainPath: ["0:3:30:303:3030:30300:303000:3030002"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        // 群論303001
        { id: 3030010, label: "群作用・対称群", labelEn: "Group Actions and Symmetric Groups", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/abstract_algebra/algebraic_structures/group_theory/group_actions/group_actions.html", mainPath: ["0:3:30:303:3030:30300:303001:3030010"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        //{ id: 3030011, label: "表現論", labelEn: "Representation Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/abstract_algebra/algebraic_structures/group_theory/representation_theory/representation_theory.html", mainPath: ["0:3:30:303:3030:30300:303001:3030011"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        { id: 3030012, label: "ホモロジー代数への接続", labelEn: "Connection to Homological Algebra", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/abstract_algebra/algebraic_structures/group_theory/homological_connection/homological_connection.html", mainPath: ["0:3:30:303:3030:30300:303001:3030012"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        // 環論303002
        { id: 3030020, label: "可換環論", labelEn: "Commutative Ring Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/abstract_algebra/algebraic_structures/ring_theory/commutative_ring/commutative_ring.html", mainPath: ["0:3:30:303:3030:30300:303002:3030020"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        { id: 3030021, label: "非可換環論", labelEn: "Noncommutative Ring Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/abstract_algebra/algebraic_structures/ring_theory/noncommutative_ring/noncommutative_ring.html", mainPath: ["0:3:30:303:3030:30300:303002:3030021"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        { id: 3030030, label: "ガロア理論", labelEn: "Galois Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/galois_theory/galois_theory.html", mainPath: ["0:3:30:303:3030:30300:303003:3030030"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        { id: 3030031, label: "代数方程式論", labelEn: "Theory of Algebraic Equations", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/algebraic_equations/algebraic_equations.html", mainPath: ["0:3:30:303:3030:30300:303003:3030031"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        // 実数の構成304004
        { id: 3040040, label: "有理数と無理数", labelEn: "Rational and Irrational Numbers", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/foundations_of_analysis/theory_of_real_numbers/construction_of_real_numbers/rational_and_irrational_numbers/rational_and_irrational_numbers.html", mainPath: ["0:3:30:304:3040:30400:304004:3040040"], released: 0 },
        { id: 3040041, label: "デデキント切断", labelEn: "Dedekind Cut", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/foundations_of_analysis/theory_of_real_numbers/construction_of_real_numbers/dedekind_cut/dedekind_cut.html", mainPath: ["0:3:30:304:3040:30400:304004:3040041"], released: 0 },
        { id: 3040042, label: "完備性（連続体の性質）", labelEn: "Completeness of the Continuum", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/foundations_of_analysis/theory_of_real_numbers/construction_of_real_numbers/completeness_of_the_continuum/completeness_of_the_continuum.html", mainPath: ["0:3:30:304:3040:30400:304004:3040042"], released: 0 },
        { id: 3040043, label: "コーシー列による体論的構成", labelEn: "Cauchy Sequence Construction of Fields", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/foundations_of_analysis/theory_of_real_numbers/construction_of_real_numbers/cauchy_sequence_construction/cauchy_sequence_construction.html", mainPath: ["0:3:30:304:3040:30400:304004:3040043"], released: 0 },
        // ルベーグ積分304121
        { id: 3041210, label: "収束定理（優収束定理、ファトウの補題）", labelEn: "Convergence Theorems", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/calculus/integral_calculus/lebesgue_integral/convergence_theorems/convergence_theorems.html", mainPath: ["0:3:30:304:3041:30412:304121:3041210"], released: 0 },
        // トポロジカル・ベクトル空間304300
        { id: 3043000, label: "$L^{p}$空間", labelEn: "$L^{p}$ Space", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/functional_analysis/function_space_theory/topological_vector_space/L_p_space/L_p_space.html", mainPath: ["0:3:30:304:3043:30430:304300:3043000"], released: 0 },
        { id: 3043001, label: "半ノルム空間", labelEn: "Half-Norm Space", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/functional_analysis/function_space_theory/topological_vector_space/half-norm_space/half-norm_space.html", mainPath: ["0:3:30:304:3043:30430:304300:3043001"], released: 0 },
        { id: 3043002, label: "局所凸空間", labelEn: "Locally Convex Space", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/functional_analysis/function_space_theory/topological_vector_space/locally_convex_space/locally_convex_space.html", mainPath: ["0:3:30:304:3043:30430:304300:3043002"], released: 0 },
        { id: 3043003, label: "フレシェ空間", labelEn: "Freschet Space", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/functional_analysis/function_space_theory/topological_vector_space/freschet_space/freschet_space.html", mainPath: ["0:3:30:304:3043:30430:304300:3043003"], released: 0 },
        { id: 3043004, label: "LF空間", labelEn: "LF Space", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/functional_analysis/function_space_theory/topological_vector_space/lf_space/lf_space.html", mainPath: ["0:3:30:304:3043:30430:304300:3043004"], released: 0, description: "フレシェ空間の可算帰納極限" },
        // 群上の調和解析（抽象調和解析）304340
        { id: 3043400, label: "アーベル群上のPontryagin双対性", labelEn: "Pontryagin Duality for Abelian Groups", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/functional_analysis/harmonic_analysis/pontryagin_duality_for_abelian_groups/pontryagin_duality_for_abelian_groups.html", mainPath: ["0:3:30:304:3043:30434:304340:3043400"], released: 0 },
        { id: 3043401, label: "コンパクト群上のピーター–ウェイル理論", labelEn: "Peter–Weyl Theorem for Compact Groups", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/functional_analysis/harmonic_analysis/peter-weyl_theorem_for_compact_groups/peter-weyl_theorem_for_compact_groups.html", mainPath: ["0:3:30:304:3043:30434:304340:3043401"], released: 0 },
        { id: 3043402, label: "非可換群とユニタリ表現", labelEn: "Non-Abelian Groups and Unitary Representations", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/functional_analysis/harmonic_analysis/non-abelian_groups_and_unitary_representations/non-abelian_groups_and_unitary_representations.html", mainPath: ["0:3:30:304:3043:30434:304340:3043402"], released: 0 },
        // 実変数調和解析（Calderón–Zygmund理論）304341
        { id: 3043410, label: "特異積分作用素", labelEn: "Singular Integral Operator", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/functional_analysis/harmonic_analysis/singular_integral_operator/singular_integral_operator.html", mainPath: ["0:3:30:304:3043:30434:304341:3043410"], released: 0 },
        { id: 3043411, label: "Hardy空間 $H^p$", labelEn: "Hardy Space $H^p$", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/functional_analysis/harmonic_analysis/hardy_space/hardy_space.html", mainPath: ["0:3:30:304:3043:30434:304341:3043411"], released: 0 },
        { id: 3043412, label: "BMO空間", labelEn: "BMO Space (Bounded Mean Oscillation Space)", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/functional_analysis/harmonic_analysis/bmo_space/bmo_space.html", mainPath: ["0:3:30:304:3043:30434:304341:3043412"], released: 0 },
        { id: 3043413, label: "Maximal関数とLittlewood–Paley理論", labelEn: "Maximal Functions and Littlewood–Paley Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/functional_analysis/harmonic_analysis/littlewood-paley_theory/littlewood-paley_theory.html", mainPath: ["0:3:30:304:3043:30434:304341:3043413"], released: 0 },
        // 変換解析304342
        { id: 3043420, label: "フーリエ解析", labelEn: "Fourier Analysis", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/functional_analysis/harmonic_analysis/transformation_analysis/fourier_analysis/fourier_analysis.html", mainPath: ["0:3:30:304:3043:30434:304342:3043420"], released: 0, description: "フーリエ変換の厳密理論、$L^2$上のユニタリ作用素" },
        { id: 3043421, label: "ラプラス解析", labelEn: "Laplace Analysis", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/functional_analysis/harmonic_analysis/transformation_analysis/laplace_analysis/laplace_analysis.html", mainPath: ["0:3:30:304:3043:30434:304342:3043421"], released: 0 },
        { id: 3043422, label: "ウェーブレット解析", labelEn: "Wavelet Analysis", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/functional_analysis/harmonic_analysis/transformation_analysis/wavelet_analysis/wavelet_analysis.html", mainPath: ["0:3:30:304:3043:30434:304342:3043422"], released: 0 },
        { id: 3043423, label: "スペクトル解析との統合", labelEn: "Spectral Analysis", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/functional_analysis/harmonic_analysis/transformation_analysis/spectral_analysis/spectral_analysis.html", mainPath: ["0:3:30:304:3043:30434:304342:3043423"], released: 0 },
        // 幾何学的調和解析304343
        { id: 3043430, label: "多様体上のフーリエ解析", labelEn: "Fourier Analysis on Manifolds", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/functional_analysis/harmonic_analysis/geometric_harmonic_analysis/fourier_analysis_on_manifolds/fourier_analysis_on_manifolds.html", mainPath: ["0:3:30:304:3043:30434:304343:3043430"], released: 0 },
        { id: 3043431, label: "ラプラシアン固有値問題とスペクトル分解", labelEn: "Laplacian Eigenvalue Problem", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/functional_analysis/harmonic_analysis/geometric_harmonic_analysis/laplacian_eigenvalue_problem/laplacian_eigenvalue_problem.html", mainPath: ["0:3:30:304:3043:30434:304343:3043431"], released: 0 },

        // 深さ8
        // 基礎概念 3011100
        { id: 30111000, label: "対応と写像", labelEn: "Correspondences and Mappings", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/foundations_of_mathematics/set_theory/axiomatic_set_theory/zfc/fundamental_concepts/mappings/mappings.html", mainPath: ["0:3:30:301:3011:30111:301110:3011100:30111000"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        { id: 30111001, label: "関係", labelEn: "Relations", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/foundations_of_mathematics/set_theory/axiomatic_set_theory/zfc/fundamental_concepts/relations/relations.html", mainPath: ["0:3:30:301:3011:30111:301110:3011100:30111001"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        { id: 30111002, label: "添字付けられた族", labelEn: "Indexed Families", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/foundations_of_mathematics/set_theory/axiomatic_set_theory/zfc/fundamental_concepts/indexed_families/indexed_families.html", mainPath: ["0:3:30:301:3011:30111:301110:3011100:30111002"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        { id: 30111003, label: "選択公理", labelEn: "Axiom of Choice", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/foundations_of_mathematics/set_theory/axiomatic_set_theory/zfc/fundamental_concepts/axiom_of_choice/axiom_of_choice.html", mainPath: ["0:3:30:301:3011:30111:301110:3011100:30111003"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        { id: 30111004, label: "順序集合", labelEn: "Ordered Sets", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/foundations_of_mathematics/set_theory/axiomatic_set_theory/zfc/fundamental_concepts/ordered_sets/ordered_sets.html", mainPath: ["0:3:30:301:3011:30111:301110:3011100:30111004"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        { id: 30111005, label: "累積的階層", labelEn: "Cumulative Hierarchy", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/foundations_of_mathematics/set_theory/axiomatic_set_theory/zfc/fundamental_concepts/cumulative_hierarchy/cumulative_hierarchy.html", mainPath: ["0:3:30:301:3011:30111:301110:3011100:30111005"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        // 可換環論3030020
        { id: 30300200, label: "加群論", labelEn: "Module Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/abstract_algebra/algebraic_structures/ring_theory/commutative_ring/module_theory/module_theory.html", mainPath: ["0:3:30:303:3030:30300:303002:3030020:30300200"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        { id: 30300202, label: "代数幾何学", labelEn: "Algebraic Geometry", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/abstract_algebra/algebraic_structures/ring_theory/commutative_ring/algebraic_geometry/algebraic_geometry.html", mainPath: ["0:3:30:303:3030:30300:303002:3030020:30300202"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        { id: 30300210, label: "多元環論", labelEn: "Algebras over a Ring", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/algebras_over_ring/algebras_over_ring.html", mainPath: ["0:3:30:303:3030:30300:303002:3030021:30300210"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        { id: 30300211, label: "ワイル代数", labelEn: "Weyl Algebra", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/weyl_algebra/weyl_algebra.html", mainPath: ["0:3:30:303:3030:30300:303002:3030021:30300211"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        { id: 30300310, label: "解の可解性・代数的閉包・構造理論", labelEn: "Solvability and Algebraic Closure", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/algebraic_solvability/algebraic_solvability.html", mainPath: ["0:3:30:303:3030:30300:303003:3030031:30300310"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        // 有理数と無理数3040040
        { id: 30400400, label: "超越数論", labelEn: "Transcendental Number Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/foundations_of_analysis/theory_of_real_numbers/construction_of_real_numbers/rational_and_irrational_numbers/transcendental_number_theory/transcendental_number_theory.html", mainPath: ["0:3:30:304:3040:30400:304004:3040040:30400400"], released: 0 },
        // $L^{p}$空間3043000
        { id: 30430000, label: "ノルム空間", labelEn: "Norm Space", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/functional_analysis/function_space_theory/topological_vector_space/L_p_space/norm_space/norm_space.html", mainPath: ["0:3:30:304:3043:30430:304300:3043000:30430000"], released: 0 },

        // 深さ9
        // 順序集合 30111004
        { id: 301110040, label: "整列順序と順序数", labelEn: "Well-orderings and Ordinals", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/foundations_of_mathematics/set_theory/axiomatic_set_theory/zfc/fundamental_concepts/ordered_sets/ordinals/ordinals.html", mainPath: ["0:3:30:301:3011:30111:301110:3011100:30111004:301110040"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        { id: 301110041, label: "基数", labelEn: "Cardinals", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/foundations_of_mathematics/set_theory/axiomatic_set_theory/zfc/fundamental_concepts/ordered_sets/cardinals/cardinals.html", mainPath: ["0:3:30:301:3011:30111:301110:3011100:30111004:301110041"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        { id: 301110042, label: "濃度", labelEn: "Cardinalities", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/foundations_of_mathematics/set_theory/axiomatic_set_theory/zfc/fundamental_concepts/ordered_sets/cardinality/cardinality.html", mainPath: ["0:3:30:301:3011:30111:301110:3011100:30111004:301110042"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        { id: 301110043, label: "アレフ数・ベート数", labelEn: "Aleph and Beth Numbers", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/foundations_of_mathematics/set_theory/axiomatic_set_theory/zfc/fundamental_concepts/ordered_sets/aleph_beth/aleph_beth.html", mainPath: ["0:3:30:301:3011:30111:301110:3011100:30111004:301110043"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        // 加群論30300200
        { id: 303002000, label: "ホモロジー代数", labelEn: "Homological Algebra", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/homological_algebra/homological_algebra.html", mainPath: ["0:3:30:303:3030:30300:303002:3030020:30300200:303002000"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        { id: 303002001, label: "導来関手・Ext, Tor", labelEn: "Derived Functors (Ext, Tor)", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/derived_functors/derived_functors.html", mainPath: ["0:3:30:303:3030:30300:303002:3030020:30300200:303002001"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        // 代数幾何学30300202
        { id: 303002020, label: "代数多様体・スキーム・層理論", labelEn: "Algebraic Varieties, Schemes, and Sheaf Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/schemes_sheaves/schemes_sheaves.html", mainPath: ["0:3:30:303:3030:30300:303002:3030020:30300202:303002020"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        { id: 303002021, label: "層コホモロジー", labelEn: "Sheaf Cohomology", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/sheaf_cohomology/sheaf_cohomology.html", mainPath: ["0:3:30:303:3030:30300:303002:3030020:30300202:303002021"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        // 多元環論30300210
        { id: 303002100, label: "テンソル代数", labelEn: "Tensor Algebra", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/tensor_algebra/tensor_algebra.html", mainPath: ["0:3:30:303:3030:30300:303002:3030021:30300210:303002100"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        { id: 303002101, label: "リー代数", labelEn: "Lie Algebra", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/lie_algebra/lie_algebra.html", mainPath: ["0:3:30:303:3030:30300:303002:3030021:30300210:303002101"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        // ノルム空間30430000
        { id: 304300000, label: "バナッハ空間", labelEn: "Banach Space", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/functional_analysis/function_space_theory/topological_vector_space/L_p_space/norm_space/banach_space/banach_space.html", mainPath: ["0:3:30:304:3043:30430:304300:3043000:30430000:304300000"], released: 0 },
        { id: 304300001, label: "ヒルベルト空間", labelEn: "Hilbert Space", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/functional_analysis/function_space_theory/topological_vector_space/L_p_space/norm_space/hilbert_space/hilbert_space.html", mainPath: ["0:3:30:304:3043:30430:304300:3043000:30430000:304300001"], released: 0 },

        // 深さ10
        // ホモロジー代数303002000
        { id: 3030020000, label: "代数的トポロジー", labelEn: "Algebraic Topology", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/homological_algebra/homological_algebra.html", mainPath: ["0:3:30:303:3030:30300:303002:3030020:30300200:303002000:3030020000"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        // テンソル代数303002100
        { id: 3030021000, label: "線型代数学", labelEn: "Linear Algebra", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/linear_algebra/linear_algebra.html", mainPath: ["0:3:30:303:3030:30300:303002:3030021:30300210:303002100:3030021000"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        { id: 3030021001, label: "外積代数", labelEn: "Exterior Algebra", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/exterior_algebra/exterior_algebra.html", mainPath: ["0:3:30:303:3030:30300:303002:3030021:30300210:303002100:3030021001"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        { id: 3030021002, label: "対称代数", labelEn: "Symmetric Algebra", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/symmetric_algebra/symmetric_algebra.html", mainPath: ["0:3:30:303:3030:30300:303002:3030021:30300210:303002100:3030021002"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        { id: 3030021003, label: "クリフォード代数", labelEn: "Clifford Algebra", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/clifford_algebra/clifford_algebra.html", mainPath: ["0:3:30:303:3030:30300:303002:3030021:30300210:303002100:3030021003"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" },
        // リー代数303002101
        { id: 3030021010, label: "カッツ・ムーディー代数", labelEn: "Kac–Moody Algebra", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/kac_moody/kac_moody.html", mainPath: ["0:3:30:303:3030:30300:303002:3030021:30300210:303002101:3030021010"], released: 0, isPaid: 1, iconClass: "fa-folder fa-fw" }
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
        {
            id: 30, label: "数学", labelEn: "Mathematics", sections: [
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
            ], keywords: ["学問", "数学", "情報理論", "物理学", "プログラミング", "教育"], iconClass: "fa-folder fa-fw"
        },
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
        {
            id: 301, label: "数学基礎論", labelEn: "Foundations of Mathematics", description: "数学基礎論の全体像を解説。構文論と意味論、モデル理論、証明論、型理論、集合論、圏論など、現代数学の基礎を支える主要分野をPythonの実装例とともに学べる包括的な入門記事。", sections: [
                {
                    h2: "概要：数学を「数学」する",
                    text: "数学基礎論（Foundations of Mathematics）は、数学的な推論や証明、そして数学的構造そのものを数学的な手法を用いて研究する分野である。一般に、数学は数や図形についての真理を探究するが、論理学は「真理とは何か」「証明とは何か」というメタな問いを対象とする。"
                },
                {
                    text: "19世紀末から20世紀初頭にかけて、カントール（Cantor）による集合論の創始やパラドックスの発見を契機に、数学を厳密な基礎の上に再構築しようとする機運が高まりました。ヒルベルト（Hilbert）は、数学の無矛盾性を有限の立場から確立しようとする「ヒルベルト・プログラム」を提唱し、これが現代の証明論の源流となった。また、タルスキ（Tarski）らによる意味論の形式化はモデル理論へと発展し、ゲーデル（Gödel）の不完全性定理やチャーチ（Church）、チューリング（Turing）による計算可能性の研究と相まって、現代数学の深淵な構造を明らかにしてきた。"
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
            ], keywords: ["ゲーデル", "Pythonによる解説", "ヒルベルト・プログラム"], iconClass: "fa-folder fa-fw"
        },
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
        { id: 3011, label: "集合論", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/foundations_of_mathematics/set_theory/set_theory.html", totalViews: 90210, weeklyViews: 420, monthlyViews: 1800 },
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
                s += `<a href="${node.url}" class="preview-link" data-title="${(node.label || '').replace(/\"/g, '&quot;')}" data-description="${(desc || '').replace(/\"/g, '&quot;')}" data-image="${img}">${node.label}</a>`;
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
        const escapeHtml = (str) => String(str).replace(/[&<>"]+/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch] || ch));
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
        const escapeHtml = (str) => String(str).replace(/[&<>"]+/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch] || ch));
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
                    const to = parts[i + 1];
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
        try { const sp = document.getElementById('contentIntegSearch'); if (sp) sp.style.display = 'none'; } catch (e) { }
        try { const rc = document.getElementById('contentIntegSearchResult'); if (rc) rc.style.display = 'block'; } catch (e) { }

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

    function searchBreadcrumbs(allData, current) {
        // options:
        //  - includeHome: boolean (first column only)
        //  - treatAsMain: boolean (mainPath column: exclude last id because it's current)
        const renderColumnFromPath = (pathStr, options = {}) => {
            const { includeHome = false, treatAsMain = false } = options;
            if (!pathStr || typeof pathStr !== 'string') return '';
            const parts = pathStr.split(':').map(s => parseInt(s, 10)).filter(n => Number.isFinite(n));
            if (parts.length === 0) return '';

            let html = `<div class="breadcrumb_list_part">`;
            if (includeHome) {
                html += `<span>Home</span>`;
            }

            // path からリンクとしてレンダリングするエンドポイントインデックスを決定する
            const lastIndexToRender = treatAsMain ? parts.length - 2 : parts.length - 1; // main: exclude last (current)
            for (let i = 0; i <= lastIndexToRender; i++) {
                const id = parts[i];
                if (i === 0 && includeHome === false) {
                    // optionally skip adding separator for very first element if Home not present
                }
                const pathNode = allData.find(n => n && n.id === id);
                if (!pathNode) continue;
                html += `<span class="sp" style="margin-right:5px; margin-left:5px;"><span class="fa fa-angle-right" aria-hidden="true"></span></span>`;
                html += `${pathNode.label}`;
            }

            // For mainPath column: append the current article label (no link) as final item
            if (treatAsMain) {
                html += `<span class="sp" style="margin-right:5px; margin-left:5px;"><span class="fa fa-angle-right" aria-hidden="true"></span></span>`;
                html += `<span>${current.label || ''}</span>`;
            }

            html += `</div>`;
            return html;
        };

        // collect mainPath (prefer first) and auxPaths (array)
        const getFirstPath = (node) => {
            if (!node) return '';
            if (Array.isArray(node.mainPath) && node.mainPath.length > 0) return node.mainPath[0];
            if (typeof node.mainPath === 'string') return node.mainPath;
            return '';
        };
        const mainPath = getFirstPath(current);
        const auxPaths = [];
        if (current && current.auxPath) {
            if (Array.isArray(current.auxPath)) {
                current.auxPath.forEach(p => { if (p && p !== mainPath) auxPaths.push(p); });
            } else if (typeof current.auxPath === 'string' && current.auxPath !== mainPath) {
                auxPaths.push(current.auxPath);
            }
        }

        // 列の構築: 最初にメイン列 (Home を含む)、次に auxPath ごとに 1 つの列
        let finalHtml = '';
        if (mainPath) {
            finalHtml += renderColumnFromPath(mainPath, { includeHome: true, treatAsMain: true });
        } else {
            // fallback: only Home + current label
            finalHtml += `<div class="breadcrumb_list_part">`;
            finalHtml += `<span class="sp" style="margin-right:5px; margin-left:5px;"><span class="fa fa-angle-right" aria-hidden="true"></span></span>`;
            finalHtml += `<span>${current.label || ''}</span></div>`;
        }

        // auxPath 列も Home を先頭に表示し、最後に current のラベルを付けているが、それぞれを非表示にすることもできる。可能性としては、Git のブランチの様に表示できないか検討中
        auxPaths.forEach(ap => {
            finalHtml += renderColumnFromPath(ap, { includeHome: true, treatAsMain: true });
        });

        return finalHtml;
    }

    /**
     * 公開日/編集日
     */
    function searchDateInfo(current) {
        const container = document.getElementById('date-info');
        if (!container) return;

        // ISO文字列を想定 (例: "2020-02-15T09:40:52Z")
        const rawPub = current.datePublished || null;
        const rawRev = current.dateModified || null;

        // Date に安全に変換
        const toDateSafe = (v) => {
            if (!v) return null;
            if (v instanceof Date) return isNaN(v) ? null : v;
            const d = new Date(v);
            return isNaN(d) ? null : d;
        };

        const pubDateObj = toDateSafe(rawPub);
        let revDateObj = toDateSafe(rawRev);

        // ===== 応急処置ロジック =====
        // 公開日 > 編集日 の場合は 編集日 = 公開日 に補正
        if (pubDateObj && revDateObj && pubDateObj.getTime() > revDateObj.getTime()) {
            console.warn('[date-info] dateModified is earlier than datePublished. ', { datePublished: pubDateObj.toISOString(), dateModified: revDateObj.toISOString(), source: current });
            revDateObj = new Date(pubDateObj.getTime());
        }

        /**
         * Date → ISO文字列
         */
        const toISOStringSafe = (d) => (d ? d.toISOString() : '');

        const pubDate = toISOStringSafe(pubDateObj);
        const revDate = toISOStringSafe(revDateObj);

        let html = '';
        if (pubDate) {
            const display = pubDate.split('T')[0];
            const parts = display.split('-');
            const y = parts[0] || '';
            const m = parts[1] || '';
            const d = parts[2] || '';
            html += `<span><i class="fa fa-pencil"></i>&ensp;<time datetime="${pubDate}" title="${pubDate}">公開日: <span class="date-year">${y}</span><span class="hyphen">年</span><span class="date-month">${m}</span><span class="hyphen">月</span><span class="date-day">${d}</span>日</time></span>`;
        }
        if (revDate) {
            const display = revDate.split('T')[0];
            const parts = display.split('-');
            const y = parts[0] || '';
            const m = parts[1] || '';
            const d = parts[2] || '';
            html += `<span style="margin-left:0.8em;"><i class="fa fa-refresh"></i>&ensp;<time datetime="${revDate}" title="${revDate}" class="updated">更新: <span class="date-year">${y}</span><span class="hyphen">年</span><span class="date-month">${m}</span><span class="hyphen">月</span><span class="date-day">${d}</span>日</time></span>`;
        }

        return html;
    }

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
                    resultHtml += '<p class="search-query-info" style="overflow-wrap: break-word;">クエリ: ' + (String(qstr).replace(/</g, '&lt;')) + ' ' + frag + '</p>';
                }
            }
        } catch (e) {
            // ignore
        }

        // サムネイル等の存在チェック用ヘルパ
        const thumbHtml = (node) => {
            if (!node) return '';
            if (Array.isArray(node.thumbnailUrl) && node.thumbnailUrl.length > 0 && node.thumbnailUrl[1]) {
                const src = node.thumbnailUrl[1];
                return `<img class="search-result-thumb" src="${src}" alt="" referrerpolicy="no-referrer" loading="lazy" decoding="async" onerror="this.parentNode.querySelector('.js-aarecord-list-fallback-cover').classList.remove('hidden'); this.parentNode.removeChild(this)">`;
            }
            return ''; // サムネイルが無ければ空
        };

        if (results.length === 0) {
            resultHtml += '<p>マッチする結果がありません。</p>';
        } else {
            resultHtml += '<div class="article-list">';
            for (const result of results) {
                const targetPage = findTargetPage(result.id) || {};
                const targetThumb = thumbHtml(targetPage);
                resultHtml += '<div class="article-item">';
                resultHtml += `<a href="${targetPage.url}" class="img-container-link">`;
                resultHtml += `<div id="" class="img-container">`;
                resultHtml += `${targetThumb}`;
                resultHtml += '</div> <!-- img-container -->';
                resultHtml += '</a> <!-- img-container-link -->';
                resultHtml += '<div class="search-result-label">';
                resultHtml += '<div>';
                resultHtml += '<div class="search-result-breadcrumb_list">';
                resultHtml += '<div id="date-info" class="date">';
                resultHtml += searchBreadcrumbs(siteData, targetPage);
                resultHtml += '</div> <!-- date -->';
                resultHtml += '</div> <!-- search-result-breadcrumb_list -->';
                resultHtml += `<a href="${targetPage.url}" class="search-result-title-link">`;
                resultHtml += `<strong> ${targetPage.label || 'N/A'} </strong> (${targetPage.labelEn})`;
                resultHtml += '</a> <!-- search-result-title-link -->';
                resultHtml += '</div>';
                resultHtml += searchDateInfo(targetPage);
                resultHtml += `<div style="display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 3; overflow: hidden; line-height: 1.3;">${(result.sections?.[0]?.text || '').replace(/</g, '&lt;')}</div>`;
                resultHtml += '</div> <!-- search-result-label -->';
                resultHtml += '</div> <!-- article-item -->';
            }
            resultHtml += '</div>';
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
