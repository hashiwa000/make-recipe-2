---
description: "AI 週次献立プランナーの実装タスクリスト（依存順・並列可視化付き）"
---

# タスク: 生成AIで1週間の夜の献立計画（001-ai-weekly-menu）

入力: このタスクは specs/001-ai-weekly-menu/ 配下の設計資料（plan.md, spec.md, data-model.md, contracts/, research.md, quickstart.md）に基づき生成。ユーザー入力: なし（$ARGUMENTS は空）。

技術スタック（research.md より）: Node.js 20 + TypeScript、Fastify、Zod、Prisma + SQLite、OpenAI 互換アダプタ、csv-stringify、pdfkit。アーキテクチャ: Library-First（packages/menu-core）+ API（backend）。

形式ルール: すべてのタスクは `- [ ] T### [P?] [US?] 説明（明確なファイルパス）` に従う。

---

## フェーズ1: セットアップ（プロジェクト初期化）

目的: ライブラリ優先のモノレポ構成（packages/menu-core + backend）と開発基盤を初期化。

- [ ] T001 ルート構成作成: packages/menu-core/, backend/, docs/ を作成し README を設置
- [ ] T002 Node/TS 初期化: packages/menu-core/package.json と tsconfig.json の作成
- [ ] T003 Node/TS 初期化: backend/package.json と tsconfig.json の作成
- [ ] T004 [P] ESLint/Prettier 設定: .eslintrc.cjs, .prettierrc をリポジトリ直下に作成
- [ ] T005 [P] 共通スクリプト整備: ルート package.json に `build`, `lint`, `test` スクリプト追加
- [ ] T006 [P] 環境変数雛形: backend/.env.example に LLM/DB 設定キー追加
- [ ] T007 [P] Git 忽略: .gitignore へ node_modules, dist, .env を追加
- [ ] T008 menu-core エントリ: packages/menu-core/src/index.ts と型定義の雛形追加
- [ ] T009 backend エントリ: backend/src/server.ts（Fastify 起動雛形）を追加
- [ ] T010 [P] OpenAPI 契約同期: specs/001-ai-weekly-menu/contracts/openapi.yaml を backend に参照コピー（スクリプト）

---

## フェーズ2: 基盤（全ストーリーの前提条件）

目的: すべてのストーリーをブロックする基盤の整備。完了までユーザーストーリー着手禁止。

- [ ] T011 Zod スキーマ: packages/menu-core/src/schema/entities.ts に UserProfile/Plan/MealSlot/Recipe/IngredientRef/ShoppingItem/ShareLink を定義
- [ ] T012 [P] DTO/Constraints: packages/menu-core/src/schema/constraints.ts に Constraints/PlanRequest/ParseInput DTO を定義
- [ ] T013 Prisma セットアップ: backend/prisma/schema.prisma に data-model.md のエンティティを定義
- [ ] T014 [P] Prisma マイグレーション: backend/prisma/migrations/ 初期マイグレーション作成（SQLite）
- [ ] T015 [P] LLM アダプタ: packages/menu-core/src/llm/openai-compatible.ts（プロバイダ差し替え可能）
- [ ] T016 エラーハンドリング: backend/src/middleware/error-handler.ts（ZodError/業務例外→HTTP 変換）
- [ ] T017 [P] ロギング: backend/src/middleware/logger.ts（リクエスト/応答・監査ログ基盤）
- [ ] T018 ルーティング基盤: backend/src/routes/index.ts（Fastify 登録・CORS・JSON）
- [ ] T019 [P] 設定管理: backend/src/config/env.ts（dotenv＋スキーマ検証）
- [ ] T020 [P] メニューコア公開: packages/menu-core/src/index.ts から parser/planner をエクスポート

チェックポイント: 基盤準備完了。以降、各 US を独立に並行開始可能。

---

## フェーズ3: ユーザーストーリー1（P1）🎯 MVP

ゴール: 「購入した材料」のフリーテキストから7スロット（夜のみ）の献立を生成し、入力材料の≥80%活用。料理カードに入力材料/追加購入の区別を付与。

独立テスト基準: テキスト→正規化→Plan（7スロット）生成、各料理の主要材料に入力が紐づくこと。

### テスト（契約/結合）

