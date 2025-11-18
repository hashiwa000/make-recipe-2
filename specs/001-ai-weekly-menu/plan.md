# Implementation Plan: 生成AIで1週間の朝夕レシピ計画

**Branch**: `[001-ai-weekly-menu]` | **Date**: 2025-10-21 | **Spec**: `specs/001-ai-weekly-menu/spec.md`
**Input**: Feature specification from `/specs/001-ai-weekly-menu/spec.md`

## Summary

購入済み食材のフリーテキスト入力を起点に、その食材を優先活用して日本向け（和洋中混合）の7日×朝/夜の献立を LLM で完全生成する Web アプリ。既存DBなしのため、材料パース/正規化→活用最適化→不足分の最小補完提示を中核とし、プロンプト設計と出力検証（Zod/重複/アレルゲン）を重視。トークン効率のよい段階生成（週構成→必要スロット詳細）とキャッシュを採用する。

## Technical Context

- Language/Version: TypeScript 5 / Node.js 20 / Next.js 14 (App Router)
- Primary Dependencies: React, Next.js, Zod(検証), Prisma(開発: SQLite→将来PostgreSQL), openai SDK(プロバイダTBD), msw(テスト), Playwright(E2E), Vitest(単体)
- Optional（調査）: 日本語形態素/品名正規化ユーティリティ（TBD。まずは内製の軽量正規化ルールから）
- Storage: 開発は SQLite（Prisma）、本番は PostgreSQL を想定（TBD）。ユーザープラン保存・共有リンク用。
- Testing: Vitest(ユニット) + Playwright(E2E) + Contract tests(JSON I/O でライブラリ/CLIを検証)
- Target Platform: Web（デスクトップ/モバイル）。デプロイ先は Vercel/Node サーバ（TBD）。
- Project Type: web（frontend + backend）、ライブラリ優先（Library-first）+ CLI I/F 準拠
- Performance Goals: 現状SLOなし。UX向上のため段階表示（スケルトン→カード）・スロット単位再生成p95≦3秒を長期目標に据える。
- Constraints: トークン効率（短プロンプト・構造化出力・再利用・キャッシュ・材料先行の前処理）。アレルゲン/除外の厳格検証。
- Scale/Scope: 初期は個人〜小規模。週次プランと共有リンク中心。将来はユーザーアカウント拡張。

## Constitution Check

- Library-First: 生成/検証/集計/単位変換/重複制御を独立ライブラリ化（UI非依存）。
- CLI Interface: 各ライブラリは CLI 経由で JSON I/O を提供（`stdin`/`stdout`）。
- Test-First: コア契約テスト（入力→出力スキーマ）を先行作成し Red→Green→Refactor。
- Integration Testing: API レイヤ/LLM呼び出しモック/買い物集計の結合テストを用意。

全項目に適合、Phase 0 開始可。

## Project Structure

### Documentation (this feature)

```
specs/001-ai-weekly-menu/
├── plan.md              # 本ファイル
├── research.md          # Phase 0（プロンプト/料理カテゴリ/単位標準の調査）
├── data-model.md        # Phase 1（エンティティ・スキーマ・正規化）
├── quickstart.md        # Phase 1（セットアップ/実行手順）
└── contracts/           # Phase 1（入出力スキーマと例）
```

### Source Code (repository root)

```
backend/
├── src/
│   ├── api/                 # REST/tRPC ハンドラ（Next API に移行も可）
│   ├── lib/
│   │   ├── generator/       # LLMプロンプト/生成(週/スロット)
│   │   ├── validator/       # Zod検証/内容チェック/重複制御
│   │   ├── normalizer/      # 単位/表記の正規化（g/大さじ/小さじ）
│   │   ├── inventory/       # フリーテキスト材料のパース/正規化/在庫モデル
│   │   ├── shopping/        # 買い物リスト集計・カテゴリ分け
│   │   └── nutrition/       # 簡易栄養推定（TBD）
│   ├── services/
│   │   ├── llm/             # LLM呼び出し、プロバイダ抽象化、キャッシュ
│   │   └── logging/         # 監査ログ
│   ├── models/              # Prisma スキーマ/リポジトリ
│   └── schemas/             # Zod スキーマ（契約の単一ソース）
├── cli/
│   ├── inventory-parse.ts       # フリーテキスト→在庫JSON
│   ├── menu-from-inventory.ts   # 在庫JSON→週メニューJSON
│   ├── slot-regenerate.ts       # 1スロット再生成
│   └── shopping-aggregate.ts    # 買い物集計（不足分は追加購入として分離）
└── tests/
    ├── unit/
    ├── contract/
    └── integration/

frontend/
├── app/                     # Next.js App Router（UI）
├── components/
└── features/menu/
```

## Phase 0: Research（/research.md）

- 料理カテゴリとバラエティ制約（和/洋/中 比率制御）
- 単位標準（g, ml, 大さじ/小さじ, 個）と変換テーブル
- アレルゲン/除外食材リストの初期セット（日本向け）
- フリーテキスト材料の曖昧表現/俗称/半端量の正規化ポリシー（例: 半玉/少々/1パック）
- トークン節約パターン（JSON出力固定, few-shot最小化, 不要説明の抑止, 事前正規化）

