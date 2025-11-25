# 実装計画: 生成AIで1週間の夜の献立計画

**ブランチ**: `001-impl-plan` | **日付**: 2025-11-25 | **仕様**: /specs/001-ai-weekly-menu/spec.md  
**入力**: `/specs/001-ai-weekly-menu/spec.md` の仕様書

**注意**: このテンプレートは `/speckit.plan` コマンドによって生成されます。ローカル自動化は
`.specify/scripts/bash/setup-plan.sh` を参照してください。

## サマリー

- スコープ: 夜のみ・7スロット（7日×夜）。朝は非スコープ。
- FR-017: 朝用リザーブの確保（在庫を使い切らず最小余剰を残し、表示で明示）。
- FR-018: 料理カテゴリの非連続（隣接日で同一カテゴリ〈和/洋/中〉を禁止）。
- アーキテクチャ: Library-First（packages/menu-core）+ Backend API（backend）。OpenAI 互換アダプタ採用。
- 契約/テスト: Contract-first（contracts/openapi.yaml）。US ごとに契約/結合テストを先行。

## 技術コンテキスト

<!--
  必要な作業: この節の内容をプロジェクト固有の技術詳細に置き換えてください。
  以下の構造は反復の指針としての助言であり、必須ではありません。
-->

**言語/バージョン**: Node.js 20 + TypeScript 5  
**主要依存**: Fastify, Zod, Prisma（SQLite）, OpenAI 互換アダプタ, csv-stringify, pdfkit  
**ストレージ**: SQLite（Prisma）  
**テスト**: 契約/結合/ユニット（ランナーは要選定: NEEDS CLARIFICATION）  
**ターゲットプラットフォーム**: Linux サーバ（ローカル開発/CI）
**プロジェクト種別**: web + library（モノレポ: packages/menu-core + backend）  
**性能目標**: 体感最適化（段階的表示・部分生成）。具体 SLO は別途設定（NEEDS CLARIFICATION）  
**制約**: コスト/トークン効率重視、アレルゲン混入率=0 を厳守  
**スケール/スコープ**: 当面は単一ノード/SQLite 運用（将来 PostgreSQL へ拡張）

## 憲章チェック（Constitution Check）

フェーズ0開始前に通過。フェーズ1後に再チェック。

- Library-First（ライブラリ優先）: packages/menu-core にコア機能を集約（OK）。
- CLI Interface（CLI インターフェース）: T059–T063 で CLI（parse/plan/shopping-list/export）を公開（計画済/必須）。
- Test-First（テスト先行・非交渉）: US ごとに契約/結合テストを先行（T021–T023, T033–T035, T042–T045 ほか）（OK）。
- Integration Testing（結合テスト）: Contract-first + 結合テストで境界を検証（OK）。

ゲート評価: 現状 OK（CLI はフェーズ2前に動作確認が必要）。

## プロジェクト構成

### ドキュメント（この機能）

```
specs/001-ai-weekly-menu/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
└── tasks.md
```

### ソースコード（リポジトリルート）
<!--
  必要な作業: 下記のプレースホルダ構成を、この機能に合わせた具体的な構成に置換してください。
  未使用のオプションは削除し、選択した構成を実パス（例: apps/admin, packages/xxx）で展開します。
  提出する計画からは「Option」ラベルを削除してください。
-->

```
packages/
└── menu-core/
    └── src/
        ├── parsing/
        ├── planner/
        ├── validation/
        ├── aggregate/
        ├── llm/
        └── cli/

backend/
└── src/
    ├── routes/
    ├── services/
    ├── middleware/
    └── config/

backend/tests/
├── contract/
├── integration/
└── unit/
```

**構成の決定**: Library-First のモノレポ（packages/menu-core + backend）に確定。

## 複雑性トラッキング（必要時のみ）

※ 憲章チェックの違反があり、正当化が必要な場合のみ記入

| 逸脱内容 | 必要理由 | 却下したより簡単な代替 |
|----------|----------|--------------------------|
| [例: 4つ目のプロジェクト] | [現時点の必要性] | [3つでは不十分な理由] |
| [例: Repository パターン] | [具体的な課題] | [DB 直接アクセスを却下した理由] |
