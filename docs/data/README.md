# 公開用JSON

このディレクトリのJSONは `data/source` から生成した公開用出力です。正本の編集とコマンドは [データの編集・検証・公開準備](../../data/README.md) を参照してください。

```powershell
npm run data:build
npm run data:check
npm test
```

| ファイル | 内容 |
|---|---|
| siteData.json | 記事、直接の主親・副親、各親の下の表示順 |
| concepts.json | 概念。siteRefの公開互換属性は記事正本と階層から生成 |
| relations.json | 採用済み18関係。正規方向だけを保存し、`confidence` と `strength` を分離 |
| relationTypes.json | 22型、逆関係、意味論、根拠条件、表示用 `presentation` |
| rankingConfig.json | ランキング伝播係数の版付き設定 |
| learningRoadmaps.json | 記事内専用ロードマップ。審査・試行を経たpublishedだけを出力。初期0件 |
| queryIntents.json | 検索意図 |
| siteHierarchy.json | mainPath・auxPath・levelと直接辺 |
| searchSource.json | 698記事の検索メタデータと公開記事の本文 |
| keywordEdges.json | 共通キーワードから生成した157辺 |
| ranking.json | 698記事のスコア |
| manifest.json | 契約版、評価日時、入力・出力ハッシュ、本文欠落の警告 |

JS生成器とvalidateRelations.jsは再利用する下位部品としてここに残しています。個別生成器を実行しても公開manifestは更新されないため、公開準備には必ず一括コマンドを使ってください。

関係事実の `confidence` は採用根拠への確信、`strength` は関係の強さです。線の優先度・破線・矢印は `relationTypes.json` の `presentation`、主辺・副辺・逆向き・共通タグの伝播係数は `rankingConfig.json` が正本です。ランキング出力は設定ファイルの版とハッシュを保存し、混在を検査します。

型定義は [学問構造と圏の第15章](../../学問分類学問構造思想/学問構造と圏.md) に対応します。2026-09-14に未充足だった6件は、2026-09-15に4件を根拠補完、2件を編集候補へ移しました。現在の公開関係ではstrict-evidenceの警告は0件です。

部分検査には次も使えます。正本からの再生成と全体の鮮度検査は一括コマンドが担当します。

```powershell
node docs/data/validateRelations.js --strict-evidence
node docs/data/generateSiteHierarchy.js --check
```

旧単一ファイル版とAD書は対象外です。公開する際はJSON一式と対応するESモジュールを同じリリースに含めてください。

学習ロードマップの正本・下書き・ローカルプレビュー・審査方法は [編集・評価手順](../../調査設計/learningRoadmaps/編集・評価手順.md) を参照してください。専用の教育的関係はrelations.jsonやランキング辺へ追加されません。
