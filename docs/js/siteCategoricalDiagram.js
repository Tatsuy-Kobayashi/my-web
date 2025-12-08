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
    // url: ノードクリック時に開くURL
    // level: 深さ（現在は学問のみが明示的に持つ）
    // paths: ルートからのパス情報（複数可、多親対応）
    // released: 公開フラグ（0: 未公開、1: 公開）
    // description: ノード説明文
    // ------------------------
    console.log('[INIT] Loading nodesData...');
    const nodesData = [
        { id: 0, label: "学問", labelEn: "Academic Disciplines", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/academic_discipline.html", paths: ["0"], level: 0, released: 1, datePublished: 2024-9-28, dateModified: 2024-12-25, description: "あらゆる事物は何かしらの学問の一領域として捉えることができる" },

        // 深さ1
        { id: 1, label: "人文科学", labelEn: "Humanities", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/humanities/humanities.html", paths: ["0:1"], released: 1 },
        { id: 2, label: "社会科学", labelEn: "Social Sciences", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/social_science/social_science.html", paths: ["0:2"], released: 0 },
        { id: 3, label: "形式科学", labelEn: "Formal Sciences", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/formal_science.html", paths: ["0:3"], released: 1 },
        { id: 4, label: "自然科学", labelEn: "Natural Sciences", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/natural_science/natural_science.html", paths: ["0:4"], released: 1 },
        { id: 5, label: "応用科学", labelEn: "Applied Sciences", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/academic_discipline.html", paths: ["0:5"] },
        { id: 6, label: "学際領域", labelEn: "Interdisciplinary Fields", url: "https://tatsuy-kobayashi.github.io/my-web/docs/#", paths: ["0:6"], released: 0 },

        // 深さ2
        // 人文科学1
        { id: 10, label: "哲学", labelEn: "Philosophy", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/humanities/philosophy/philosophy.html", paths: ["0:1:10"], released: 0 },
        { id: 11, label: "芸術学", labelEn: "Art Studies", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/humanities/art_study/art_study.html", paths: ["0:1:11"], released: 0 },
        /*{ id: 11, label: "宗教学", labelEn: "Religious Studies", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/humanities/religious_study/religious_study.html", paths: ["0:1:11"] },*/
        { id: 12, label: "言語学", labelEn: "Linguistics", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/humanities/linguistics/linguistics.html", paths: ["0:1:12"] },
        { id: 13, label: "心理学", labelEn: "Psychology", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/humanities/psychology/psychology.html", paths: ["0:1:13"] },
        { id: 14, label: "人類学", labelEn: "Anthropology", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/humanities/anthropology/anthropology.html", paths: ["0:1:14"] },
        { id: 15, label: "考古学", labelEn: "Archaeology", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/humanities/archaeology/archaeology.html", paths: ["0:1:15"] },
        // 社会科学2
        { id: 20, label: "社会学", labelEn: "Sociology", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/social_science/sociology/sociology.html", paths: ["0:2:20"], released: 0 },
        { id: 21, label: "地理学", labelEn: "Geography", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/social_science/geography/geography.html", paths: ["0:2:21"], released: 0 },
        { id: 22, label: "歴史学", labelEn: "Historical Science", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/social_science/historical_science/historical_science.html", paths: ["0:2:22"], released: 0 },
        { id: 23, label: "政治学", labelEn: "Political Science", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/social_science/political_science/political_science.html", paths: ["0:2:23"], released: 0 },
        { id: 24, label: "経済学", labelEn: "Economics", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/social_science/economics/economics.html", paths: ["0:2:24"], released: 0 },
        { id: 25, label: "教育学", labelEn: "Pedagogy", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/social_science/pedagogy/pedagogy.html", paths: ["0:2:25"], released: 0 },
        // 形式科学3
        { id: 30, label: "数学", labelEn: "Mathematics", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/mathematics.html", paths: ["0:3:30"], released: 1, datePublished: 2024-9-30, dateModified: 2025-1-4, description: "数学とは、数量および空間図形の性質について研究する学問。" },
        { id: 31, label: "統計学", labelEn: "Statistics", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/statistics/statistics.html", paths: ["0:3:31"], released: 0 },
        // 自然科学4
        { id: 40, label: "物理学", labelEn: "Physics", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/natural_science/physics/physics.html", paths: ["0:4:40"], released: 1 },
        { id: 41, label: "化学", labelEn: "Chemistry", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/natural_science/chemistry/chemistry.html", paths: ["0:4:41"], released: 0 },
        { id: 42, label: "生物学", labelEn: "Biology", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/natural_science/biology/biology.html", paths: ["0:4:42"], released: 0 },
        { id: 43, label: "地学", labelEn: "Earth Science", url: "https://tatsuy-kobayashi.github.io/my-web/docs/#", paths: ["0:4:43"], released: 0 },
        // 応用科学5
        { id: 50, label: "情報学", labelEn: "Informatics", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/applied_science/informatics/informatics.html", paths: ["0:5:50"], released: 1 },
        { id: 51, label: "工学", labelEn: "Engineering", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/applied_science/engineering/engineering.html", paths: ["0:5:51"], released: 0 },
        { id: 52, label: "農学", labelEn: "Agricultural Science", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/applied_science/agricultural_science/agricultural_science.html", paths: ["0:5:52"], released: 0 },
        { id: 53, label: "医学", labelEn: "Medical Science", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/applied_science/medical_science/medical_science.html", paths: ["0:5:53"], released: 0 },

        // 深さ3
        // 数学30
        { id: 300, label: "数学用語", labelEn: "Mathematical Terms", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/mathematical_terms/mathematical_terms.html", paths: ["0:3:30:300"], released: 0 },
        { id: 301, label: "数学基礎論", labelEn: "Foundations of Mathematics", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/foundations_of_mathematics/foundations_of_mathematics.html", paths: ["0:3:30:301"], released: 0 },
        { id: 302, label: "数論", labelEn: "Number Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/number_theory/number_theory.html", paths: ["0:3:30:302"] },
        { id: 303, label: "代数学", labelEn: "Algebra", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/algebra.html", paths: ["0:3:30:303"] },
        { id: 304, label: "解析学", labelEn: "Analysis", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/analysis.html", paths: ["0:3:30:304"] },
        { id: 305, label: "幾何学", labelEn: "Geometry", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/geometry/geometry.html", paths: ["0:3:30:305"] },
        { id: 306, label: "離散数学", labelEn: "Discrete Mathematics", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/discrete_mathematics/discrete_mathematics.html", paths: ["0:3:30:306"] },
        { id: 307, label: "確率論", labelEn: "Probability Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/probability_theory/probability_theory.html", paths: ["0:3:30:307"] },
        // 物理学40
        { id: 400, label: "物理用語", labelEn: "Physical Terms", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/natural_science/physics/physical_terms/physical_terms.html", paths: ["0:4:40:400"], released: 0 },
        { id: 401, label: "古典物理学", labelEn: "Classical Physics", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/natural_science/physics/classical_physics/classical_physics.html", paths: ["0:4:40:401"], released: 0 },
        { id: 402, label: "量子物理学", labelEn: "Quantum Physics", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/natural_science/physics/quantum_physics/quantum_physics.html", paths: ["0:4:40:402"], released: 0 },
        { id: 403, label: "超ひも理論", labelEn: "Superstring Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/natural_science/physics/superstring_theory/superstring_theory.html", paths: ["0:4:40:403"], released: 0 },
        // 情報学50
        { id: 500, label: "IT用語", labelEn: "it_terms", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/applied_science/informatics/it_terms/it_terms.html", paths: ["0:5:50:500"], released: 1 },
        { id: 501, label: "情報理論", labelEn: "Information Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/applied_science/informatics/information_theory/information_theory.html", paths: ["0:5:50:501"], released: 0 },
        { id: 502, label: "計算理論", labelEn: "Theory of Computation", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/applied_science/informatics/theory_of_computation/theory_of_computation.html", paths: ["0:5:50:502"], released: 0 },
        { id: 503, label: "計算機科学", labelEn: "Computer Science", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/applied_science/informatics/computer_science/computer_science.html", paths: ["0:5:50:503"], released: 0 },
        { id: 504, label: "計算機工学", labelEn: "Computer Engineering", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/applied_science/informatics/computer_engineering/computer_engineering.html", paths: ["0:5:50:504"], released: 0 },
        { id: 505, label: "情報システム", labelEn: "Information System", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/applied_science/informatics/information_system/information_system.html", paths: ["0:5:50:505"], released: 0 },

        // 深さ4
        // 数学基礎論301
        { id: 3010, label: "数理論理学", labelEn: "Mathematical Logic", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/foundations_of_mathematics/mathematical_logic/mathematical_logic.html", paths: ["0:3:30:301:3010"], released: 0 },
        { id: 3011, label: "集合論", labelEn: "Set Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/foundations_of_mathematics/set_theory/set_theory.html", paths: ["0:3:30:301:3011"], released: 1, description: "集合の基本概念から応用まで解説。集合の定義、演算（和・積・差集合）、部分集合、冪集合などをPythonのコード例とベン図で分かりやすく学べる。数学の基礎を支える集合論の入門として最適。" },
        // 数論302
        { id: 3020, label: "数学定数", labelEn: "Mathematical Constants", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/number_theory/mathematical_constant/mathematical_constant.html", paths: ["0:3:30:302:3020"], released: 1 },
        // 代数学303
        { id: 3030, label: "抽象代数学", labelEn: "Abstract Algebra", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/abstract_algebra/abstract_algebra.html", paths: ["0:3:30:303:3030"] },
        { id: 3031, label: "普遍代数学", labelEn: "Universal Algebra", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/universal_algebra/universal_algebra.html", paths: ["0:3:30:303:3031"] },
        // 多親（代数・解析の両方の子）
        /*{ id: 3030, label: "代数解析学", labelEn: "Algebraic Analysis", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/algebraic_analysis/algebraic_analysis.html", paths: ["0:3:30:303:3030", "0:3:30:304:3030"], released: 0 },*/
        // 解析学304
        { id: 3040, label: "解析学基礎", labelEn: "Foundations of Analysis", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/analysis/foundations_of_analysis/foundations_of_analysis.html", paths: ["0:3:30:304:3040"], released: 1 },
        // 物理学401
        { id: 4010, label: "ニュートン力学", labelEn: "Newtonian Mechanics", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/natural_science/physics/classical_physics/newtonian_mechanics/newtonian_mechanics.html", paths: ["0:4:40:401:4010"], released: 0 },
        { id: 4011, label: "統計力学", labelEn: "Statistical Mechanics", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/natural_science/physics/classical_physics/statistical_mechanics/statistical_mechanics.html", paths: ["0:4:40:401:4011"], released: 0 },
        { id: 4012, label: "連続体の物理学", labelEn: "Physics of Continuum", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/natural_science/physics/classical_physics/physics_of_continuum/physics_of_continuum.html", paths: ["0:4:40:401:4012"], released: 0 },
        // 情報理論501
        { id: 5010, label: "符号理論", labelEn: "Coding Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/applied_science/informatics/information_theory/coding_theory/coding_theory.html", paths: ["0:5:50:501:5010"], released: 0 },
        { id: 5011, label: "暗号理論", labelEn: "Cryptography", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/applied_science/informatics/information_theory/cryptography/cryptography.html", paths: ["0:5:50:501:5011"], released: 0 },
        { id: 5012, label: "型理論", labelEn: "Type Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/applied_science/informatics/information_theory/type_theory/type_theory.html", paths: ["0:5:50:501:5012"], released: 0 },
        { id: 5013, label: "信号処理", labelEn: "Signal Processing", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/applied_science/informatics/information_theory/signal_processing/signal_processing.html", paths: ["0:5:50:501:5013"], released: 0 },
        // 計算理論502
        { id: 5020, label: "システム科学", labelEn: "Systems Science", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/applied_science/informatics/theory_of_computation/systems_science/systems_science.html", paths: ["0:5:50:502:5020"], released: 0 },
        { id: 5021, label: "プログラム構造", labelEn: "Structure of Programs", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/applied_science/informatics/theory_of_computation/structure_of_programs/structure_of_programs.html", paths: ["0:5:50:502:5021"], released: 0 },
        { id: 5022, label: "スキーマ", labelEn: "Schema", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/applied_science/informatics/theory_of_computation/schema/schema.html", paths: ["0:5:50:502:5022"], released: 0 },
        { id: 5023, label: "計算モデル", labelEn: "Model of Computation", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/applied_science/informatics/theory_of_computation/model_of_computation/model_of_computation.html", paths: ["0:5:50:502:5023"], released: 0 },
        { id: 5024, label: "アルゴリズム", labelEn: "Algorithm", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/applied_science/informatics/theory_of_computation/algorithm/algorithm.html", paths: ["0:5:50:502:5024"], released: 0 },
        { id: 5025, label: "計算可能性理論", labelEn: "Computability Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/applied_science/informatics/theory_of_computation/computability_theory/computability_theory.html", paths: ["0:5:50:502:5025"], released: 0 },
        { id: 5026, label: "計算複雑性理論", labelEn: "Computational Complexity Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/applied_science/informatics/theory_of_computation/computational_complexity_theory/computational_complexity_theory.html", paths: ["0:5:50:502:5026"], released: 0 },
        { id: 5027, label: "コンピュータ言語", labelEn: "Computer Language", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/applied_science/informatics/theory_of_computation/computer_language/computer_language.html", paths: ["0:5:50:502:5027"], released: 0 },
        { id: 5028, label: "プログラム意味論", labelEn: "Program Semantics", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/applied_science/informatics/theory_of_computation/program_semantics/program_semantics.html", paths: ["0:5:50:502:5028"], released: 0 },
        { id: 5029, label: "データサイエンス", labelEn: "Data Science", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/applied_science/informatics/theory_of_computation/data_science/data_science.html", paths: ["0:5:50:502:5029"], released: 0 },
        // 計算機科学503
        { id: 5030, label: "ハードウェア・エンジニアリング", labelEn: "Hardware Engineering", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/applied_science/informatics/computer_science/hardware_engineering/hardware_engineering.html", paths: ["0:5:50:503:5030"], released: 0 },
        { id: 5031, label: "ソフトウェア・エンジニアリング", labelEn: "Software Engineering", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/applied_science/informatics/computer_science/software_engineering/software_engineering.html", paths: ["0:5:50:503:5031"], released: 0 },
        { id: 5032, label: "コンピュータ・セキュリティ", labelEn: "Computer Security", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/applied_science/informatics/computer_science/computer_security/computer_security.html", paths: ["0:5:50:503:5032"], released: 0 },
        // 情報システム505
        { id: 5050, label: "コンピュータ・システム", labelEn: "Computer System", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/applied_science/informatics/information_system/computer_system/computer_system.html", paths: ["0:5:50:505:5050"], released: 0 },
        { id: 5051, label: "組込みシステム", labelEn: "Embedded System", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/applied_science/informatics/information_system/embedded_system/embedded_system.html", paths: ["0:5:50:505:5051"], released: 0 },

        // 深さ5
        // 集合論3011
        { id: 30110, label: "素朴集合論", labelEn: "Naive Set Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/foundations_of_mathematics/set_theory/naive_set_theory/naive_set_theory.html", paths: ["0:3:30:301:3011:30110"], released: 1, description: "素朴集合論の基礎から応用まで解説。素朴包括原理やパラドックス許容論理を中心に、Pythonによる実装例を交えながら、ラッセルのパラドックスや論理体系の修正についても学べる数学基礎論の入門記事。" },
        { id: 30111, label: "公理的集合論", labelEn: "Axiomatic Set Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/foundations_of_mathematics/set_theory/axiomatic_set_theory/axiomatic_set_theory.html", paths: ["0:3:30:301:3011:30111"], released: 1, description: "公理的集合論の基礎から発展まで解説。ZF集合論、NBG集合論、MK集合論など主要な体系を比較しながら、各公理の意味や相互関係、数学基礎論における役割を学べる。図解とともに体系的に理解できる入門記事。" },
        // 抽象代数学3030
        { id: 30300, label: "代数系一般論", labelEn: "Algebraic Structures", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/abstract_algebra/algebraic_structures/algebraic_structures.html", paths: ["0:3:30:303:3030:30300"] },
        { id: 30301, label: "表現論・ホモロジー代数", labelEn: "Representation and Homological Algebra", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/abstract_algebra/representation_homological/representation_homological.html", paths: ["0:3:30:303:3030:30301", "0:3:30:303:3030:30300:303001:30301"] },
        // 普遍代数学3031
        { id: 30310, label: "代数的構造の一般理論", labelEn: "General Theory of Algebraic Structures", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/general_structure_theory/general_structure_theory.html", paths: ["0:3:30:303:3031:30310"] },
        { id: 30311, label: "代数的理論（Lawvere理論）", labelEn: "Lawvere Theories", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/lawvere_theory/lawvere_theory.html", paths: ["0:3:30:303:3031:30311"] },
        { id: 30312, label: "モデル理論・論理代数", labelEn: "Model Theory and Algebraic Logic", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/model_theory/model_theory.html", paths: ["0:3:30:303:3031:30312"] },
        { id: 30313, label: "圏論的代数学", labelEn: "Categorical Algebra", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/categorical_algebra/categorical_algebra.html", paths: ["0:3:30:303:3031:30313"] },
        // プログラム構造5021
        { id: 50210, label: "データ表現", labelEn: "Data Representation", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/applied_science/informatics/theory_of_computation/structure_of_programs/data_representation/data_representation.html", paths: ["0:5:50:502:5021:50210"], released: 0 },
        { id: 50211, label: "型システム", labelEn: "Type System", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/applied_science/informatics/theory_of_computation/structure_of_programs/type_system/type_system.html", paths: ["0:5:50:502:5021:50211"], released: 0 },
        { id: 50212, label: "オブジェクト構造", labelEn: "Object Structure", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/applied_science/informatics/theory_of_computation/structure_of_programs/object_structure/object_structure.html", paths: ["0:5:50:502:5021:50212"], released: 0 },
        { id: 50213, label: "計算構造", labelEn: "Computation Structure", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/applied_science/informatics/theory_of_computation/structure_of_programs/computation_structure/computation_structure.html", paths: ["0:5:50:502:5021:50213"], released: 0 },
        // 計算モデル5023
        { id: 50230, label: "オートマトン理論", labelEn: "Automaton Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/applied_science/informatics/theory_of_computation/model_of_computation/automaton_theory/automaton_theory.html", paths: ["0:5:50:502:5023:50230"], released: 0 },

        // 深さ6
        // 公理的集合論30111
        { id: 301110, label: "ツェルメロ＝フレンケル集合論", labelEn: "Zermelo-Fraenkel Set Theory with the Axiom of Choice", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/foundations_of_mathematics/set_theory/axiomatic_set_theory/zermelo_fraenkel_choice_set_theory/zermelo_fraenkel_choice_set_theory.html", paths: ["0:3:30:301:3011:30111:301110"], released: 0 },
        // 代数系一般論30300
        { id: 303000, label: "原始的な代数的構造", labelEn: "Primitive Algebraic Structures", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/abstract_algebra/algebraic_structures/primitive_structures/primitive_structures.html", paths: ["0:3:30:303:3030:30300:303000"] },
        { id: 303001, label: "群論", labelEn: "Group Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/abstract_algebra/algebraic_structures/group_theory/group_theory.html", paths: ["0:3:30:303:3030:30300:303001"] },
        { id: 303002, label: "環論", labelEn: "Ring Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/abstract_algebra/algebraic_structures/ring_theory/ring_theory.html", paths: ["0:3:30:303:3030:30300:303002"] },
        { id: 303003, label: "体論", labelEn: "Field Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/abstract_algebra/algebraic_structures/field_theory/field_theory.html", paths: ["0:3:30:303:3030:30300:303003"] },
        { id: 303004, label: "その他の構造", labelEn: "Other Algebraic Structures", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/abstract_algebra/algebraic_structures/other_structures/other_structures.html", paths: ["0:3:30:303:3030:30300:303004"] },
        { id: 303100, label: "代数・準同型・同値関係・商構造", labelEn: "Algebras, Homomorphisms, Congruence Relations, and Quotients", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/algebras_homomorphisms/algebras_homomorphisms.html", paths: ["0:3:30:303:3031:30310:303100"] },
        { id: 303101, label: "代数的性質", labelEn: "Algebraic Properties", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/algebraic_properties/algebraic_properties.html", paths: ["0:3:30:303:3031:30310:303101"] },
        { id: 303130, label: "圏論", labelEn: "Category Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/category_theory/category_theory.html", paths: ["0:3:30:303:3031:30313:303130"] },
        { id: 303131, label: "基礎：関手・自然変換・極限・余極限", labelEn: "Functors, Natural Transformations, Limits and Colimits", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/functors_limits/functors_limits.html", paths: ["0:3:30:303:3031:30313:303131"] },
        { id: 303132, label: "構造：モナド・アジュンクション・エンリッチド圏", labelEn: "Monads, Adjunctions, and Enriched Categories", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/monads_adjunctions/monads_adjunctions.html", paths: ["0:3:30:303:3031:30313:303132"] },
        { id: 303133, label: "トポス論", labelEn: "Topos Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/topos_theory/topos_theory.html", paths: ["0:3:30:303:3031:30313:303133"] },
        { id: 303134, label: "高次圏論・圏的ホモトピー論", labelEn: "Higher Category Theory and Homotopical Algebra", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/higher_category_theory/higher_category_theory.html", paths: ["0:3:30:303:3031:30313:303134"] },

        // 深さ7
        // 原始的な代数的構造303000
        { id: 3030000, label: "マグマ", labelEn: "Magma", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/abstract_algebra/algebraic_structures/primitive_structures/magma/magma.html", paths: ["0:3:30:303:3030:30300:303000:3030000"] },
        { id: 3030001, label: "半群", labelEn: "Semigroup", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/abstract_algebra/algebraic_structures/primitive_structures/semigroup/semigroup.html", paths: ["0:3:30:303:3030:30300:303000:3030001"] },
        { id: 3030002, label: "モノイド", labelEn: "Monoid", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/abstract_algebra/algebraic_structures/primitive_structures/monoid/monoid.html", paths: ["0:3:30:303:3030:30300:303000:3030002"] },
        // 群論303001
        { id: 3030010, label: "群作用・対称群", labelEn: "Group Actions and Symmetric Groups", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/abstract_algebra/algebraic_structures/group_theory/group_actions/group_actions.html", paths: ["0:3:30:303:3030:30300:303001:3030010"] },
        //{ id: 3030011, label: "表現論", labelEn: "Representation Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/abstract_algebra/algebraic_structures/group_theory/representation_theory/representation_theory.html", paths: ["0:3:30:303:3030:30300:303001:3030011"] },
        { id: 3030012, label: "ホモロジー代数への接続", labelEn: "Connection to Homological Algebra", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/abstract_algebra/algebraic_structures/group_theory/homological_connection/homological_connection.html", paths: ["0:3:30:303:3030:30300:303001:3030012"] },
        // 環論303002
        { id: 3030020, label: "可換環論", labelEn: "Commutative Ring Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/abstract_algebra/algebraic_structures/ring_theory/commutative_ring/commutative_ring.html", paths: ["0:3:30:303:3030:30300:303002:3030020"] },
        { id: 3030021, label: "非可換環論", labelEn: "Noncommutative Ring Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/abstract_algebra/algebraic_structures/ring_theory/noncommutative_ring/noncommutative_ring.html", paths: ["0:3:30:303:3030:30300:303002:3030021"] },
        { id: 3030030, label: "ガロア理論", labelEn: "Galois Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/galois_theory/galois_theory.html", paths: ["0:3:30:303:3030:30300:303003:3030030"] },
        { id: 3030031, label: "代数方程式論", labelEn: "Theory of Algebraic Equations", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/algebraic_equations/algebraic_equations.html", paths: ["0:3:30:303:3030:30300:303003:3030031"] },

        // 深さ8
        { id: 30300200, label: "加群論", labelEn: "Module Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/abstract_algebra/algebraic_structures/ring_theory/commutative_ring/module_theory/module_theory.html", paths: ["0:3:30:303:3030:30300:303002:3030020:30300200"] },
        { id: 30300202, label: "代数幾何学", labelEn: "Algebraic Geometry", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/abstract_algebra/algebraic_structures/ring_theory/commutative_ring/algebraic_geometry/algebraic_geometry.html", paths: ["0:3:30:303:3030:30300:303002:3030020:30300202"] },
        { id: 30300210, label: "多元環論", labelEn: "Algebras over a Ring", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/algebras_over_ring/algebras_over_ring.html", paths: ["0:3:30:303:3030:30300:303002:3030021:30300210"] },
        { id: 30300211, label: "ワイル代数", labelEn: "Weyl Algebra", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/weyl_algebra/weyl_algebra.html", paths: ["0:3:30:303:3030:30300:303002:3030021:30300211"] },
        { id: 30300310, label: "解の可解性・代数的閉包・構造理論", labelEn: "Solvability and Algebraic Closure", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/algebraic_solvability/algebraic_solvability.html", paths: ["0:3:30:303:3030:30300:303003:3030031:30300310"] },

        // 深さ9
        { id: 303002000, label: "ホモロジー代数", labelEn: "Homological Algebra", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/homological_algebra/homological_algebra.html", paths: ["0:3:30:303:3030:30300:303002:3030020:30300200:303002000"] },
        { id: 303002001, label: "導来関手・Ext, Tor", labelEn: "Derived Functors (Ext, Tor)", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/derived_functors/derived_functors.html", paths: ["0:3:30:303:3030:30300:303002:3030020:30300200:303002001"] },
        { id: 303002020, label: "代数多様体・スキーム・層理論", labelEn: "Algebraic Varieties, Schemes, and Sheaf Theory", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/schemes_sheaves/schemes_sheaves.html", paths: ["0:3:30:303:3030:30300:303002:3030020:30300202:303002020"] },
        { id: 303002021, label: "層コホモロジー", labelEn: "Sheaf Cohomology", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/sheaf_cohomology/sheaf_cohomology.html", paths: ["0:3:30:303:3030:30300:303002:3030020:30300202:303002021"] },
        { id: 303002100, label: "テンソル代数", labelEn: "Tensor Algebra", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/tensor_algebra/tensor_algebra.html", paths: ["0:3:30:303:3030:30300:303002:3030021:30300210:303002100"] },
        { id: 303002101, label: "リー代数", labelEn: "Lie Algebra", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/lie_algebra/lie_algebra.html", paths: ["0:3:30:303:3030:30300:303002:3030021:30300210:303002101"] },

        // 深さ10
        { id: 3030020000, label: "代数的トポロジー", labelEn: "Algebraic Topology", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/homological_algebra/homological_algebra.html", paths: ["0:3:30:303:3030:30300:303002:3030020:30300200:303002000:3030020000"] },
        { id: 3030021000, label: "線型代数学", labelEn: "Linear Algebra", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/linear_algebra/linear_algebra.html", paths: ["0:3:30:303:3030:30300:303002:3030021:30300210:303002100:3030021000"] },
        { id: 3030021001, label: "外積代数", labelEn: "Exterior Algebra", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/exterior_algebra/exterior_algebra.html", paths: ["0:3:30:303:3030:30300:303002:3030021:30300210:303002100:3030021001"] },
        { id: 3030021002, label: "対称代数", labelEn: "Symmetric Algebra", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/symmetric_algebra/symmetric_algebra.html", paths: ["0:3:30:303:3030:30300:303002:3030021:30300210:303002100:3030021002"] },
        { id: 3030021003, label: "クリフォード代数", labelEn: "Clifford Algebra", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/clifford_algebra/clifford_algebra.html", paths: ["0:3:30:303:3030:30300:303002:3030021:30300210:303002100:3030021003"] },
        { id: 3030021010, label: "カッツ・ムーディー代数", labelEn: "Kac–Moody Algebra", url: "https://tatsuy-kobayashi.github.io/my-web/docs/academic_discipline/formal_science/mathematics/algebra/kac_moody/kac_moody.html", paths: ["0:3:30:303:3030:30300:303002:3030021:30300210:303002101:3030021010"] }
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
    // 内容     : nodes に含まれる paths を元に、各ノードの level を計算する
    // 引数     : nodes - ノード配列
    // 戻り値   : maxAvailableLevel (int)
    // ------------------------
    function vof_ensureLevelsFromPaths(nodes) {
        maxAvailableLevel = 0;
        for (const n of nodes) {
            if (!n.paths || n.paths.length === 0) continue;
            const depths = n.paths.map(p => p.split(":").length - 1);
            n.level = Math.min(...depths);       // ルートが level 0 として整合
            if (typeof n.level === 'number' && Number.isFinite(n.level)) {
                maxAvailableLevel = Math.max(maxAvailableLevel, n.level);
            }
        }
        return maxAvailableLevel;
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
            const paths = n.paths || [];
            for (const pathStr of paths) {
                const parts = pathStr.split(":").map(Number);

                // 末尾が自身のIDで終わっているか（データ健全性チェック）
                if (parts[parts.length - 1] !== n.id) continue;

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
            const paths = n.paths || [];
            for (const p of paths) {
                const parts = p.split(':').map(Number);
                for (let i = 0; i < parts.length - 1; i++) {
                    const parent = parts[i];
                    const child  = parts[i + 1];
                    if (!ids.has(parent) || !ids.has(child)) continue;
                    if (!__childrenMap.has(parent)) __childrenMap.set(parent, new Set());
                    __childrenMap.get(parent).add(child);
                    if (!__parentsMap.has(child)) __parentsMap.set(child, new Set());
                    __parentsMap.get(child).add(parent);
                }
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
            // helper: clamp and hex
            const clamp = v => Math.max(0, Math.min(255, Math.round(v)));
            const toHex = v => ('0' + clamp(v).toString(16)).slice(-2);

            // get selected color mode ('default-color' or 'rainbow')
            const colorModeEl = document.querySelector('input[name="colorMode"]:checked');
            const colorMode = colorModeEl ? colorModeEl.value : 'default-color';

            // determine category from a path: return integer 1..6 or null
            const detectCategoryFromNode = (n) => {
                const paths = n.paths || [];
                if (!paths.length) return null;
                for (const p of paths) {
                    const parts = p.split(':').map(Number);
                    if (parts.length >= 2 && parts[0] === 0) {
                        return parts[1]; // 1..6 expected
                    }
                }
                return null;
            };

            // compute rainbow color according to spec
            const computeRainbowHex = (n) => {
                const l = (typeof n.level === 'number' && Number.isFinite(n.level)) ? n.level : 0;
                const cat = detectCategoryFromNode(n);
                // root
                if (n.id === 0 || l === 0) {
                    return `#${toHex(255)}${toHex(255)}${toHex(255)}`; // white
                }
                const level = l; // level >=1 for children
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
            };

            // border darker
            const darkenHex = (hex, amount = 30) => {
                // hex #rrggbb
                const r = parseInt(hex.slice(1,3),16);
                const g = parseInt(hex.slice(3,5),16);
                const b = parseInt(hex.slice(5,7),16);
                return `#${toHex(r - amount)}${toHex(g - amount)}${toHex(b - amount)}`;
            };

            // Map nodeList to nodes for vis, applying color mode
            const mappedNodes = nodeList.map(n => {
                const nodeCopy = Object.assign({}, n); // shallow copy
                if (colorMode === 'rainbow') {
                    const bg = computeRainbowHex(n);
                    const border = darkenHex(bg, 30);
                    nodeCopy.color = { background: bg, border: border, highlight: { background: bg, border: border } };
                } else {
                    // colorMode === 'default-color': 共通のデフォルトカラーを明示的に適用（古い色を上書き）
                    nodeCopy.color = { background: '#97C2FC', border: '#2B7CE9', highlight: { background: '#D2E5FF', border: '#2B7CE9' } };
                }
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

    // ------------------------
    // STATE 1: DATA_INITIALIZATION
    // （ここでは簡単なバリデーションを行う）
    // ------------------------
    function validateData() {
        currentState = STATE.DATA_INITIALIZATION;
        console.log('[STATE] DATA_INITIALIZATION');

        // ノード id 重複チェック
        const ids = new Set();
        for (const n of nodesData) {
            if (ids.has(n.id)) {
                console.error('[ERROR] nodesData に重複 id が存在します:', n.id);
                errorFlags.invalidData = true;
            }
            ids.add(n.id);
        }

        // エッジの参照チェックpaths の整合チェック: 各 path の各要素が存在するか、および path の末尾が自身の id であるか
        for (const n of nodesData) {
            if (!n.paths) continue;
            for (const p of n.paths) {
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

        // ensure levels are present/consistent かつ最大深さを計算
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

    // 再レンダリング（現在表示中のノード/エッジを再取得して色を再適用）
    function refreshNetworkColors() {
        if (!network || !network.body || !network.body.data) return;
        try {
            const currentNodes = network.body.data.nodes.get(); // 表示中のノード配列
            const currentEdges = network.body.data.edges.get(); // 表示中のエッジ配列
            // vof_setNetworkData は色付けロジックを参照して再描画するのでこれを呼ぶ
            vof_setNetworkData(currentNodes, currentEdges);
            console.log('[UI] refreshNetworkColors executed, nodes=', currentNodes.length, 'edges=', currentEdges.length);
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
                    // 現在表示しているノード/エッジを再取得して色を再適用
                    refreshNetworkColors();
                });
            }
        }
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
