// ----------------------------------------------------------------------------
// ファイル名    : pageContentRenderer.js
// 名称          : ページの各パーツを生成するスクリプト
// 内容          : ページの内容に応じて、関連リンクやナビゲーションリンクを生成・挿入する
// このプログラムの著作権及び、このプログラムに関する技術は（株）Fibrantixがその知的財産権を所有し
// ており、所有者の事前の許可なくその全部又は一部を問わず、第三者に開示してはならない。
// Copyright(c) 2025 Fibrantix CO.,LTD. All Rights Reserved
// ----------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', async function () {
    // 1. データの取得 (パスは実際の環境に合わせて調整してください)
    //const response = await fetch('../../../../../siteData.json');
    //const data = await response.json();

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
        { id: 301, label: "数学基礎論", labelEn: "Foundations of Mathematics", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/foundations_of_mathematics/foundations_of_mathematics.html", mainPath: ["0:3:30:301"], released: 1, isPaid: 1, datePublished: "2025-12-28", dateModified: "2025-12-28", description: "数学そのものを研究対象とする「数学基礎論」の世界。構文論と意味論の対比、モデル理論、証明論、そして現代の逆数学や証明支援系への展開を概観し、Pythonによる有限モデルの検証シミュレーションを通じて、論理式の真偽がいかに判定されるかを学びます。", keywords: ["ゲーデル", "Python", "ヒルベルト・プログラム"], iconClass: "fa-folder fa-fw", thumbnailUrl: ["https://tatsuy-kobayashi.github.io/my-web/docs/images/image-30-120x68.png", "https://tatsuy-kobayashi.github.io/my-web/docs/images/image-30-160x90.png", "https://tatsuy-kobayashi.github.io/my-web/docs/images/image-30-320x180.png"] },
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
        { id: 3011, label: "集合論", labelEn: "Set Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/foundations_of_mathematics/set_theory/set_theory.html", mainPath: ["0:3:30:301:3011"], released: 1, description: "集合の基本概念から応用まで解説。集合の定義、演算（和・積・差集合）、部分集合、冪集合などをPythonのコード例とベン図で分かりやすく学べる。数学の基礎を支える集合論の入門として最適。" },
        // 数論302
        { id: 3020, label: "数学定数", labelEn: "Mathematical Constants", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/number_theory/mathematical_constant/mathematical_constant.html", mainPath: ["0:3:30:302:3020"], released: 1, keywords: ["一覧"] },
        // 代数学303
        { id: 3030, label: "抽象代数学", labelEn: "Abstract Algebra", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/abstract_algebra/abstract_algebra.html", mainPath: ["0:3:30:303:3030"] },
        { id: 3031, label: "普遍代数学", labelEn: "Universal Algebra", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/universal_algebra/universal_algebra.html", mainPath: ["0:3:30:303:3031"] },
        // 解析学304
        { id: 3040, label: "解析学基礎", labelEn: "Foundations of Analysis", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/foundations_of_analysis/foundations_of_analysis.html", mainPath: ["0:3:30:304:3040"], released: 1 },
        { id: 3041, label: "微分積分学", labelEn: "Differential and Integral Calculus", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/calculus/calculus.html", mainPath: ["0:3:30:304:3041"], released: 1 },
        // 多親（代数・解析の両方の子）paths: ["0:3:30:303:3030", "0:3:30:304:3030"]
        { id: 3042, label: "代数解析学", labelEn: "Algebraic Analysis", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/algebraic_analysis/algebraic_analysis.html", mainPath: ["0:3:30:304:3042"], auxPath: ["0:3:30:303:3042"], released: 0 },
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
        { id: 5025, label: "計算可能性理論", labelEn: "Computability Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/applied_science/informatics/theory_of_computation/computability_theory/computability_theory.html", mainPath: ["0:5:50:502:5025"], released: 0 },
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
        // 集合論3011
        { id: 30110, label: "素朴集合論", labelEn: "Naive Set Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/foundations_of_mathematics/set_theory/naive_set_theory/naive_set_theory.html", mainPath: ["0:3:30:301:3011:30110"], released: 1, description: "素朴集合論の基礎から応用まで解説。素朴包括原理やパラドックス許容論理を中心に、Pythonによる実装例を交えながら、ラッセルのパラドックスや論理体系の修正についても学べる数学基礎論の入門記事。", keywords: ["プログラミング", "Python"] },
        { id: 30111, label: "公理的集合論", labelEn: "Axiomatic Set Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/foundations_of_mathematics/set_theory/axiomatic_set_theory/axiomatic_set_theory.html", mainPath: ["0:3:30:301:3011:30111"], released: 1, description: "公理的集合論の基礎から発展まで解説。ZF集合論、NBG集合論、MK集合論など主要な体系を比較しながら、各公理の意味や相互関係、数学基礎論における役割を学べる。図解とともに体系的に理解できる入門記事。" },
        // 抽象代数学3030
        { id: 30300, label: "代数系一般論", labelEn: "Algebraic Structures", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/abstract_algebra/algebraic_structures/algebraic_structures.html", mainPath: ["0:3:30:303:3030:30300"] },
        { id: 30301, label: "表現論・ホモロジー代数", labelEn: "Representation and Homological Algebra", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/abstract_algebra/representation_homological/representation_homological.html", mainPath: ["0:3:30:303:3030:30301"], auxPath: ["0:3:30:303:3030:30300:303001:30301"] },
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
        { id: 30434, label: "調和解析", labelEn: "Harmonic Analysis", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/functional_analysis/harmonic_analysis/harmonic_analysis.html", mainPath: ["0:3:30:304:3043:30434"], auxPath: ["0:3:30:304:3041:30434"], released: 0 },
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
        // 公理的集合論30111
        { id: 301110, label: "ツェルメロ＝フレンケル集合論", labelEn: "Zermelo-Fraenkel Set Theory with the Axiom of Choice", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/foundations_of_mathematics/set_theory/axiomatic_set_theory/zermelo_fraenkel_choice_set_theory/zermelo_fraenkel_choice_set_theory.html", mainPath: ["0:3:30:301:3011:30111:301110"], released: 1, isPaid: 1 },
        // 代数系一般論30300
        { id: 303000, label: "原始的な代数的構造", labelEn: "Primitive Algebraic Structures", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/abstract_algebra/algebraic_structures/primitive_structures/primitive_structures.html", mainPath: ["0:3:30:303:3030:30300:303000"] },
        { id: 303001, label: "群論", labelEn: "Group Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/abstract_algebra/algebraic_structures/group_theory/group_theory.html", mainPath: ["0:3:30:303:3030:30300:303001"] },
        { id: 303002, label: "環論", labelEn: "Ring Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/abstract_algebra/algebraic_structures/ring_theory/ring_theory.html", mainPath: ["0:3:30:303:3030:30300:303002"] },
        { id: 303003, label: "体論", labelEn: "Field Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/abstract_algebra/algebraic_structures/field_theory/field_theory.html", mainPath: ["0:3:30:303:3030:30300:303003"] },
        { id: 303004, label: "その他の構造", labelEn: "Other Algebraic Structures", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/abstract_algebra/algebraic_structures/other_structures/other_structures.html", mainPath: ["0:3:30:303:3030:30300:303004"] },
        // 代数的構造の一般理論30310
        { id: 303100, label: "代数・準同型・同値関係・商構造", labelEn: "Algebras, Homomorphisms, Congruence Relations, and Quotients", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/algebras_homomorphisms/algebras_homomorphisms.html", mainPath: ["0:3:30:303:3031:30310:303100"] },
        { id: 303101, label: "代数的性質", labelEn: "Algebraic Properties", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/algebraic_properties/algebraic_properties.html", mainPath: ["0:3:30:303:3031:30310:303101"] },
        { id: 303130, label: "圏論", labelEn: "Category Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/category_theory/category_theory.html", mainPath: ["0:3:30:303:3031:30313:303130"] },
        { id: 303131, label: "基礎：関手・自然変換・極限・余極限", labelEn: "Functors, Natural Transformations, Limits and Colimits", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/functors_limits/functors_limits.html", mainPath: ["0:3:30:303:3031:30313:303131"] },
        { id: 303132, label: "構造：モナド・アジュンクション・エンリッチド圏", labelEn: "Monads, Adjunctions, and Enriched Categories", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/monads_adjunctions/monads_adjunctions.html", mainPath: ["0:3:30:303:3031:30313:303132"] },
        { id: 303133, label: "トポス論", labelEn: "Topos Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/topos_theory/topos_theory.html", mainPath: ["0:3:30:303:3031:30313:303133"] },
        { id: 303134, label: "高次圏論・圏的ホモトピー論", labelEn: "Higher Category Theory and Homotopical Algebra", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/higher_category_theory/higher_category_theory.html", mainPath: ["0:3:30:303:3031:30313:303134"] },
        // 実数論30400
        { id: 304000, label: "数列", labelEn: "Sequences", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/foundations_of_analysis/theory_of_real_numbers/sequences/sequences.html", mainPath: ["0:3:30:304:3040:30400:304000"], released: 1 },
        { id: 304001, label: "級数", labelEn: "Series", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/foundations_of_analysis/theory_of_real_numbers/series/series.html", mainPath: ["0:3:30:304:3040:30400:304001"], released: 1 },
        { id: 304002, label: "収束と発散", labelEn: "Convergence and Divergence", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/foundations_of_analysis/theory_of_real_numbers/convergence_and_divergence/convergence_and_divergence.html", mainPath: ["0:3:30:304:3040:30400:304002"], released: 1 },
        { id: 304003, label: "テイラー展開・冪級数", labelEn: "Taylor Expansion and Power Series", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/foundations_of_analysis/theory_of_real_numbers/taylor_and_power_series/taylor_and_power_series.html", mainPath: ["0:3:30:304:3040:30400:304003"], released: 1 },
        { id: 304004, label: "実数の構成", labelEn: "Construction of Real Numbers", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/foundations_of_analysis/theory_of_real_numbers/construction_of_real_numbers/construction_of_real_numbers.html", mainPath: ["0:3:30:304:3040:30400:304004"], released: 1 },
        { id: 304005, label: "関数の極限・連続性", labelEn: "Limits and Continuity of Functions", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/foundations_of_analysis/theory_of_real_numbers/limits_and_continuity/limits_and_continuity.html", mainPath: ["0:3:30:304:3040:30400:304005"], released: 1 },
        // 複素解析30401
        { id: 304010, label: "複素数体", labelEn: "Complex Number Field (Algebraic Definition)", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/foundations_of_analysis/complex_analysis/complex_number_field/complex_number_field.html", mainPath: ["0:3:30:304:3040:30401:304010"], released: 1 },
        { id: 304011, label: "複素関数論", labelEn: "Theory of Complex Functions", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/foundations_of_analysis/complex_analysis/theory_of_complex_functions/theory_of_complex_functions.html", mainPath: ["0:3:30:304:3040:30401:304011"], released: 1 },
        { id: 304012, label: "リーマン面（位相的拡張）", labelEn: "Riemann Surfaces", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/foundations_of_analysis/complex_analysis/riemann_surfaces/riemann_surfaces.html", mainPath: ["0:3:30:304:3040:30401:304012"], released: 1 },
        // 関数論30402
        { id: 304020, label: "連続関数・可微分関数の一般論", labelEn: "General Theory of Continuous and Differentiable Functions", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/foundations_of_analysis/function_theory/general_theory_of_functions/general_theory_of_functions.html", mainPath: ["0:3:30:304:3040:30402:304020"], released: 1 },
        { id: 304021, label: "整関数・三角関数・指数・対数", labelEn: "Entire, Trigonometric, Exponential and Logarithmic Functions", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/foundations_of_analysis/function_theory/special_standard_functions/standard_functions.html", mainPath: ["0:3:30:304:3040:30402:304021"], released: 1 },
        { id: 304022, label: "特殊関数", labelEn: "Special Functions", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/foundations_of_analysis/function_theory/special_functions/special_functions.html", mainPath: ["0:3:30:304:3040:30402:304022"], released: 1 },
        // 微分法30410
        { id: 304100, label: "導関数", labelEn: "Derivative", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/calculus/differential_calculus/derivative/derivative.html", mainPath: ["0:3:30:304:3041:30410:304100"], released: 1 },
        { id: 304101, label: "平均値定理", labelEn: "Mean Value Theorem", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/calculus/differential_calculus/mean_value_theorem/mean_value_theorem.html", mainPath: ["0:3:30:304:3041:30410:304101"], released: 1 },
        { id: 304102, label: "テイラーの定理", labelEn: "Taylor's Theorem", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/calculus/differential_calculus/taylor_theorem/taylor_theorem.html", mainPath: ["0:3:30:304:3041:30410:304102"], released: 1 },
        // 積分法30412
        { id: 304120, label: "リーマン積分", labelEn: "Riemann Integral", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/calculus/integral_calculus/riemann_integral/riemann_integral.html", mainPath: ["0:3:30:304:3041:30412:304120"], released: 1 },
        { id: 304121, label: "ルベーグ積分", labelEn: "Lebesgue Integral", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/calculus/integral_calculus/lebesgue_integral/lebesgue_integral.html", mainPath: ["0:3:30:304:3041:30412:304121"], released: 1 },
        // 変分法30413
        { id: 304130, label: "オイラー–ラグランジュ方程式", labelEn: "Euler–Lagrange Equation", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/calculus_of_variations/euler_lagrange_equation/euler_lagrange_equation.html", mainPath: ["0:3:30:304:3041:30413:304130"], released: 1 },
        { id: 304131, label: "変分原理", labelEn: "Variational Principles", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/calculus_of_variations/variational_principles/variational_principles.html", mainPath: ["0:3:30:304:3041:30413:304131"], released: 1 },
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
        // 原始的な代数的構造303000
        { id: 3030000, label: "マグマ", labelEn: "Magma", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/abstract_algebra/algebraic_structures/primitive_structures/magma/magma.html", mainPath: ["0:3:30:303:3030:30300:303000:3030000"] },
        { id: 3030001, label: "半群", labelEn: "Semigroup", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/abstract_algebra/algebraic_structures/primitive_structures/semigroup/semigroup.html", mainPath: ["0:3:30:303:3030:30300:303000:3030001"] },
        { id: 3030002, label: "モノイド", labelEn: "Monoid", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/abstract_algebra/algebraic_structures/primitive_structures/monoid/monoid.html", mainPath: ["0:3:30:303:3030:30300:303000:3030002"] },
        // 群論303001
        { id: 3030010, label: "群作用・対称群", labelEn: "Group Actions and Symmetric Groups", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/abstract_algebra/algebraic_structures/group_theory/group_actions/group_actions.html", mainPath: ["0:3:30:303:3030:30300:303001:3030010"] },
        //{ id: 3030011, label: "表現論", labelEn: "Representation Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/abstract_algebra/algebraic_structures/group_theory/representation_theory/representation_theory.html", mainPath: ["0:3:30:303:3030:30300:303001:3030011"] },
        { id: 3030012, label: "ホモロジー代数への接続", labelEn: "Connection to Homological Algebra", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/abstract_algebra/algebraic_structures/group_theory/homological_connection/homological_connection.html", mainPath: ["0:3:30:303:3030:30300:303001:3030012"] },
        // 環論303002
        { id: 3030020, label: "可換環論", labelEn: "Commutative Ring Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/abstract_algebra/algebraic_structures/ring_theory/commutative_ring/commutative_ring.html", mainPath: ["0:3:30:303:3030:30300:303002:3030020"] },
        { id: 3030021, label: "非可換環論", labelEn: "Noncommutative Ring Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/abstract_algebra/algebraic_structures/ring_theory/noncommutative_ring/noncommutative_ring.html", mainPath: ["0:3:30:303:3030:30300:303002:3030021"] },
        { id: 3030030, label: "ガロア理論", labelEn: "Galois Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/galois_theory/galois_theory.html", mainPath: ["0:3:30:303:3030:30300:303003:3030030"] },
        { id: 3030031, label: "代数方程式論", labelEn: "Theory of Algebraic Equations", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/algebraic_equations/algebraic_equations.html", mainPath: ["0:3:30:303:3030:30300:303003:3030031"] },
        // 実数の構成304004
        { id: 3040040, label: "有理数と無理数", labelEn: "Rational and Irrational Numbers", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/foundations_of_analysis/theory_of_real_numbers/construction_of_real_numbers/rational_and_irrational_numbers/rational_and_irrational_numbers.html", mainPath: ["0:3:30:304:3040:30400:304004:3040040"], released: 1 },
        { id: 3040041, label: "デデキント切断", labelEn: "Dedekind Cut", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/foundations_of_analysis/theory_of_real_numbers/construction_of_real_numbers/dedekind_cut/dedekind_cut.html", mainPath: ["0:3:30:304:3040:30400:304004:3040041"], released: 1 },
        { id: 3040042, label: "完備性（連続体の性質）", labelEn: "Completeness of the Continuum", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/foundations_of_analysis/theory_of_real_numbers/construction_of_real_numbers/completeness_of_the_continuum/completeness_of_the_continuum.html", mainPath: ["0:3:30:304:3040:30400:304004:3040042"], released: 1 },
        { id: 3040043, label: "コーシー列による体論的構成", labelEn: "Cauchy Sequence Construction of Fields", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/foundations_of_analysis/theory_of_real_numbers/construction_of_real_numbers/cauchy_sequence_construction/cauchy_sequence_construction.html", mainPath: ["0:3:30:304:3040:30400:304004:3040043"], released: 1 },
        // ルベーグ積分304121
        { id: 3041210, label: "収束定理（優収束定理、ファトウの補題）", labelEn: "Convergence Theorems", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/calculus/integral_calculus/lebesgue_integral/convergence_theorems/convergence_theorems.html", mainPath: ["0:3:30:304:3041:30412:304121:3041210"], released: 1 },
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
        { id: 30300200, label: "加群論", labelEn: "Module Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/abstract_algebra/algebraic_structures/ring_theory/commutative_ring/module_theory/module_theory.html", mainPath: ["0:3:30:303:3030:30300:303002:3030020:30300200"] },
        { id: 30300202, label: "代数幾何学", labelEn: "Algebraic Geometry", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/abstract_algebra/algebraic_structures/ring_theory/commutative_ring/algebraic_geometry/algebraic_geometry.html", mainPath: ["0:3:30:303:3030:30300:303002:3030020:30300202"] },
        { id: 30300210, label: "多元環論", labelEn: "Algebras over a Ring", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/algebras_over_ring/algebras_over_ring.html", mainPath: ["0:3:30:303:3030:30300:303002:3030021:30300210"] },
        { id: 30300211, label: "ワイル代数", labelEn: "Weyl Algebra", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/weyl_algebra/weyl_algebra.html", mainPath: ["0:3:30:303:3030:30300:303002:3030021:30300211"] },
        { id: 30300310, label: "解の可解性・代数的閉包・構造理論", labelEn: "Solvability and Algebraic Closure", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/algebraic_solvability/algebraic_solvability.html", mainPath: ["0:3:30:303:3030:30300:303003:3030031:30300310"] },
        // 有理数と無理数3040040
        { id: 30400400, label: "超越数論", labelEn: "Transcendental Number Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/foundations_of_analysis/theory_of_real_numbers/construction_of_real_numbers/rational_and_irrational_numbers/transcendental_number_theory/transcendental_number_theory.html", mainPath: ["0:3:30:304:3040:30400:304004:3040040:30400400"], released: 1 },
        // $L^{p}$空間3043000
        { id: 30430000, label: "ノルム空間", labelEn: "Norm Space", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/functional_analysis/function_space_theory/topological_vector_space/L_p_space/norm_space/norm_space.html", mainPath: ["0:3:30:304:3043:30430:304300:3043000:30430000"], released: 0 },

        // 深さ9
        // 加群論30300200
        { id: 303002000, label: "ホモロジー代数", labelEn: "Homological Algebra", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/homological_algebra/homological_algebra.html", mainPath: ["0:3:30:303:3030:30300:303002:3030020:30300200:303002000"] },
        { id: 303002001, label: "導来関手・Ext, Tor", labelEn: "Derived Functors (Ext, Tor)", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/derived_functors/derived_functors.html", mainPath: ["0:3:30:303:3030:30300:303002:3030020:30300200:303002001"] },
        // 代数幾何学30300202
        { id: 303002020, label: "代数多様体・スキーム・層理論", labelEn: "Algebraic Varieties, Schemes, and Sheaf Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/schemes_sheaves/schemes_sheaves.html", mainPath: ["0:3:30:303:3030:30300:303002:3030020:30300202:303002020"] },
        { id: 303002021, label: "層コホモロジー", labelEn: "Sheaf Cohomology", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/sheaf_cohomology/sheaf_cohomology.html", mainPath: ["0:3:30:303:3030:30300:303002:3030020:30300202:303002021"] },
        // 多元環論30300210
        { id: 303002100, label: "テンソル代数", labelEn: "Tensor Algebra", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/tensor_algebra/tensor_algebra.html", mainPath: ["0:3:30:303:3030:30300:303002:3030021:30300210:303002100"] },
        { id: 303002101, label: "リー代数", labelEn: "Lie Algebra", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/lie_algebra/lie_algebra.html", mainPath: ["0:3:30:303:3030:30300:303002:3030021:30300210:303002101"] },
        // ノルム空間30430000
        { id: 304300000, label: "バナッハ空間", labelEn: "Banach Space", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/functional_analysis/function_space_theory/topological_vector_space/L_p_space/norm_space/banach_space/banach_space.html", mainPath: ["0:3:30:304:3043:30430:304300:3043000:30430000:304300000"], released: 0 },
        { id: 304300001, label: "ヒルベルト空間", labelEn: "Hilbert Space", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/functional_analysis/function_space_theory/topological_vector_space/L_p_space/norm_space/hilbert_space/hilbert_space.html", mainPath: ["0:3:30:304:3043:30430:304300:3043000:30430000:304300001"], released: 0 },

        // 深さ10
        // ホモロジー代数303002000
        { id: 3030020000, label: "代数的トポロジー", labelEn: "Algebraic Topology", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/homological_algebra/homological_algebra.html", mainPath: ["0:3:30:303:3030:30300:303002:3030020:30300200:303002000:3030020000"] },
        // テンソル代数303002100
        { id: 3030021000, label: "線型代数学", labelEn: "Linear Algebra", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/linear_algebra/linear_algebra.html", mainPath: ["0:3:30:303:3030:30300:303002:3030021:30300210:303002100:3030021000"] },
        { id: 3030021001, label: "外積代数", labelEn: "Exterior Algebra", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/exterior_algebra/exterior_algebra.html", mainPath: ["0:3:30:303:3030:30300:303002:3030021:30300210:303002100:3030021001"] },
        { id: 3030021002, label: "対称代数", labelEn: "Symmetric Algebra", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/symmetric_algebra/symmetric_algebra.html", mainPath: ["0:3:30:303:3030:30300:303002:3030021:30300210:303002100:3030021002"] },
        { id: 3030021003, label: "クリフォード代数", labelEn: "Clifford Algebra", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/clifford_algebra/clifford_algebra.html", mainPath: ["0:3:30:303:3030:30300:303002:3030021:30300210:303002100:3030021003"] },
        // リー代数303002101
        { id: 3030021010, label: "カッツ・ムーディー代数", labelEn: "Kac–Moody Algebra", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/kac_moody/kac_moody.html", mainPath: ["0:3:30:303:3030:30300:303002:3030021:30300210:303002101:3030021010"] }
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

    // 2. 現在の記事ノードを特定
    try {
        // URLの末尾（例: mathematics.html）やフルパスで照合
        const currentUrl = window.location.href.split('?')[0].split('#')[0];
        console.log('Current URL:', currentUrl);

        // siteDataのurlと一致するものを探す（末尾一致などで柔軟に判定しても良い）
        //const currentNode = data.find(n => n.url && n.url === currentUrl);
        console.log(currentUrl.split('/').pop());
        const currentNode = siteData.find(n => n.url && (n.url === currentUrl || n.url.endsWith(currentUrl.split('/').pop())));
        console.log('Current node:', currentNode);

        if (!currentNode) {
            console.warn('Current node not found in siteData.');
            return;
        }

        // --- 各パーツの生成実行 ---
        // A. パンくずリスト生成
        renderBreadcrumbs(siteData, currentNode);
        // B. 公開日・編集日生成
        renderDateInfo(currentNode);
        // C. 下層記事一覧生成
        renderChildList(siteData, currentNode);
        // D. タグ一覧生成
        renderTagList(currentNode);
        // E. 関連記事リンク生成
        renderRelatedLinks(siteData, currentNode);
        // F. 前後記事リンク生成
        renderPager(siteData, currentNode);
        // G. 人気記事（これだけは別途 Views API等が必要ですが、枠組みだけ用意）
        renderPopularSection(siteData, ranking);
        // H. カテゴリー一覧生成
        renderCategoryList(siteData);
    } catch (error) {
        console.error('Error initializing page components:', error);
    }

    // --- 3. 生成関数の定義 ---

    // A. パンくずリスト <div class="breadcrumb_list">
    function renderBreadcrumbs(allData, current) {
        const container = document.getElementById('breadcrumb-list');
        if (!container) return;

        let html = `<a href="https://tatsuy-kobayashi.github.io/my-web/docs/"><i class="fa fa-home fa-fw" aria-hidden="true" style="margin-right:5px;"></i><span>Home</span></a>`;

        // まず mainPath があればそれを使う（siteData の id パス）
        let pathIds = [];
        if (current && current.mainPath) {
            const mp = Array.isArray(current.mainPath) ? current.mainPath[0] : current.mainPath;
            if (typeof mp === 'string') {
                pathIds = mp.split(':').map(s => parseInt(s, 10)).filter(n => !Number.isNaN(n));
            }
        }

        if (pathIds.length > 0) {
            // 最後の ID は現在の記事自身である想定のため、リンク生成は最後の要素を除外する
            pathIds.forEach((id, index) => {
                if (index >= pathIds.length - 1) return; // 最後はスキップ
                const pathNode = allData.find(n => n.id === id);
                if (pathNode) {
                    html += `<span class="sp" style="margin-right:5px; margin-left:5px;"><span class="fa fa-angle-right" aria-hidden="true"></span></span>`;
                    html += `<span class="link-container">`;

                    // iタグ（iconClass がある場合のみ）
                    let icon = '';
                    if (pathNode.iconClass) {
                        icon += `<i class="fa fa-solid ${pathNode.iconClass}" style="margin-right:5px;"></i>`;
                    } else if (pathNode.iconUrl)
                    {   // 代わりに iconUrl がある場合
                        icon += `<span class="icon ${pathNode.iconClass}" style="margin-right:5px;"></span>`;
                    }

                    // aタグ: preview-link 属性
                    const desc = pathNode.description || '説明はありません。';
                    const img = pathNode.imageUrl || '';
                    html += `<a href="${pathNode.url}" class="preview-link" data-title="${pathNode.label}" data-description="${desc}" data-image="${img}">` + icon + `${pathNode.label}</a>`;

                    // link-preview div
                    html += `<div class="link-preview">`;
                    html += `<a href="${pathNode.url}" class="link-preview-clickable">`;
                    if (img) {
                        html += `<img class="preview-image" src="${img}" alt="Preview image">`;
                    } else {
                        html += `<img class="preview-image" src="" alt="Preview image" style="display:none;">`;
                    }
                    html += `<h3 class="preview-title">${pathNode.label}</h3>`;
                    html += `<p class="preview-description">${desc}</p>`;
                    html += `</a>`;
                    html += `</div>`;

                    html += `</span>`;
                }
            });
            // 現在の記事（リンクなし）
            html += `<span class="sp" style="margin-right:5px; margin-left:5px;"><span class="fa fa-angle-right" aria-hidden="true"></span></span>`;
            // iタグ（iconClass がある場合のみ）
            if (current.iconClass) {
                html += `<i class="fa fa-solid ${current.iconClass}" style="margin-right:5px;"></i>`;
            } else if (current.iconUrl)
            {   // 代わりに iconUrl がある場合
                html += `<span class="icon ${current.iconClass}" style="margin-right:5px;"></span>`;
            }
            html += `<span>${current.label || ''}</span>`;
            container.innerHTML = html;
            return;
        }
        // mainPathがない場合、厳密に生成できないと判断してエラー処理
        console.error('Failed to generate breadcrumbs: mainPath not found in current node.');
        return;
    }

    /**
     * 公開日/編集日
     */
    function renderDateInfo(current) {
        const container = document.getElementById('date-info');
        if (!container) return;

        // ISO文字列を想定 (例: "2020-02-15T09:40:52Z")
        const rawPub = current.datePublished || null;
        const rawRev = current.dateModified || null;

        const toStringSafe = (v) => {
            if (v == null) return '';
            if (v instanceof Date) return v.toISOString();
            return String(v);
        };

        const pubDate = toStringSafe(rawPub);
        const revDate = toStringSafe(rawRev);

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

        container.innerHTML = html;
    }

    // **
    // * 下層記事一覧（階層構造メニュー）生成関数
    // * levelが現在より下（数値が大きい）記事を表示
    //  * @param {Array|Object} allData siteData.jsonの中身
    //  * @param {Object} currentEntry 現在の記事データ
    //
    function renderChildList(allData, current) {
        const container = document.getElementById('child-pages-list');
        if (!container) return;

        // siteData（allData）から子孫を取得する。
        // 以前の実装は current.dir_path に依存して早期リターンしてしまい、
        // siteData 内の mainPath ベースの抽出が実行されない不具合があった。
        // ここでは dir_path に依存せず mainPath を用いた抽出に委ねる。
        if (!Array.isArray(allData)) {
            try {
                allData = Object.values(allData);
            } catch (e) {
                allData = [];
            }
        }

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
            // mainPath の最後の ID でソート
            results.sort((a, b) => {
                const aPath = getFirstPath(a);
                const bPath = getFirstPath(b);
                const aId = parseInt(aPath.split(':').pop(), 10);
                const bId = parseInt(bPath.split(':').pop(), 10);
                return aId - bId;
            });
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
        const buildList = (parentPath) => {
            const children = immediateChildrenOf(parentPath);
            if (!children || children.length === 0) return '';
            let out = '<ul class="ul_pulldownList">';
            children.forEach(child => {
                const childPath = getFirstPath(child);
                const hasDesc = descendants.some(d => {
                    const dps = Array.isArray(d.mainPath) ? d.mainPath : [d.mainPath];
                    return dps.some(mp => typeof mp === 'string' && mp.startsWith(childPath + ':'));
                });
                out += '<li class="li_pulldownList">';
                // 深い子を持つ場合または現在ノードの直下の子（parentPath === currentPath）の場合は
                // <details><summary> でラップする。ただし内部リストは存在する場合のみ追加する。
                if (hasDesc || parentPath === currentPath) {
                    out += '<details class="details_pulldownList">';
                    out += `<summary class="summary_pulldownList">${makePreviewHtml(child)}</summary>`;
                    const inner = buildList(childPath);
                    if (inner) out += inner;
                    out += '</details>';
                } else {
                    out += makePreviewHtml(child);
                }
                out += '</li>';
            });
            out += '</ul> <!-- /.ul_pulldownList -->';
            return out;
        };

        container.innerHTML = buildList(currentPath);
    }

    /**
     * タグリスト生成
     */
    function renderTagList(current) {
        const container = document.getElementById('article-page-topic');
        if (!container) return;

        const keywords = Array.isArray(current && current.keywords) ? current.keywords : [];
        if (keywords.length === 0) {
            container.innerHTML = '';
            return;
        }

        let html = '';
        html += '<dl>';
        html += '<dt>関連タグ</dt>';
        html += '<dd>';

        keywords.forEach((kw, idx) => {
            const tagUrl = `https://tatsuy-kobayashi.github.io/my-web/docs/tags/${encodeURIComponent(kw)}`;
            html += `<span class="topic-label" data-index="${idx}">`;
            html += `<a href="${tagUrl}"><span class="topic-label-text"># ${String(kw)}</span></a>`;
            html += `</span>`;
        });

        html += '</dd>';
        html += '</dl>';

        container.innerHTML = html;
    }

    /**
     * 関連記事リンク
     * mainPath に基づいて同じ親を持つ兄弟ノードから関連リンクを生成
     */
    function renderRelatedLinks(allData, current) {
        const container = document.getElementById('related-entries');
        if (!container) return;

        // allData を配列に統一
        if (!Array.isArray(allData)) {
            try {
                allData = Object.values(allData);
            } catch (e) {
                allData = [];
            }
        }

        // 現在のノードがタグを持つか確認
        const currentKeywords = Array.isArray(current && current.keywords) ? current.keywords : [];
        if (currentKeywords.length === 0) {
            container.innerHTML = '';
            return;
        }

        // 同じタグを持つ記事をプール（ただし current 自身は除外）
        const relatedPool = allData.filter(item => {
            // 自身は除外
            if (item.id === current.id) return false;
            // リリースされていない記事は除外
            if (Number(item.released) !== 1) return false;
            // タグがない場合は除外
            const itemKeywords = Array.isArray(item.keywords) ? item.keywords : [];
            if (itemKeywords.length === 0) return false;

            // 一つでも同じタグがあるか確認
            return itemKeywords.some(kw => currentKeywords.includes(kw));
        });

        // 関連記事がない場合は何も表示しない
        if (relatedPool.length === 0) {
            container.innerHTML = '';
            return;
        }

        // ランダムに最大6件をシャッフル
        const shuffled = relatedPool.sort(() => Math.random() - 0.5).slice(0, 6);

        let html = `<h1 class="related-entry-heading">関連記事</h1>`;
        html += `<div class="related-list">`;

        shuffled.forEach(related => {
            const thumbUrl = Array.isArray(related.thumbnailUrl) && related.thumbnailUrl[1]
                ? related.thumbnailUrl[1] : '';

            // タグリストを表示（最初のタグのみ使用）
            const tagLabel = Array.isArray(related.keywords) && related.keywords.length > 0
                ? related.keywords[0]
                : '';
            const relatedDesc = related.description || '';

            html += `<a href="${related.url}" class="related-entry-card-wrap a-wrap border-element cf" title="${related.label}" data-nodal="">`;
            html += `<article class="related-entry-card e-card cf post type-post status-publish format-standard has-post-thumbnail hentry category-css-post">`;
            html += `<figure class="related-entry-card-thumb card-thumb e-card-thumb">`;
            if (thumbUrl) {
                html += `<img width="160" height="90" src="${thumbUrl}" class="related-entry-card-thumb-image card-thumb-image wp-post-image lazyautosizes lazyloaded" alt="" decoding="async" data-sizes="auto" data-eio-rwidth="160" data-eio-rheight="90" sizes="160px">`;
            } else {
                html += `<img width="160" height="90" src="" class="related-entry-card-thumb-image card-thumb-image wp-post-image" alt="" decoding="async" style="display:none;">`;
            }
            if (tagLabel) {
                html += `<span class="cat-label cat-label-81">${tagLabel}</span>`;
            }
            html += `</figure> <!-- /.related-entry-thumb -->`;
            html += `<div class="related-entry-card-content card-content e-card-content">`;
            html += `<h3 class="related-entry-card-title card-title e-card-title">${related.label}${relatedDesc ? `：${relatedDesc}` : ''}</h3>`;
            html += `</div> <!-- /.related-entry-card-content -->`;
            html += `</article> <!-- /.related-entry-card -->`;
            html += `</a> <!-- /.related-entry-card-wrap -->`;
        });

        html += `</div> <!-- /related-list -->`;
        container.innerHTML = html;
    }

    /**
     * 前後記事リンク
     * mainPath に基づいて同じ親を持つ兄弟ノードから前後のリンクを生成
     */
    function renderPager(allData, current) {
        const container = document.getElementById('pager-post-navi');
        if (!container) return;

        // allData を配列に統一
        if (!Array.isArray(allData)) {
            try {
                allData = Object.values(allData);
            } catch (e) {
                allData = [];
            }
        }

        // mainPath から経路情報を抽出するヘルパ
        const getFirstPath = (node) => {
            if (!node) return '';
            if (Array.isArray(node.mainPath) && node.mainPath.length > 0) return node.mainPath[0];
            if (typeof node.mainPath === 'string') return node.mainPath;
            return '';
        };

        const currentPath = getFirstPath(current);
        if (!currentPath) return;

        // 親パスを計算（最後の ID を除いたパス）
        const getParentPath = (path) => {
            const parts = path.split(':').filter(Boolean);
            if (parts.length <= 1) return ''; // ルートレベルには親がない
            return parts.slice(0, -1).join(':');
        };

        const parentPath = getParentPath(currentPath);
        if (!parentPath) return; // ルートレベルには兄弟がない

        // 同じ親を持つ兄弟を抽出
        const siblings = allData.filter(item => {
            const itemPath = getFirstPath(item);
            return getParentPath(itemPath) === parentPath;
        });

        // mainPath の最後の ID でソート
        siblings.sort((a, b) => {
            const aPath = getFirstPath(a);
            const bPath = getFirstPath(b);
            const aId = parseInt(aPath.split(':').pop(), 10);
            const bId = parseInt(bPath.split(':').pop(), 10);
            return aId - bId;
        });

        const currentIndex = siblings.findIndex(item => item.url === current.url);
        if (currentIndex === -1) {
            console.warn('Current node not found among siblings.');
            container.innerHTML = '';
            return;
        }
        const prev = siblings[currentIndex - 1];
        const next = siblings[currentIndex + 1];

        // サムネイル等の存在チェック用ヘルパ
        const thumbHtml = (node) => {
            if (!node) return '';
            if (Array.isArray(node.thumbnailUrl) && node.thumbnailUrl.length > 0 && node.thumbnailUrl[0]) {
                const src = node.thumbnailUrl[0];
                return `<figure class="${node === prev ? 'prev-post-thumb' : 'next-post-thumb'} card-thumb"><img width="120" height="68" src="${src}" class="attachment-thumb120 size-thumb120 wp-post-image lazyautosizes ls-is-cached lazyloaded" alt="" decoding="async"></figure>`;
            }
            return ''; // サムネイルが無ければ空
        };

        let html = '';
        if (prev && Number(prev.released) === 1) {
            const prevThumb = thumbHtml(prev);
            const prevDesc = prev.description || '';
            html += `<a href="${prev.url}" class="prev-post a-wrap border-element cf" data-nodal=""><div class="fa fa-chevron-left iconfont" aria-hidden="true"></div>${prevThumb}<div class="prev-post-title">${prev.label}${prevDesc ? `：${prevDesc}` : ''}</div></a>`;
        } else {
            html += `<span class="prev-post-placeholder">前の記事はありません</span>`;
        }

        if (next && Number(next.released) === 1) {
            const nextThumb = thumbHtml(next);
            const nextDesc = next.description || '';
            html += `<a href="${next.url}" class="next-post a-wrap cf" data-nodal=""><div class="fa fa-chevron-right iconfont" aria-hidden="true"></div>${nextThumb}<div class="next-post-title">${next.label}${nextDesc ? `：${nextDesc}` : ''}</div></a>`;
        } else {
            html += `<span class="next-post-placeholder">次の記事はありません</span>`;
        }

        container.innerHTML = html;
    }

    /**
     * 人気記事セクション
     * ここは閲覧数APIと結合する必要があります。
     * 記事の人気順ソートなどはサーバー側で行う想定です。
     */
    function renderPopularSection(allData, ranking) {
        const container = document.getElementById('popular_entries');
        if (!container) return;

        // allData を配列に統一
        if (!Array.isArray(allData)) {
            try {
                allData = Object.values(allData);
            } catch (e) {
                allData = [];
            }
        }
        // ranking を配列に統一
        if (!Array.isArray(ranking)) {
            try {
                ranking = Object.values(ranking);
            } catch (e) {
                ranking = [];
            }
        }

        const findNode = (id) => allData.find(n => n && n.id === id);

        // サムネイル等の存在チェック用ヘルパ
        const thumbHtml = (node) => {
            if (!node) return '';
            if (Array.isArray(node.thumbnailUrl) && node.thumbnailUrl.length > 0 && node.thumbnailUrl[0]) {
                const src = node.thumbnailUrl[0];
                return `<figure class="popular-entry-card-thumb widget-entry-card-thumb card-thumb"><img width="120" height="68" src="${src}" class="attachment-thumb120 size-thumb120 wp-post-image lazyautosizes ls-is-cached lazyloaded" alt="" decoding="async"></figure> <!-- /.popular-entry-card-thumb -->`;
            }
            return ''; // サムネイルが無ければ空
        };

        // simple escape helper
        function escapeHtml(str) {
            return String(str).replace(/[&<>"']/g, (s) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[s]));
        }

        let html = `<div class="popular-entry-cards widget-entry-cards no-icon cf border-partition ranking-visible">`;

        ranking.forEach(item => {
            // DOM へ追加
            const node = findNode(item.id) || {}; // allData 側の完全情報を優先
            const rankingThumb = thumbHtml(node);

            html += `<a href="${item.url}" class="popular-entry-card-link widget-entry-card-link a-wrap no-1" title="${escapeHtml(item.label||'')}" data-nodal="">`;
            html += `<div class="post-${item.id} popular-entry-card widget-entry-card e-card cf post type-post status-publish format-standard has-post-thumbnail hentry category-python-post">`;
            html += `${rankingThumb}`;
            html += `<div class="popular-entry-card-content widget-entry-card-content card-content">`;
            html += `<div class="popular-entry-card-title widget-entry-card-title card-title">${escapeHtml(item.label||node.label||'')}</div>`;
            html += `<div class="popular-entry-card-date widget-entry-card-date display-none">`;
            html += `<span class="popular-entry-card-post-date widget-entry-card-post-date post-date">${escapeHtml(node.datePublished||'')}</span>`;
            html += `<span class="popular-entry-card-update-date widget-entry-card-update-date post-update">${escapeHtml(node.dateModified||'')}</span>`;
            html += `</div>`;

            html += `</div> <!-- /.popular-entry-content -->`;
            html += `</div> <!-- /.popular-entry-card -->`;
            html += `</a> <!-- /.popular-entry-card-link -->`;
        });

        html += `</div>`;
        container.innerHTML = html;
    }

    /**
     * カテゴリー一覧生成
     */
    function renderCategoryList(allData) {
        const container = document.getElementById('categories');
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
        let html = '<ul>';
        const escapeHtml = (str) => String(str).replace(/[&<>"]+/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]||ch));
        tags.forEach((tag, idx) => {
            const tagId = idx;
            const url = `https://tatsuy-kobayashi.github.io/my-web/docs/tags/${encodeURIComponent(tag)}`;
            html += `<li class="cat-item cat-item-${tagId}">`;
            html += `<a href="${url}" data-nodal=""><span class="list-item-caption">${escapeHtml(tag)}</span></a>`;
            html += `</li>`;
        });
        html += '</ul>';

        container.innerHTML = html;
    }
});