- [ ] T021 [P] [US1] 契約テスト: backend/tests/contract/parse_ingredients.spec.ts（POST /parse-ingredients → 200 + IngredientParseResult）
- [ ] T022 [P] [US1] 契約テスト: backend/tests/contract/plans_create.spec.ts（POST /plans → 202 + Plan）
- [ ] T023 [P] [US1] 結合テスト: backend/tests/integration/plan_generation.spec.ts（材料80%活用・7スロット検証）

### 実装

- [ ] T024 [P] [US1] パーサ: packages/menu-core/src/parsing/ingredient-normalizer.ts（俗称→正規名/単位正規化）
- [ ] T025 [P] [US1] 入力→DTO: packages/menu-core/src/parsing/parse-input.ts（text→IngredientRef[] 返却）
- [ ] T026 [P] [US1] プラン生成: packages/menu-core/src/planner/plan-generator.ts（7スロット〈夜のみ〉生成・多様性/活用率ルール）
- [ ] T027 [P] [US1] 料理モデル補完: packages/menu-core/src/planner/recipe-filler.ts（手順/栄養の雛形生成）
- [ ] T028 [US1] API: backend/src/routes/parse-ingredients.ts（POST /parse-ingredients）
- [ ] T029 [US1] API: backend/src/routes/plans.ts（POST /plans, GET /plans/{id}、ストリーミング可）
- [ ] T030 [US1] 永続化: backend/src/services/plan-repository.ts（Prisma 経由 CRUD）
- [ ] T031 [US1] バリデーション: packages/menu-core/src/validation/generation-rules.ts（活用率≥80%検査）
- [ ] T032 [US1] 監査ログ: backend/src/services/audit-logger.ts（入力条件・要約・生成履歴）

#### 朝用リザーブ（FR-017）

- [ ] T056 [P] [US1] リザーブポリシー: packages/menu-core/src/planner/reserve-policy.ts（最小余剰量の計算/適用。在庫を使い切らない）
- [ ] T057 [US1] 表示/注記: backend/src/transformers/plan-view.ts（料理カード/買い物リストに「朝用リザーブ」ラベル付与）
- [ ] T058 [P] [US1] 結合テスト: backend/tests/integration/reserve_policy.spec.ts（最小余剰の確保とラベル表示を検証）

チェックポイント: US1 は単体で動作し、契約/結合テストがグリーン。

---

## フェーズ4: ユーザーストーリー2（P2）

ゴール: 予算/時間/カロリー/嗜好/除外/アレルギーなどの条件反映と、スロット単位の再生成・ロック。

独立テスト基準: 条件変更で要件を満たす提案が出る。特定スロットのみ再生成できる。

### テスト（契約/結合）

- [ ] T033 [P] [US2] 契約テスト: backend/tests/contract/slot_regenerate.spec.ts（PATCH /plans/{planId}/slots/{slotId} → 200）
- [ ] T034 [P] [US2] 契約テスト: backend/tests/contract/slot_lock.spec.ts（POST /plans/{planId}/slots/{slotId}/lock → 200）
- [ ] T035 [P] [US2] 結合テスト: backend/tests/integration/constraints_apply.spec.ts（maxTime/アレルゲン/嗜好比率/非連続）

### 実装

- [ ] T036 [P] [US2] 制約適用: packages/menu-core/src/planner/constraints-applier.ts（時間/カロリー/嗜好/除外/予算）
- [ ] T037 [P] [US2] 再生成: packages/menu-core/src/planner/slot-regenerator.ts（スロット単位生成・ロック尊重）
- [ ] T038 [US2] API: backend/src/routes/slots.ts（PATCH /plans/:planId/slots/:slotId）
- [ ] T039 [US2] API: backend/src/routes/slot-lock.ts（POST /plans/:planId/slots/:slotId/lock）
- [ ] T040 [US2] 検証: packages/menu-core/src/validation/allergen-guard.ts（アレルゲン混入ブロック）
- [ ] T041 [US2] 嗜好/多様性: packages/menu-core/src/validation/diversity-rules.ts（同一料理≤15%・和洋中比率・非連続〈隣接日で同一カテゴリ禁止〉）

チェックポイント: US2 単体で条件反映と再生成/ロックが検証可能。

---

## フェーズ5: ユーザーストーリー3（P3）