成果物: 調査要約、初期プロンプト草案、JSONスキーマ案

## Phase 1: Design（/data-model.md, /contracts, /quickstart.md）

- スキーマ定義（Zod）: InventoryItem/InventoryParseResult, UserProfile, Plan, MealSlot, Recipe, IngredientRef, ShoppingItem
- 契約定義（contracts/*.json）: inventory-parse 入力/出力, menu-from-inventory 入力/出力, shopping-aggregate 入力/出力（例と失敗ケース含む）
- Prisma モデル設計（SQLite 開発）
- LLM サービス抽象（プロバイダTBD、APIキー注入方式）
- Quickstart（環境変数, DB 初期化, CLI 使い方, 開発サーバ）

## Phase 2: Implementation (Core Libraries + CLI)

- inventory: フリーテキスト→在庫（標準名・数量・単位）正規化、曖昧値の丸めと注記
- generator: 在庫優先で週→スロット分割生成、活用率を最大化する制約とヒューリスティクス
- validator: Zod 検証 + ルール（アレルゲン/除外/時間/カロリーの閾値）
- normalizer: 表記ゆれ/単位変換、材料名の正規化（inventory と連携）
- shopping: 材料の統合・カテゴリ分け・単位統一。不足分は追加購入リストとして分離
- services/llm: ストリーミング対応・リトライ・温度/最大トークン制御・キャッシュ
- CLI: `inventory-parse`, `menu-from-inventory`, `slot-regenerate`, `shopping-aggregate`（JSON I/O）
- Contract tests: 失敗系（曖昧材料/矛盾条件/不正単位/アレルゲン混入/在庫不足）を含む

## Phase 3: Backend API

- API ルート（REST or Next API）: `/api/inventory/parse`, `/api/plan/from-inventory`, `/api/plan/slot`, `/api/shopping`
- 入出力は契約準拠（schemas のみ参照）
- ログ/監査（入力条件・生成要約・再生成履歴）
- 簡易キャッシュ（週ハッシュ・スロットハッシュ）

## Phase 4: Frontend UI

- 画面: 材料フリーテキスト入力→条件入力→生成結果（カレンダー/カード）→詳細モーダル→買い物リスト（追加購入分を区別）
- 操作: スロット再生成・固定、CSV/PDF エクスポート
- 状態管理: React Server + Client Components 適材適所、SWR で API 連携
- アクセシビリティ/国際化: 日本語優先、単位/表記統一

## Phase 5: Testing & Hardening

- ユニット: スキーマ/正規化/材料パース/集計
- コントラクト: CLI/API の JSON I/O 検証
- 結合: 材料パース→生成→検証→集計 の一連動作（LLMは msw でモック）
- E2E: 主要フロー（生成/再生成/固定/CSV出力）
- 観測性: 失敗率・重複率・アレルゲン検出率・材料活用率のメトリクス収集

## Commands（例）

- 開発: `pnpm dev`（frontend）, `pnpm dev:api`（backend）
- テスト: `pnpm test`, `pnpm test:e2e`
- CLI:
- `echo '鶏もも500g, 玉ねぎ2個, 豆腐1丁' | ts-node backend/cli/inventory-parse.ts`
- `echo '{"inventory":[...],"people":2}' | ts-node backend/cli/menu-from-inventory.ts`

## Token Efficiency（方針）

- 構造化出力（厳密 JSON）と短プロンプト（役割+制約+スキーマ）
- 週全体の下書き→各スロット詳細の段階生成（必要時のみ詳細展開）
- 一意キーでキャッシュ/再利用（同条件・ロック考慮）
- 事前に材料を正規化・圧縮（品目・数量・単位を短縮表現）してプロンプトに渡す
- システムメッセージ共通化・few-shot最小化、不要説明の抑止

## Risks & Mitigations

- LLM 出力の不整合: Zod 検証→自動再試行/補正、strict schema
- 重複やバラエティ不足: 最近数のペナルティとハード制約
- 単位/分量の曖昧さ/俗称: 正規化と単位辞書で補正、未解決はユーザー注記
- パース誤り: サンプル拡充・ルールベース+LLM補助のハイブリッド、失敗時はユーザーに確認を促すUI
- 在庫不足で14スロットが埋まらない: 追加購入の最小集合の提示と代替案（置換/品数削減）
- コスト膨張: 段階生成/キャッシュ/短プロンプト、ログで監視

## Acceptance Checklist

- [ ] P1: 材料フリーテキスト→在庫正規化→14スロット生成/表示、詳細モーダル
- [ ] P2: 条件適用・スロット再生成/固定
- [ ] P3: 買い物リスト集計・CSV出力（追加購入リストを分離）
- [ ] アレルゲン/除外ブロック、重複抑制
- [ ] 材料活用率 ≥ 80% を満たす（サンプルケース）
- [ ] CLI（4コマンド）と契約テスト合格
