# データモデル: AI 週次献立プランナー

## エンティティ

- UserProfile
  - id: string (nanoid)
  - peopleCount: number (>=1)
  - preferences: { cuisines: { japanese: number, western: number, chinese: number }, excludeIngredients: string[] }
  - allergies: string[]
  - budgetPerWeekJPY: number (>=0)
  - maxCookTimeMin: number (>=0)
  - maxCaloriesPerMeal: number (>=0)
  - tz: string (IANA)
  - 検証: cuisines の合計は <= 1.0、名称は正規化、allergens は exclude に含まれていても可

- Plan
  - id: string (nanoid)
  - weekStartDate: date (ISO, Monday-based)
  - timezone: string (IANA)
  - slots: MealSlot[7]
  - lockedSlotIds: string[]
  - createdAt: datetime
  - updatedAt: datetime
  - ownerProfileId: string | null (anonymous allowed)
  - 検証: 7日=7 スロットを包含（夜のみ）; lockedSlotIds は slots の部分集合

- MealSlot
  - id: string (nanoid)
  - date: date (ISO)
  - period: enum("evening")（夜固定）
  - recipe: Recipe | null (null allowed during generation)
  - notes: string | null
  - locked: boolean
  - 検証: date はプラン週内; 一意性（date）

- Recipe
  - id: string (nanoid)
  - title: string
  - summary: string
  - ingredients: IngredientRef[]
  - steps: string[]
  - estimatedTimeMin: number (>=0)
  - nutrition: { calories: number, protein_g: number, fat_g: number, carbs_g: number } | null
  - source: enum("llm","user")
  - 検証: ingredients が空でない; 単位は正準化

- IngredientRef
  - ingredientId: string (canonical ID or alias key)
  - name: string (canonicalized, e.g., 玉ねぎ)
  - quantity: number (>=0)
  - unit: enum(g, ml, 個, 大さじ, 小さじ, 枚, 本, 杯)
  - 検証: 食材カテゴリに適合する unit; quantity は正規化

- ShoppingItem
  - id: string (nanoid)
  - name: string
  - totalQuantity: number (>=0)
  - unit: enum(g, ml, 個, 大さじ, 小さじ, 枚, 本, 杯)
  - category: enum(vegetables, meat, fish, dairy, grains, seasonings, others)
  - source: enum("from-input","additional-purchase")
  - 検証: 単位変換テーブルに基づくスロット横断の合算; カテゴリをマッピング

- ShareLink
  - id: string (nanoid)
  - planId: string
  - token: string (URL-safe)
  - expiresAt: datetime | null
  - 検証: token は一意; 期限は任意

## リレーション

- UserProfile 1—* Plan (optional owner)
- Plan 1—7 MealSlot
- MealSlot 1—1 Recipe
- Recipe *—* IngredientRef (embedded)
- Plan 1—* ShoppingItem (derived, not persisted as truth)
- Plan 1—0..1 ShareLink

## 導出とルール

- 多様性ルール: 同一レシピタイトルは全スロットの15%（7中1件）を超えない; 料理比率は嗜好に近似。
- アレルゲンルール: UserProfile のアレルゲンは IngredientRef に出現してはならない; 検出時はブロックし再生成。
- 単位正規化: 基本単位（g, ml）を用い、必要に応じて個/大さじ/小さじ等をマッピング; 近似時は注記を付与。
- 入力活用率: 入力食材の品目数または重量ベースで ≥80% を使用; 不足はレポートし最小限の追加を提案。

## 状態遷移

- プラン生成: Draft → Generated（未ロックのスロットが全て埋まる）
- スロットロック: Generated スロット → Locked（再生成では不変）
- 再生成: Generated → Generated（選択スロットのみ変更; ロックは維持）
- 共有: Generated → Shared（ShareLink 経由; プラン内容は不変）