ゴール: 買い物リスト集計（単位統一・カテゴリ分け・重複統合）と CSV/PDF エクスポート。

独立テスト基準: 集計結果がカテゴリ別数量で表示でき、CSV ダウンロードが可能。

### テスト（契約/結合）

- [ ] T042 [P] [US3] 契約テスト: backend/tests/contract/shopping_list.spec.ts（GET /plans/{planId}/shopping-list → 200 + ShoppingList）
- [ ] T043 [P] [US3] 契約テスト: backend/tests/contract/export_csv.spec.ts（GET /plans/{planId}/export.csv → 200 text/csv）
- [ ] T044 [P] [US3] 契約テスト: backend/tests/contract/export_pdf.spec.ts（GET /plans/{planId}/export.pdf → 200 application/pdf）
- [ ] T045 [P] [US3] 結合テスト: backend/tests/integration/shopping_aggregate.spec.ts（単位変換と合算）

### 実装

- [ ] T046 [P] [US3] 集計: packages/menu-core/src/aggregate/shopping-list.ts（単位変換テーブル・カテゴリ割当）
- [ ] T047 [P] [US3] CSV: backend/src/routes/export-csv.ts（GET /plans/:planId/export.csv、csv-stringify）
- [ ] T048 [P] [US3] PDF: backend/src/routes/export-pdf.ts（GET /plans/:planId/export.pdf、pdfkit）
- [ ] T049 [US3] API: backend/src/routes/shopping-list.ts（GET /plans/:planId/shopping-list）

チェックポイント: US3 単体で集計とエクスポートが検証可能。

---

## 最終フェーズ: 仕上げ・横断関心事

- [ ] T050 [P] docs 更新: specs/001-ai-weekly-menu/quickstart.md の手順検証・更新
- [ ] T051 安全/注記: backend/src/middleware/safety-notice.ts（免責/注意書き付与）
- [ ] T052 [P] 監査拡充: backend/src/services/audit-logger.ts（再生成履歴の詳細化）
- [ ] T053 [P] パフォーマンス: packages/menu-core/src/planner/token-optimization.ts（プロンプト最適化/スロット分割）
- [ ] T054 コード整備: 不要依存/未使用コードの削除と命名統一
- [ ] T055 [P] 追加ユニットテスト: backend/tests/unit/ と packages/menu-core/tests/unit/

---

## 依存関係と実行順序

- フェーズ順序: セットアップ（1）→ 基盤（2）→ US1（3）→ US2（4）→ US3（5）→ 仕上げ
- ユーザーストーリー間依存: すべてフェーズ2に依存。US1/US2/US3 は論理的に独立（API 経由で検証可能）。
- タスク依存例:
  - T013→T014（Prisma スキーマ定義後にマイグレーション）
  - T024/T025→T026（パース後にプラン生成）
  - T036→T037→T038（制約適用→再生成→API）
  - T046→T047/T049（集計→CSV/JSON 提供）

### 並行実行の機会（例）

- セットアップ: T004, T005, T006, T007, T010 は並行可
- 基盤: T012, T015, T017, T019, T020 は並行可
- US1: T021–T023（テスト）は並行可、T024–T027（ライブラリ実装）も並行可
- US2: T033–T035（テスト）並行可、T036/T041 並行可
- US3: T042–T045（テスト）並行可、T046 と T048 並行可

---

## 実装戦略（MVP 先行・段階的デリバリ）

- MVP は US1 のみ（P1）。まずテキスト→7スロット（夜のみ）生成と主要材料紐付けを完成。
- 次に US2（制約・再生成/ロック）で体験と制御性を向上。
- 最後に US3（買い物リスト・エクスポート）でエクスポート/共有を拡張。

---

## 検証サマリ（形式/独立基準）

- 総タスク数: 58
- ストーリー別内訳: US1=15（T021–T032, T056–T058）, US2=9（T033–T041）, US3=8（T042–T049）
- 並行機会: 各フェーズに [P] 指定済み（詳細は「並行実行の機会」参照）
- 独立テスト基準: 各 US に明記（契約/結合テストで検証可能）
- MVP 提案: US1 完了時点でデモ可能
- 形式検証: すべてのタスクはチェックボックス + 連番 ID（T001…）+ 必要に応じ [P] と [USx] + 明確なファイルパスの形式に準拠
