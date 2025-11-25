# 実装計画: [FEATURE]

**ブランチ**: `[###-feature-name]` | **日付**: [DATE] | **仕様**: [link]
**入力**: `/specs/[###-feature-name]/spec.md` の機能仕様

**注記**: このテンプレートは `/speckit.plan` コマンドで自動生成・更新されます。実行手順は `.specify/templates/commands/plan.md` を参照してください。

## 要約

[機能仕様からの抜粋: 主要要件 + リサーチに基づく技術的アプローチ]

範囲更新（重要）:
- 自動生成の対象は「夜の献立」のみとする。
- 「朝の献立」は本計画の対象外（非スコープ）。
- 以降の設計・実装・テストは、7日間×夜スロット（7件）を前提に記述・検証する。

## 技術コンテキスト

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**言語/バージョン**: [例: Python 3.11, Swift 5.9, Rust 1.75 など／要確認]  
**主要依存**: [例: FastAPI, UIKit, LLVM など／要確認]  
**ストレージ**: [該当する場合: PostgreSQL/CoreData/ファイル 等 or N/A]  
**テスト**: [例: pytest/XCTest/cargo test 等／要確認]  
**ターゲット**: [例: Linuxサーバ/iOS 15+/WASM 等／要確認]
**プロジェクト種別**: [single/web/mobile - ソース構成を決定]  
**性能目標**: [領域別: 1000 req/s, 10k lines/sec, 60 fps 等／要確認]  
**制約**: [領域別: p95<200ms, メモリ<100MB, オフライン対応 等／要確認]  
**規模/スコープ**: [領域別: 1万人, 100万LOC, 50画面 等／要確認]

## 憲法チェック

GATE: フェーズ0リサーチ着手前に合格必須。フェーズ1設計後に再確認。

[リポジトリの憲法ファイルに基づくゲート要件]

## プロジェクト構成

### ドキュメント（本機能）

```
specs/[###-feature]/
├── plan.md              # 本ファイル（/speckit.plan 出力）
├── research.md          # フェーズ0出力（/speckit.plan）
├── data-model.md        # フェーズ1出力（/speckit.plan）
├── quickstart.md        # フェーズ1出力（/speckit.plan）
├── contracts/           # フェーズ1出力（/speckit.plan）
└── tasks.md             # フェーズ2出力（/speckit.tasks。/speckit.planでは作成しない）
```

### ソースコード（リポジトリルート）
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```
# [未使用なら削除] オプション1: 単一プロジェクト（デフォルト）
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [未使用なら削除] オプション2: Webアプリ（frontend + backend）
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [未使用なら削除] オプション3: モバイル + API（iOS/Android）
api/
└── [上記 backend と同様]

ios/ または android/
└── [プラットフォーム固有構成: 機能モジュール/画面フロー/プラットフォームテスト]
```

**構成決定**: 採用した構成と、上で示した実際のディレクトリを記載

## 複雑性トラッキング

憲法チェックでの違反があり、正当化が必要な場合のみ記入

| 逸脱 | 必要な理由 | 却下した単純案 |
|------|------------|----------------|
| [例: 4つ目のプロジェクト] | [現状の必要性] | [なぜ3つでは不十分か] |
| [例: Repositoryパターン] | [具体的な課題] | [なぜ直接DBアクセスでは不十分か] |
