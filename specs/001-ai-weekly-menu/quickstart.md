# クイックスタート: AI 週次献立プランナー

このクイックスタートでは、Library-First のコアと API の想定利用方法を示します（実装後の利用像）。

## 前提条件

- Node.js 20+
- pnpm/npm

## CLI（packages/menu-core）

- 食材テキストのパース:
  - echo "鶏もも500g, 玉ねぎ2個, 豆腐1丁" | menu-core parse --json
- 週次プラン生成（夜のみ・JSON）:
  - menu-core plan --text "鶏もも500g, 玉ねぎ2個, 豆腐1丁" --people 2 --max-time 20 --json
  - 出力は 7 スロット（7日×夜）を前提とします。

CLI は stdin/引数 → stdout の契約に従います。JSON もしくはフラグで人間可読出力を選択できます。

## API（backend）

- サーバ起動: pnpm dev（Fastify、http://localhost:3000）
- プラン作成:
  - POST /plans（body: { text, profile?, constraints? }）
- スロットの再生成:
  - PATCH /plans/{planId}/slots/{slotId}
- スロットの固定（ロック）:
  - POST /plans/{planId}/slots/{slotId}/lock
- 買い物リスト取得:
  - GET /plans/{planId}/shopping-list
- エクスポート（CSV/PDF）:
  - GET /plans/{planId}/export.csv
  - GET /plans/{planId}/export.pdf

## テスト

- ランナー: Vitest（契約/統合/ユニットを共通ランナーで実行）
- 実行例:
  - API/契約・統合テスト: `cd backend && pnpm test`
  - コアユニットテスト: `cd packages/menu-core && pnpm test`
- コントラクトテストは `/specs/001-ai-weekly-menu/contracts/openapi.yaml` に対して応答を検証します。
- （任意強化）OpenAPI レスポンスのスキーマ検証を自動化するテストを追加できます（例: openapi-response-validator を利用）。

## 補足

- LLM プロバイダは環境変数で設定（OpenAI 互換）。コアはアダプタによりプロバイダ非依存を維持します。
- ストレージはデフォルトで SQLite。将来的に PostgreSQL への移行を想定しています。
