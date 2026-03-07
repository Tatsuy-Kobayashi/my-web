// ----------------------------------------------------------------------------
// ファイル名    : siteCategoricalDiagram.js
// 名称          : サイト圏図式生成スクリプト
// 内容          : サイト内の学問体系を圏図式で表現するためのデータロードと初期化処理
// このプログラムの著作権及び、このプログラムに関する技術は（株）Fibrantixがその知的財産権を所有し
// ており、所有者の事前の許可なくその全部又は一部を問わず、第三者に開示してはならない。
// Copyright(c) 2025 Fibrantix CO.,LTD. All Rights Reserved
// ----------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', function () {
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
    console.log('[INIT] Loading nodesData...');
    const nodesData = [
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
        { id: 500, label: "IT用語", labelEn: "IT Terms", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/applied_science/informatics/it_terms/it_terms.html", mainPath: ["0:5:50:500"], released: 1 },
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

    // ------------------------
    // データ（エッジ）
    // ------------------------
    // from → to の方向性を持つ
    // ------------------------
    /*console.log('[INIT] Loading edgesData...');
    const edgesData = [
        { from: 0, to: 1 },
        { from: 0, to: 2 },
        { from: 0, to: 3 },
        { from: 0, to: 4 },
        { from: 0, to: 5 },
        { from: 0, to: 6 },

        { from: 1, to: 10 },
        { from: 1, to: 11 },
        { from: 3, to: 30 },
        { from: 3, to: 31 },
        { from: 4, to: 40 },

        { from: 30, to: 300 },
        { from: 30, to: 301 },
        { from: 30, to: 302 },
        { from: 30, to: 303 },
        { from: 30, to: 304 },

        { from: 304, to: 3040 }
    ];*/

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

    // ------------------------
    // 関数名   : buildEdgesFromPaths(filteredNodes)
    // 名称     : path からエッジ情報を生成する処理
    // 内容     : filteredNodes に含まれる path を元に、エッジ情報を生成する
    // 引数     : filteredNodes - ユーザ操作で選択されたノード配列
    // 戻り値   : edges - 生成されたエッジ配列
    // ------------------------
    function buildEdgesFromPaths(filteredNodes) {
        const visible = new Set(filteredNodes.map(n => n.id));
        const edges = [];
        // 重複エッジ防止用（from->to をキーにする）
        // ただし、同じ from->to でも main と aux が競合する場合、main を優先する仕様とする
        const dedup = new Map(); // Key: "from->to", Value: "main" | "aux"

        // 内部関数: パスからエッジを抽出して一時マップに登録
        const processPaths = (node, pathList, type) => {
            if (!pathList) return;
            for (const pathStr of pathList) {
                const parts = pathStr.split(":").map(Number);

                // mainPath: 末尾が自身のID
                // auxPath: 末尾が親ノードIDを指す（親 -> node のエッジを1本作る）
                let isValid = false;
                if (type === 'main') {
                    // mainPath は従来通り：末尾が自身のID
                    isValid = (parts[parts.length - 1] === node.id);
                } else if (type === 'aux') {
                    // auxPath は新仕様：末尾が親ノードのID
                    // したがって parts.length >= 1 であれば OK（末尾が何らかの親を指す）
                    isValid = (parts.length >= 1);
                }

                if (!isValid) {
                    console.warn(`[WARN] ${type}Path validation failed for node ${node.id}: ${pathStr}`);
                    continue;
                }

                for (let i = 0; i < parts.length - 1; i++) {
                    const from = parts[i];
                    const to = parts[i + 1];

                    // 可視ノード同士のみ
                    if (!visible.has(from) || !visible.has(to)) continue;

                    const key = `${from}->${to}`;
                    const currentType = dedup.get(key);

                    // まだ登録されていない、または既存が aux で今回が main の場合は上書き（main優先）
                    if (!currentType || (currentType === 'aux' && type === 'main')) {
                        dedup.set(key, type);
                    }
                }
            }
        };

        for (const n of filteredNodes) {
            // 1. auxPath (副経路) を先に処理
            processPaths(n, n.auxPath, 'aux');
            // 2. mainPath (主経路) を後に処理（重複時は main として判定させるため）
            processPaths(n, n.mainPath, 'main');
        }

        // マップから最終的なエッジ配列を生成
        dedup.forEach((type, key) => {
            const [from, to] = key.split('->').map(Number);

            let edgeOptions = { from, to };

            if (type === 'main') {
                // 主経路: 直線（物理演算の骨格となる）
                edgeOptions.smooth = { enabled: false };
                // 必要であれば色や幅を強調
                // edgeOptions.width = 2;
            } else {
                // 副経路: 曲線（物理要請を尊重しつつ、空いている空間を通す）
                edgeOptions.smooth = {
                    enabled: true,
                    type: "dynamic",   // 動的に曲がり具合を調整
                    roundness: 0.4
                };
                // 物理的な長さを主経路の数倍に設定して「緩く」する
                // これにより、主経路の構造（反発力と張力）が優先され、副経路はそこからあぶれた距離をつなぐ形になる
                edgeOptions.length = 300; // default (65) の約4〜5倍
                // 副経路であることを視覚的に区別（例: 破線、少し薄い色など）
                edgeOptions.dashes = true;
                edgeOptions.color = { opacity: 0.6, inherit: 'from' };
            }

            edges.push(edgeOptions);
        });

        return edges;
    }

    // build parent/child maps from nodesData.paths
    let __parentsMap = null;   // childId -> Set(parentIds)
    let __childrenMap = null;  // parentId -> Set(childIds)

    // ------------------------
    // 関数名   : buildParentChildMaps(void)
    // 名称     : paths から親/子関係マップを生成する処理
    // 内容     : nodesData に含まれる paths を元に、親/子関係マップを生成する
    // 引数     : void
    // 戻り値   : None
    // ------------------------
    function buildParentChildMaps() {
        __parentsMap = new Map();
        __childrenMap = new Map();
        const ids = new Set(nodesData.map(n => n.id));

        for (const n of nodesData) {
            // mainPath は従来通り処理
            if (n.mainPath) {
                const mainPaths = Array.isArray(n.mainPath) ? n.mainPath : [n.mainPath];
                mainPaths.forEach(p => {
                    if (typeof p !== 'string') return;
                    const parts = p.split(':').map(Number);
                    for (let i = 0; i < parts.length - 1; i++) {
                        const parent = parts[i];
                        const child = parts[i + 1];
                        if (!ids.has(parent) || !ids.has(child)) continue;

                        if (!__childrenMap.has(parent)) __childrenMap.set(parent, new Set());
                        __childrenMap.get(parent).add(child);
                        if (!__parentsMap.has(child)) __parentsMap.set(child, new Set());
                        __parentsMap.get(child).add(parent);
                    }
                });
            }

            // auxPath: 末尾が親 ID を指す想定だが、一方で副分類を重複追加してはいない
            if (n.auxPath) {
                const auxPaths = Array.isArray(n.auxPath) ? n.auxPath : [n.auxPath];
                auxPaths.forEach(p => {
                    if (typeof p !== 'string') return;
                    const parts = p.split(':').map(Number);

                    if (parts.length >= 1) {
                        // try to use the literal parent id; if missing, attempt resolution by prefix
                        let parent = parts[parts.length - 1];
                        if (!ids.has(parent)) {
                            const resolved = resolveAuxParentId(parts);
                            if (resolved == null) {
                                console.warn(`[WARN] auxPath references non-existent node and could not be resolved: ${p}`);
                                return; // skip this auxPath
                            }
                            parent = resolved;
                            console.log(`[INFO] auxPath parent ${parts[parts.length - 1]} resolved -> ${parent} for node ${n.id}`);
                        }

                        const child = n.id;
                        if (!__childrenMap.has(parent)) __childrenMap.set(parent, new Set());
                        __childrenMap.get(parent).add(child);
                        if (!__parentsMap.has(child)) __parentsMap.set(child, new Set());
                        __parentsMap.get(child).add(parent);
                    }
                });
            }
        }
    }

    // compute focus set: include nodeId, ancestors up levels, descendants down levels
    // ------------------------
    // 関数名   : computeFocusSet(nodeId, upDepth = 1, downDepth = 1)
    // 名称     : ノードを中心に、親/子関係を元に focus set を計算する処理
    // 内容     : nodeId を中心に、upDepth 階層分の ancestors と downDepth 階層分の descendants を含む Set を計算する
    // 引数     : nodeId - ノードID
    //            upDepth - 上方向に探索する階層数(0以上の整数)
    //            downDepth - 下方向に探索する階層数(0以上の整数)
    // 戻り値   : Set - focus set
    // ------------------------
    function computeFocusSet(nodeId, upDepth = 1, downDepth = 1) {
        if (!__parentsMap || !__childrenMap) buildParentChildMaps();
        const result = new Set();
        result.add(nodeId);

        // ancestors (up)
        let current = new Set([nodeId]);
        for (let d = 0; d < upDepth; d++) {
            const next = new Set();
            for (const id of current) {
                const parents = __parentsMap.get(id);
                if (!parents) continue;
                for (const p of parents) {
                    if (!result.has(p)) {
                        result.add(p);
                        next.add(p);
                    }
                }
            }
            if (next.size === 0) break;
            current = next;
        }

        // descendants (down)
        current = new Set([nodeId]);
        for (let d = 0; d < downDepth; d++) {
            const next = new Set();
            for (const id of current) {
                const children = __childrenMap.get(id);
                if (!children) continue;
                for (const c of children) {
                    if (!result.has(c)) {
                        result.add(c);
                        next.add(c);
                    }
                }
            }
            if (next.size === 0) break;
            current = next;
        }

        return result;
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
        networkContainer: $id('network'),
        minDepth: $id('minDepth'),
        maxDepth: $id('maxDepth'),
        updateBtn: $id('updateBtn'),
        labelSearchInput: $id('labelSearchInput'),
        labelSearchBtn: $id('labelSearchBtn'),
        labelSearchSuggestions: $id('labelSearchSuggestions'),
        pageSearchInput: $id('pageSearchInput'),
        pageSearchBtn: $id('pageSearchBtn'),
        pageSearchSuggestions: $id('pageSearchSuggestions'),
        focusUp: $id('focusUp'),
        focusDown: $id('focusDown'),
        clickModeRadios: document.getElementsByName('clickMode'),
        colorModeRadios: document.getElementsByName('colorMode')
    };

    // DOM 要素が揃っているか簡易チェック
    if (!dom.networkContainer || !dom.minDepth || !dom.maxDepth || !dom.updateBtn || !dom.labelSearchInput || !dom.labelSearchBtn) {
        console.error('[ERROR] 必要な DOM 要素が見つかりません。処理を中止します。');
        errorFlags.missingDom = true;
        currentState = STATE.ERROR;
        return;
    }

    // ------------------------
    // vis-network 管理（初回生成は1度だけ）
    // ------------------------
    let network = null; // vis-network インスタンス
    let networkInitialized = false; // 初期化済みフラグを失敗で初期化

    // ------------------------
    // 関数名   : u1f_initNetworkIfNeeded()
    // 名称     : network 初期化処理
    // 内容     : network が未初期化なら初期化を行う
    // 引数     : void
    // 戻り値   : boolean - 初期化成功なら true、失敗または既にエラー状態なら false
    // ------------------------
    function u1f_initNetworkIfNeeded() {
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
                physics: {
                    enabled: true,
                    solver: "forceAtlas2Based",
                    forceAtlas2Based: {
                        gravitationalConstant: -40,  // 反発力を弱める（デフォルト -200）
                        springLength: 65,            // エッジの自然長を短くする（重要）
                        springConstant: 0.2          // バネの硬さ、強すぎると暴れる
                    },
                    stabilization: {
                        enabled: true,
                        iterations: 200              // 少なすぎると変な形で止まりやすい
                    }
                },
                interaction: { hover: true, zoomView: true },
                edges: {
                    arrows: "to",
                    smooth: {
                        enabled: false               // 変な曲がりをなくすため
                    }
                }
            };

            network = new vis.Network(dom.networkContainer, data, options);
            networkInitialized = true;
            console.log('[NETWORK] vis.Network 初期化完了');
            return true;
        } catch (e) {
            console.error('[ERROR] network 初期化に失敗しました:', e);
            errorFlags.networkInitFailed = true;
            currentState = STATE.ERROR;
            return false;
        }
    }

    // 色計算ヘルパー
    const clamp = v => Math.max(0, Math.min(255, Math.round(v)));
    const toHex = v => ('0' + clamp(v).toString(16)).slice(-2);

    function detectCategoryFromNode(n) {
        // カテゴリ判定は mainPath のみを使用する（auxPathによる汚染を防ぐ）
        const paths = n.mainPath;
        // mainPath は validateData で必須チェック済みだが、念のためガード
        if (!paths || !paths.length) return null;
        // 最初の mainPath を正とする
        for (const p of paths) {
            const parts = p.split(':').map(Number);

            // 配列の要素数が2以上（ルートと大カテゴリを含む）であり、かつ先頭（ルート）が確実に '0' であることを確認（データの整合性チェック）
            if (parts.length >= 2 && parts[0] === 0) {
                // 「そのノードがどの『大カテゴリ（分野）』に属しているか」を知るために2番目の要素（インデックス1）を返す
                return parts[1]; // 1..6 expected
            }
        }
        return null;
    }

    // 関数: compute rainbow color according to spec
    function computeRainbowHex(n) {
        const l = (typeof n.level === 'number' && Number.isFinite(n.level)) ? n.level : 0;
        const cat = detectCategoryFromNode(n);
        // root
        if (n.id === 0 || l === 0) {
            return `#${toHex(255)}${toHex(255)}${toHex(255)}`; // white
        }
        const level = l;
        const inRange = (level >= 1 && level <= 8);
        let r = 255, g = 255, b = 255;
        switch (cat) {
            case 1: // 人文科学
                if (inRange) { r = 255; g = 256 - 32 * level; b = 256 - 32 * level; }
                else { r = 255; g = 0; b = 0; }
                break;
            case 2: // 社会科学
                if (inRange) { r = 255; g = 255; b = 256 - 32 * level; }
                else { r = 255; g = 255; b = 0; }
                break;
            case 3: // 形式科学
                if (inRange) { r = 256 - 32 * level; g = 255; b = 256 - 32 * level; }
                else { r = 0; g = 255; b = 0; }
                break;
            case 4: // 自然科学
                if (inRange) { r = 256 - 32 * level; g = 255; b = 255; }
                else { r = 0; g = 255; b = 255; }
                break;
            case 5: // 応用科学
                if (inRange) { r = 256 - 32 * level; g = 256 - 32 * level; b = 255; }
                else { r = 0; g = 0; b = 255; }
                break;
            case 6: // 学際領域
                if (inRange) { r = 255; g = 256 - 32 * level; b = 255; }
                else { r = 255; g = 0; b = 255; }
                break;
            default:
                // unknown category: fallback to grey-ish by level
                if (inRange) { const v = 256 - 16 * level; r = v; g = v; b = v; }
                else { r = 200; g = 200; b = 200; }
        }
        // clamp and form hex
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }

    // border darker
    function darkenHex(hex, amount = 30) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `#${toHex(r - amount)}${toHex(g - amount)}${toHex(b - amount)}`;
    }

    // ノードに適用する色オブジェクトを計算する
    function computeNodeColorObj(n, colorMode) {
        if (colorMode === 'rainbow') {
            const bg = computeRainbowHex(n);
            const border = darkenHex(bg, 30);
            return { background: bg, border: border, highlight: { background: bg, border: border } };
        }
        // colorMode === 'default-color': 共通のデフォルトカラーを明示的に適用（古い色を上書き）
        return { background: '#97C2FC', border: '#2B7CE9', highlight: { background: '#D2E5FF', border: '#2B7CE9' } };
    }

    // ------------------------
    // 関数名   : vof_setNetworkData(nodeList, edgeList)
    // 名称     : network のデータ更新
    // 内容     : network に nodeList と edgeList をセットする（初回は setData が使える想定）
    // 引数     : nodeList - ノードリスト配列
    //            edgeList - エッジリスト配列
    // 戻り値   : void
    // ------------------------
    function vof_setNetworkData(nodeList, edgeList) {
        console.log('[NETWORK] Updating network data...');
        if (!u1f_initNetworkIfNeeded()) return;
        try {
            // get selected color mode ('default-color' or 'rainbow')
            const colorModeEl = document.querySelector('input[name="colorMode"]:checked');
            const colorMode = colorModeEl ? colorModeEl.value : 'default-color';

            // Map nodeList to nodes for vis, applying color mode
            const mappedNodes = nodeList.map(n => {
                const nodeCopy = Object.assign({}, n); // shallow copy
                nodeCopy.color = computeNodeColorObj(n, colorMode);
                return nodeCopy;
            });

            const nodes = new vis.DataSet(mappedNodes);
            const edges = new vis.DataSet(edgeList);
            network.setData({ nodes, edges });
            console.log('[NETWORK] setData 実行: nodes=', nodeList.length, 'edges=', edgeList.length);
        } catch (e) {
            console.error('[ERROR] vof_setNetworkData 失敗:', e);
        }
    }

    function normalizeAuxPathsIfNeeded(nodes) {
        const ids = new Set(nodes.map(n => n.id));

        for (const node of nodes) {
            if (!node.auxPath) continue;
            const auxArr = Array.isArray(node.auxPath) ? [...node.auxPath] : [node.auxPath];

            for (let i = 0; i < auxArr.length; i++) {
                const p = auxArr[i];
                if (typeof p !== 'string') continue;
                const parts = p.split(':');
                if (parts.length < 1) continue;
                const lastId = Number(parts[parts.length - 1]);

                if (!ids.has(lastId)) {
                    // 存在しない末尾IDはこの node.id で置換する
                    parts[parts.length - 1] = String(node.id);
                    const replaced = parts.join(':');
                    auxArr[i] = replaced;
                    console.log('[INFO] auxPath末尾を置換:', p, '->', replaced);
                }
            }
            node.auxPath = Array.isArray(node.auxPath) ? auxArr : auxArr[0];
        }
    }

    // ------------------------
    // STATE 1: DATA_INITIALIZATION
    // （ここでは簡単なバリデーションを行う）
    // ------------------------
    function validateData() {
        currentState = STATE.DATA_INITIALIZATION;
        console.log('[STATE] DATA_INITIALIZATION');

        // ノード id 重複チェック
        // IDs を事前に収集しておく（空のままだと存在チェックが常に失敗する問題の修正）
        const ids = new Set();
        const duplicateIds = [];
        for (const n of nodesData) {
            if (ids.has(n.id)) duplicateIds.push(n.id);
            ids.add(n.id);
        }
        if (duplicateIds.length) {
            console.error('[ERROR] ノードIDの重複が検出されました:', duplicateIds);
            errorFlags.invalidData = true;
        }

        // auxPath の正規化
        // auxPath の末尾が存在しない参照になっている場合、
        // チェック対象ノードの id で置換しておく（ユーザ要望どおり）
        normalizeAuxPathsIfNeeded(nodesData);

        for (const n of nodesData) {
            if (!n.mainPath || n.mainPath.length === 0) {
                errorFlags.invalidData = true;
                continue;
            }

            const pathsToCheck = [...n.mainPath];
            if (n.auxPath && Array.isArray(n.auxPath)) {
                pathsToCheck.push(...n.auxPath);
            }

            for (const p of pathsToCheck) {
                const parts = p.split(':').map(Number);
                const isMainPath = Array.isArray(n.mainPath) && n.mainPath.includes(p);

                if (isMainPath) {
                    // 末尾チェック
                    if (parts[parts.length - 1] !== n.id) {
                        console.error('[ERROR] mainPath の末尾が id と一致しません:', n.id, p);
                        errorFlags.invalidData = true;
                        continue;
                    }
                    // 参照チェック
                    for (const pid of parts) {
                        if (!ids.has(pid)) {
                            console.error('[ERROR] path が存在しないノードを参照しています:', p, 'missing:', pid);
                            errorFlags.invalidData = true;
                        }
                    }
                } else {
                    // auxPath: 末尾は親ID（緩い条件）
                    if (parts.length < 1) {
                        console.error('[ERROR] auxPath が空です:', n.id, p);
                        errorFlags.invalidData = true;
                        continue;
                    }
                }
            }
        }

        if (errorFlags.invalidData) {
            currentState = STATE.ERROR;
            return false;
        }

        // ensure levels are present/consistent かつ最大深さを計算（mainPath 優先で計算）
        const computedMax = vof_ensureLevelsFromPaths(nodesData);
        maxAvailableLevel = (typeof computedMax === 'number' && Number.isFinite(computedMax)) ? computedMax : 0;
        console.log('[DATA] computed maxAvailableLevel =', maxAvailableLevel);

        return true;
    }

    // ------------------------
    // STATE 2: NETWORK_INITIALIZATION
    // ------------------------
    function initializeNetwork() {
        currentState = STATE.NETWORK_INITIALIZATION;
        console.log('[STATE] NETWORK_INITIALIZATION');

        const ok = u1f_initNetworkIfNeeded();
        if (!ok) return false;

        // 初回描画：デフォルト（min/max）による描画をしないで空で開始することも選べる
        // 今は初期値を用いて描画
        performDepthSearch(); // 正しい深さを使用
        return true;
    }

    // ------------------------
    // HASH_BOOTSTRAP / BOOTSTRAP_SEARCH
    // ------------------------
    function bootstrapFromHash() {
        currentState = STATE.HASH_BOOTSTRAP;
        console.log('[STATE] HASH_BOOTSTRAP');

        const raw = window.location.hash || '';
        if (!raw) {
            console.log('[HASH] fragment が存在しません');
            return false;
        }

        let idFromHash = null;

        // パターン: #id_30
        if (/^#id_\d+$/.test(raw)) {
            idFromHash = Number(raw.replace('#id_', ''));
        } else {
            console.log('[HASH] 未対応のハッシュ形式:', raw);
            return false;
        }

        if (!Number.isFinite(idFromHash)) {
            console.warn('[HASH] 数値抽出に失敗:', raw);
            return false;
        }

        console.log('[HASH] ID from fragment:', idFromHash);

        // ここで入力フォームへ値を自動セット（ID に対応する label を取得して表示）
        const labelInput = document.getElementById('labelSearchInput');
        if (labelInput) {
            const targetNode = nodesData.find(n => n.id === idFromHash);
            if (targetNode) {
                labelInput.value = targetNode.label;  // ID ではなく label を代入
                console.log('input successed:', targetNode.label);
            } else {
                console.warn('Node not found for id:', idFromHash);
            }
        } else {
            console.warn('input failed');
        }

        // BOOTSTRAP_SEARCH 実行（成功時は true）
        return u1f_performIdSearch(idFromHash, { fromHash: true });
    }

    // ------------------------
    // SEARCH 処理（共通）
    // ------------------------
    // - performDepthSearch() : min/max から
    // ------------------------
    function performDepthSearch() {
        currentState = STATE.SEARCHING;
        console.log('[SEARCH] performDepthSearch start');

        // 深さ検証
        let min = Number(dom.minDepth.value);
        let max = Number(dom.maxDepth.value);
        if (!Number.isFinite(min) || !Number.isFinite(max)) {
            alert('数値を入力してください');
            currentState = STATE.IDLE;
            return;
        }
        // 整数かつ非負か確認
        if (!Number.isInteger(min) || !Number.isInteger(max) || min < 0 || max < 0) {
            alert('0 以上の整数で入力してください');
            currentState = STATE.IDLE;
            return;
        }
        // min/max の整合
        if (min > max) {
            alert('最小深さは最大深さ以下にしてください');
            currentState = STATE.IDLE;
            return;
        }
        // データが持つ最大深さを超えていないか確認
        if (max > maxAvailableLevel) {
            alert(`指定した最大深さ [${max}] はデータの最大深さ [${maxAvailableLevel}] を超えています。表示可能な最大深さに合わせます。`);
            max = maxAvailableLevel;
            dom.maxDepth.value = String(max);
            if (min > max) {
                // min が超過してしまう場合は min を clamp
                min = Math.max(0, max);
                dom.minDepth.value = String(min);
            }
        }

        // filter nodes and edges
        const filteredNodes = nodesData.filter(n => (typeof n.level === 'number') && n.level >= min && n.level <= max);
        const filteredEdges = buildEdgesFromPaths(filteredNodes);

        // 描画
        vof_setNetworkData(filteredNodes, filteredEdges);

        // 見た目ロック（深さ検索が適用されている状態を示す）
        vof_applyVisualLock('depth');

        currentState = STATE.IDLE;
        console.log('[SEARCH] performDepthSearch done');
    }

    // label から id を検索
    // 複数マッチした場合は最初のものを返す
    function u1f_findNodeByLabel(label) {
        if (!label || label.trim() === '') {
            // 無記入の場合は id: 0 (学問)
            return nodesData.find(n => n.id === 0);
        }
        const trimmed = label.trim().toLowerCase();
        return nodesData.find(n => n.label.toLowerCase().includes(trimmed));
    }

    // label にマッチする候補を返す
    function u1f_suggestNodesByLabel(label) {
        if (!label || label.trim() === '') {
            return [];
        }
        const trimmed = label.trim().toLowerCase();
        return nodesData.filter(n => n.label.toLowerCase().includes(trimmed)).slice(0, 10); // 最大10件
    }

    // 新規関数：label での検索実行
    function u1f_performLabelSearch(label, options = {}) {
        currentState = STATE.SEARCHING;
        console.log('[SEARCH] u1f_performLabelSearch start, label=', label, 'options=', options);

        const target = u1f_findNodeByLabel(label);
        if (!target) {
            alert('指定した学問「' + label + '」が見つかりません');
            currentState = STATE.IDLE;
            return false;
        }

        const id = target.id;
        const level = target.level;
        const min = Math.max(0, level - 1);
        let max = level + 1;
        // データの最大深さを超えている場合は clamp
        if (max > maxAvailableLevel) { max = maxAvailableLevel }

        // 深さを更新（UI に反映）
        dom.minDepth.value = String(min);
        dom.maxDepth.value = String(max);

        // node/edge フィルタ
        const filteredNodes = nodesData.filter(n => (typeof n.level === 'number') && n.level >= min && n.level <= max);
        const filteredEdges = buildEdgesFromPaths(filteredNodes);

        // 描画
        vof_setNetworkData(filteredNodes, filteredEdges);

        // 見た目ロック（label検索が適用されている状態を示す）
        vof_applyVisualLock('id');

        currentState = STATE.IDLE;
        console.log('[SEARCH] u1f_performLabelSearch done');
        return true;
    }

    // ------------------------
    // ページ内検索ハイライト管理
    // ------------------------
    let _pageSearchHighlightTimer = null;
    let _pageSearchHighlightNodeId = null;
    let _pageSearchDragListener = null;
    let _pageSearchClickListener = null;

    // ------------------------
    // 関数名   : vof_clearPageSearchHighlight()
    // 名称     : ページ内検索ハイライト解除
    // 内容     : 赤色ハイライトを解除し、デフォルト色に戻す
    // 引数     : void
    // 戻り値   : void
    // ------------------------
    function vof_clearPageSearchHighlight() {
        if (_pageSearchHighlightTimer) {
            clearTimeout(_pageSearchHighlightTimer);
            _pageSearchHighlightTimer = null;
        }
        if (_pageSearchHighlightNodeId !== null && network && network.body && network.body.data && network.body.data.nodes) {
            try {
                const existing = network.body.data.nodes.get(_pageSearchHighlightNodeId);
                if (existing) {
                    network.body.data.nodes.update({
                        id: _pageSearchHighlightNodeId,
                        color: { background: '#97C2FC', border: '#2B7CE9', highlight: { background: '#D2E5FF', border: '#2B7CE9' } }
                    });
                }
            } catch (e) {
                console.warn('[PAGE_SEARCH] clearHighlight failed:', e);
            }
        }
        // イベントリスナー解除
        if (_pageSearchClickListener && network) {
            network.off('click', _pageSearchClickListener);
            _pageSearchClickListener = null;
        }
        if (_pageSearchDragListener && network) {
            network.off('dragStart', _pageSearchDragListener);
            _pageSearchDragListener = null;
        }
        _pageSearchHighlightNodeId = null;
        console.log('[PAGE_SEARCH] highlight cleared');
    }

    // ------------------------
    // 関数名   : u1f_performPageSearch(label)
    // 名称     : ページ内検索実行
    // 内容     : 完全一致でノードを検索し、ヒット時は赤色ハイライト+フォーカス
    // 引数     : label - 検索文字列
    // 戻り値   : void
    // ------------------------
    function u1f_performPageSearch(label) {
        console.log('[PAGE_SEARCH] u1f_performPageSearch start, label=', label);

        // 既存ハイライトをクリア
        vof_clearPageSearchHighlight();

        if (!label || label.trim() === '') {
            return;
        }
        const trimmed = label.trim();

        // 完全一致検索
        const target = nodesData.find(n => n.label === trimmed);
        if (!target) {
            console.log('[PAGE_SEARCH] no exact match found for:', trimmed);
            return;
        }

        const nodeId = target.id;

        // 現在表示中のネットワークに存在するか確認
        if (!network || !network.body || !network.body.data || !network.body.data.nodes) {
            return;
        }
        const visNode = network.body.data.nodes.get(nodeId);
        if (!visNode) {
            console.log('[PAGE_SEARCH] node not in current network:', nodeId);
            return;
        }

        // カラーモードをデフォルトに変更
        const defaultRadio = document.querySelector('input[name="colorMode"][value="default-color"]');
        if (defaultRadio && !defaultRadio.checked) {
            defaultRadio.checked = true;
            refreshNetworkColors();
        }

        // ヒットノードを赤色に変更
        network.body.data.nodes.update({
            id: nodeId,
            color: { background: '#FF0000', border: '#CC0000', highlight: { background: '#FF3333', border: '#CC0000' } }
        });
        _pageSearchHighlightNodeId = nodeId;

        // フォーカス
        network.focus(nodeId, { scale: 1.2, animation: { duration: 500 } });

        // 10秒後に自動リセット
        _pageSearchHighlightTimer = setTimeout(() => {
            vof_clearPageSearchHighlight();
        }, 10000);

        // ユーザ操作でリセット
        _pageSearchClickListener = function () {
            vof_clearPageSearchHighlight();
        };
        _pageSearchDragListener = function () {
            vof_clearPageSearchHighlight();
        };
        network.on('click', _pageSearchClickListener);
        network.on('dragStart', _pageSearchDragListener);

        console.log('[PAGE_SEARCH] highlighted node:', nodeId);
    }

    // ------------------------
    // u1f_performIdSearch(id, options = {})
    // 引数：
    // - u1f_performIdSearch(id) : id 指定から
    // - id: 数値
    // - options: { fromHash: boolean } -- ハッシュ起動かどうかのフラグ
    // 戻り値：true if success, false if not
    // ------------------------
    function u1f_performIdSearch(id, options = {}) {
        currentState = STATE.SEARCHING;
        console.log('[SEARCH] u1f_performIdSearch start, id=', id, 'options=', options);

        if (!Number.isFinite(id)) {
            alert('ID が不正です');
            currentState = STATE.IDLE;
            return false;
        }

        const target = nodesData.find(n => n.id === id);
        if (!target) {
            alert('指定したIDのノードが存在しません: ' + id);
            currentState = STATE.IDLE;
            return false;
        }

        const level = target.level;
        const min = Math.max(0, level - 1);
        let max = level + 1;
        // データの最大深さを超えている場合は clamp
        if (max > maxAvailableLevel) { max = maxAvailableLevel }

        // 深さを更新（UI に反映）
        dom.minDepth.value = String(min);
        dom.maxDepth.value = String(max);

        // node/edge フィルタ
        const filteredNodes = nodesData.filter(n => (typeof n.level === 'number') && n.level >= min && n.level <= max);
        const filteredEdges = buildEdgesFromPaths(filteredNodes);

        // 描画
        vof_setNetworkData(filteredNodes, filteredEdges);

        // 見た目ロック（ID検索が適用されている状態を示す）
        vof_applyVisualLock('id');

        currentState = STATE.IDLE;
        console.log('[SEARCH] u1f_performIdSearch done');
        return true;
    }

    // perform node-focus display
    function u1f_performNodeFocus(nodeId, up = 1, down = 1) {
        currentState = STATE.SEARCHING;
        console.log('[SEARCH] u1f_performNodeFocus start, id=', nodeId, 'up=', up, 'down=', down);

        const target = nodesData.find(n => n.id === nodeId);
        if (!target) {
            alert('指定したノードが見つかりません: ' + nodeId);
            currentState = STATE.IDLE;
            return false;
        }

        const focusSet = computeFocusSet(nodeId, Math.max(0, Math.floor(Number(up) || 0)), Math.max(0, Math.floor(Number(down) || 0)));
        const filteredNodes = nodesData.filter(n => focusSet.has(n.id));
        const filteredEdges = buildEdgesFromPaths(filteredNodes);

        vof_setNetworkData(filteredNodes, filteredEdges);
        vof_applyVisualLock('id'); // reuse id-lock (visual effect)
        currentState = STATE.IDLE;
        console.log('[SEARCH] u1f_performNodeFocus done, nodes=', filteredNodes.length);
        return true;
    }

    // ------------------------
    // 見た目ロック（disabled は使わず、.dimmed のみで示す）
    // ------------------------
    let currentLock = null; // null | 'id' | 'depth'

    // ------------------------
    // 関数名   : vof_applyVisualLock(searchMode)
    // 名称     : 見た目ロック適用
    // 内容     : 指定されたモードに応じて、関連する UI 要素を dimmed にする
    // 引数     : searchMode: 'id' or 'depth'
    // 戻り値   : void
    // ------------------------
    function vof_applyVisualLock(searchMode) {
        // searchMode: 'id' or 'depth'
        currentLock = searchMode;
        console.log('[UI] vof_applyVisualLock:', searchMode);

        // 要素群（存在チェックしてから扱う）
        const depthInputControls = [dom.minDepth, dom.maxDepth].filter(Boolean);
        const depthBtnControls = [dom.updateBtn].filter(Boolean);
        const labelInputControls = [dom.labelSearchInput, dom.labelSearchSuggestions].filter(Boolean);
        const labelBtnControls = [dom.labelSearchBtn].filter(Boolean);

        // いったん全要素から dimmed を除去
        [...depthInputControls, ...depthBtnControls, ...labelInputControls, ...labelBtnControls].forEach(el => {
            if (el && el.classList) {
                el.classList.remove('dimmed');
                el.classList.remove('btn-dim');
            }
        });

        if (searchMode === 'id') {
            // ラベル（id）検索モードでは深さ操作を弱める
            depthInputControls.forEach(el => { if (el && el.classList) el.classList.add('dimmed'); });
            depthBtnControls.forEach(el => { if (el && el.classList) el.classList.add('btn-dim'); });
        } else if (searchMode === 'depth') {
            // 深さモードではラベル操作を弱める
            labelInputControls.forEach(el => { if (el && el.classList) el.classList.add('dimmed'); });
            labelBtnControls.forEach(el => { if (el && el.classList) el.classList.add('btn-dim'); });
        }
    }

    // ------------------------
    // 関数名   : vof_clearVisualLock()
    // 名称     : 見た目ロック解除処理
    // 内容     : 現在の見た目ロックを解除する
    // 引数     : void
    // 戻り値   : void
    // ------------------------
    function vof_clearVisualLock() {
        if (!currentLock) return;
        console.log('[UI] vof_clearVisualLock from', currentLock);
        currentLock = null;

        const depthControls = [dom.minDepth, dom.maxDepth, dom.updateBtn].filter(Boolean);
        const labelControls = [dom.labelSearchInput, dom.labelSearchBtn, dom.labelSearchSuggestions].filter(Boolean);

        [...depthControls, ...labelControls].forEach(el => {
            if (el && el.classList) {
                el.classList.remove('dimmed');
                el.classList.remove('btn-dim');
            }
        });
    }

    // 再フォーカス時の解除（ユーザがどれかに focus したら見た目を戻す）
    [dom.labelSearchInput, dom.minDepth, dom.maxDepth].forEach(el => {
        el.addEventListener('focus', () => {
            if (currentLock) vof_clearVisualLock();
        });
    });

    // 再レンダリング（現在表示中のノードの色だけを差分更新する。レイアウトは維持される）
    function refreshNetworkColors() {
        if (!network || !network.body || !network.body.data || !network.body.data.nodes) return;
        try {
            const colorModeEl = document.querySelector('input[name="colorMode"]:checked');
            const colorMode = colorModeEl ? colorModeEl.value : 'default-color';

            const currentNodes = network.body.data.nodes.get(); // 表示中のノード配列
            const updates = currentNodes.map(n => ({
                id: n.id,
                color: computeNodeColorObj(n, colorMode)
            }));
            network.body.data.nodes.update(updates);
            console.log('[UI] refreshNetworkColors executed (in-place), nodes=', updates.length);
        } catch (e) {
            console.warn('[UI] refreshNetworkColors failed:', e);
        }
    }

    // ------------------------
    // ノード説明パネル
    // ------------------------
    function showNodeInfo(node) {
        const panel = document.getElementById('nodeInfoPanel');
        const title = document.getElementById('nodeInfoTitle');
        const titleEn = document.getElementById('nodeInfoTitleEn');
        const body = document.getElementById('nodeInfoBody');

        title.textContent = node.label;
        titleEn.textContent = node.labelEn || '';

        // ノード説明：node.description が無いなら空文字
        const desc = node.description || "説明はありません。";
        body.textContent = desc;

        panel.classList.remove('hidden');
    }

    function hideNodeInfo() {
        const panel = document.getElementById('nodeInfoPanel');
        panel.classList.add('hidden');
    }

    // ノードクリック判定用タイムスタンプ（短時間の document.click を無視する）
    let __lastNodeClickAt = 0;
    // タッチによる操作タイムスタンプ（スマホ用）
    let __lastTouchAt = 0;

    // スマホのタッチは click に遅延でフォールバックが来るため
    // network 上での touchstart を記録して、直後の document.click による誤閉じを防ぐ
    if (dom && dom.networkContainer) {
        dom.networkContainer.addEventListener('touchstart', function (ev) {
            __lastTouchAt = Date.now();
        }, { passive: true });
    }

    document.addEventListener('click', function (e) {
        const panel = document.getElementById('nodeInfoPanel');

        // 既にパネルが hidden なら無視
        if (!panel || panel.classList.contains('hidden')) return;

        // パネルをクリックした場合 → 閉じない
        if (panel.contains(e.target)) return;

        // ノードクリック直後の document click は無視（vis の click と document click が同時発火するため）
        // タッチ操作の場合は遅延が大きめなので余裕を持たせる
        const now = Date.now();
        if ((__lastNodeClickAt && (now - __lastNodeClickAt) < 500) ||
            (__lastTouchAt && (now - __lastTouchAt) < 700)) {
            return;
        }
        // その他の場所をクリック → 閉じる
        hideNodeInfo();
    });

    // ------------------------
    // クリック／イベントハンドラの初期登録（STATE.IDLE で動く）
    // ------------------------
    function registerUiHandlers() {
        // 深さ検索ボタン
        dom.updateBtn.addEventListener('click', () => {
            console.log('[UI] depth search clicked');
            // 実行時は id input をクリア（仕様）
            dom.labelSearchInput.value = '';
            dom.labelSearchSuggestions.style.display = 'none';
            performDepthSearch();
        });

        // label 検索ボタン
        dom.labelSearchBtn.addEventListener('click', () => {
            console.log('[UI] label search clicked');
            const label = String(dom.labelSearchInput.value);
            u1f_performLabelSearch(label);
        });

        // label input でのリアルタイム候補表示
        dom.labelSearchInput.addEventListener('input', () => {
            const label = dom.labelSearchInput.value;
            const suggestions = u1f_suggestNodesByLabel(label);

            if (suggestions.length === 0) {
                dom.labelSearchSuggestions.style.display = 'none';
                return;
            }

            // サジェスト一覧をクリア
            dom.labelSearchSuggestions.innerHTML = '';
            console.log('[UI] label search suggestions are cleared');

            // 候補を追加
            for (const node of suggestions) {
                const li = document.createElement('li');
                li.style.cssText = 'padding: 8px 12px; cursor: pointer; border-bottom: 1px solid #eee;';
                li.textContent = node.label;
                li.addEventListener('mouseover', () => {
                    li.style.backgroundColor = '#f0f0f0';
                });
                li.addEventListener('mouseout', () => {
                    li.style.backgroundColor = '';
                });
                li.addEventListener('click', () => {
                    dom.labelSearchInput.value = node.label;
                    dom.labelSearchSuggestions.style.display = 'none';
                    u1f_performLabelSearch(node.label);
                });
                dom.labelSearchSuggestions.appendChild(li);
            }

            dom.labelSearchSuggestions.style.display = 'block';
        });

        // Enter キーで検索
        dom.labelSearchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const label = dom.labelSearchInput.value;
                dom.labelSearchSuggestions.style.display = 'none';
                u1f_performLabelSearch(label);
            }
        });

        // 外クリックで候補を非表示（学問検索）
        document.addEventListener('click', (e) => {
            if (!dom.labelSearchInput.contains(e.target) && !dom.labelSearchSuggestions.contains(e.target)) {
                dom.labelSearchSuggestions.style.display = 'none';
            }
        });

        // network をクリック時の動作
        // network の click イベント（node クリック）
        // 注意: network 初期化後にセットされる（u1f_initNetworkIfNeeded で）
        function getClickMode() {
            const radios = document.getElementsByName('clickMode');
            for (const r of radios) {
                if (r.checked) return r.value;
            }
            return 'select';
        }

        // we keep a single handler: if network is not ready, we ignore clicks
        dom.networkContainer.addEventListener('click', (ev) => {
            // do nothing special here; actual node clicks handled by vis event registered below
        });
        // register vis 'click' when network ready
        if (u1f_initNetworkIfNeeded()) {
            network.on('click', function (params) {
                try {
                    // ノードが選択されているか判定
                    if (!params.nodes || !params.nodes.length) {
                        // ノード以外（背景・エッジ等）をクリックした場合はパネルを閉じる
                        console.log('[NETWORK] background/edge clicked - hiding panel');
                        hideNodeInfo();
                        return;
                    }

                    const nodeId = params.nodes[0];
                    const node = (network.body && network.body.data && network.body.data.nodes) ? network.body.data.nodes.get(nodeId) : null;
                    if (!node) {
                        console.warn('[NETWORK] node not found in internal dataset:', nodeId);
                        return;
                    }
                    const clickMode = getClickMode();
                    console.log('[NETWORK] node clicked', nodeId, node, 'clickMode=', clickMode);

                    // ノードクリック時刻を記録（document.click 側の誤閉じ防止）
                    __lastNodeClickAt = Date.now();

                    if (clickMode === 'select') {
                        // パネル表示
                        try {
                            console.log("[click] Selecting node:", node.label);
                            showNodeInfo(node);
                        } catch (e) {
                            console.warn('[NETWORK] select failed:', e);
                        }
                    } else if (clickMode === 'nodeFocus') {
                        // ノードフォーカスモード：上方/下方の入力値を取得して表示
                        const up = dom.focusUp ? Number(dom.focusUp.value) : 1;
                        const down = dom.focusDown ? Number(dom.focusDown.value) : 1;
                        u1f_performNodeFocus(node.id, up, down);
                    } else {
                        // link モード: released フラグを確認 (存在しなければ 0 扱い)
                        const releasedFlag = Number(node.released) === 1 ? 1 : 0;
                        if (releasedFlag !== 1) {
                            // 公開されていないのでリンク遷移は行わない。説明パネルで案内する。
                            console.log('[NETWORK] node is not released, blocking link open:', nodeId);
                            showNodeInfo(node);
                            return;
                        }
                        // 公開済みなら新しいタブで開く
                        if (node.url) {
                            window.open(node.url, '_blank');
                        } else {
                            console.warn('[NETWORK] node has no URL:', node);
                        }
                    }
                } catch (e) {
                    console.error('[NETWORK] click handler error:', e);
                }
            });
        }

        // カラーモードラジオの変更を検知して再描画（レインボー適用）
        if (dom.colorModeRadios && dom.colorModeRadios.length) {
            for (const r of dom.colorModeRadios) {
                r.addEventListener('change', () => {
                    console.log('[UI] colorMode changed ->', document.querySelector('input[name="colorMode"]:checked').value);
                    // ページ内検索ハイライトをクリア
                    vof_clearPageSearchHighlight();
                    // 現在表示しているノード/エッジを再取得して色を再適用
                    refreshNetworkColors();
                });
            }
        }

        // ページ内検索ボタン
        dom.pageSearchBtn.addEventListener('click', () => {
            console.log('[UI] page search clicked');
            const label = String(dom.pageSearchInput.value);
            dom.pageSearchSuggestions.style.display = 'none';
            u1f_performPageSearch(label);
        });

        // ページ内検索 Enter キー
        dom.pageSearchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const label = dom.pageSearchInput.value;
                dom.pageSearchSuggestions.style.display = 'none';
                u1f_performPageSearch(label);
            }
        });

        // ページ内検索 サジェスト表示
        dom.pageSearchInput.addEventListener('input', () => {
            const label = dom.pageSearchInput.value;
            const suggestions = u1f_suggestNodesByLabel(label);

            if (suggestions.length === 0) {
                dom.pageSearchSuggestions.style.display = 'none';
                return;
            }

            dom.pageSearchSuggestions.innerHTML = '';

            for (const node of suggestions) {
                const li = document.createElement('li');
                li.textContent = node.label;
                li.addEventListener('mouseover', () => {
                    li.style.backgroundColor = '#f0f0f0';
                });
                li.addEventListener('mouseout', () => {
                    li.style.backgroundColor = '';
                });
                li.addEventListener('click', () => {
                    dom.pageSearchInput.value = node.label;
                    dom.pageSearchSuggestions.style.display = 'none';
                    u1f_performPageSearch(node.label);
                });
                dom.pageSearchSuggestions.appendChild(li);
            }

            dom.pageSearchSuggestions.style.display = 'block';
        });

        // 外クリックでページ内検索サジェスト非表示
        document.addEventListener('click', (e) => {
            if (!dom.pageSearchInput.contains(e.target) && !dom.pageSearchSuggestions.contains(e.target)) {
                dom.pageSearchSuggestions.style.display = 'none';
            }
        });
    }

    // ------------------------
    // 初期化フロー（状態遷移順）
    // ------------------------
    (function mainFlow() {
        try {
            console.log('[MAIN] start state machine');
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

            // register UI handlers after network ready
            registerUiHandlers();

            // STATE 3: hash bootstrap (if any)
            const hashHandled = bootstrapFromHash();
            if (hashHandled) {
                // BOOTSTRAP_SEARCH did internal drawing
                console.log('[MAIN] bootstrap handled, entering IDLE');
                currentState = STATE.IDLE;
                return;
            }

            // otherwise draw default graph according to selects
            currentState = STATE.IDLE;
            console.log('[MAIN] entering IDLE state');
            // initial draw (respect current min/max selects)
            performDepthSearch();
        } catch (e) {
            console.error('[MAIN] unexpected error:', e);
            currentState = STATE.ERROR;
        }
    })();

    // ------------------------
    // パネル ドラッグ移動
    // ------------------------
    (function initPanelDrag() {
        const panel = document.getElementById('controlsPanel');
        const header = document.getElementById('controlsHeader');
        if (!panel || !header) return;

        let isDragging = false;
        let startX = 0, startY = 0;
        let panelStartX = 0, panelStartY = 0;

        function onDragStart(clientX, clientY) {
            isDragging = true;
            startX = clientX;
            startY = clientY;
            const rect = panel.getBoundingClientRect();
            panelStartX = rect.left;
            panelStartY = rect.top;
            header.classList.add('dragging');
        }

        function onDragMove(clientX, clientY) {
            if (!isDragging) return;
            let newX = panelStartX + (clientX - startX);
            let newY = panelStartY + (clientY - startY);

            // ビューポート外へのクランプ
            const pw = panel.offsetWidth;
            const ph = panel.offsetHeight;
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            newX = Math.max(0, Math.min(newX, vw - pw));
            newY = Math.max(0, Math.min(newY, vh - Math.min(ph, 40)));

            panel.style.left = newX + 'px';
            panel.style.top = newY + 'px';
        }

        function onDragEnd() {
            isDragging = false;
            header.classList.remove('dragging');
        }

        // Mouse events
        header.addEventListener('mousedown', function (e) {
            // トグルボタンの場合はドラッグしない
            if (e.target.closest('.controls-toggle-btn')) return;
            e.preventDefault();
            onDragStart(e.clientX, e.clientY);
        });
        document.addEventListener('mousemove', function (e) {
            if (!isDragging) return;
            e.preventDefault();
            onDragMove(e.clientX, e.clientY);
        });
        document.addEventListener('mouseup', onDragEnd);

        // Touch events
        header.addEventListener('touchstart', function (e) {
            if (e.target.closest('.controls-toggle-btn')) return;
            const t = e.touches[0];
            onDragStart(t.clientX, t.clientY);
        }, { passive: true });
        document.addEventListener('touchmove', function (e) {
            if (!isDragging) return;
            const t = e.touches[0];
            onDragMove(t.clientX, t.clientY);
        }, { passive: false });
        document.addEventListener('touchend', onDragEnd);
    })();

    // ------------------------
    // パネル 縮小/拡大トグル
    // ------------------------
    (function initPanelToggle() {
        const panel = document.getElementById('controlsPanel');
        const toggleBtn = document.getElementById('controlsToggleBtn');
        if (!panel || !toggleBtn) return;

        toggleBtn.addEventListener('click', function () {
            const isCollapsed = panel.classList.toggle('collapsed');
            toggleBtn.textContent = isCollapsed ? '▲' : '▼';
            toggleBtn.title = isCollapsed ? 'パネルを開く' : 'パネルを閉じる';
        });
    })();

    // ------------------------
    // 公開（デバッグ用）
    // ------------------------
    window.__SiteGraph = {
        STATE,
        getCurrentState: () => currentState,
        getErrorFlags: () => ({ ...errorFlags }),
        reinitNetwork: () => { networkInitialized = false; return u1f_initNetworkIfNeeded(); },
        performDepthSearch,
        u1f_performLabelSearch,
        u1f_performIdSearch,
        vof_clearVisualLock
    };
}); // DOMContentLoaded end
