# Form Wizard Pattern

## Overview

| 項目 | 値 |
|------|-----|
| Pattern | Form Wizard |
| Category | Form / Interaction |
| Complexity | High |
| Reference | SmartHR「ウィザード」相当 |

**解決する課題:** 長く複雑なフォームを論理的なステップに分割し、ユーザーの認知負荷を軽減する。

**使用場面:**
- 新規登録・オンボーディング
- 複数画面にわたる申請・申込フォーム
- 設定ウィザード
- 段階的なデータ入力（基本情報→詳細→確認→完了）

---

## Structure

```
┌─────────────────────────────────────────────────────────┐
│ [A] Progress Indicator                                    │
│  ① 基本情報 ── ② 詳細設定 ── ③ 確認 ── ④ 完了          │
│  ●━━━━━━━━━━━━○━━━━━━━━━━━━○━━━━━━━━━━━━○              │
├─────────────────────────────────────────────────────────┤
│ [B] Step Header                                           │
│  Step 2 / 4                                               │
│  詳細設定                                                  │
│  必要な詳細情報を入力してください                            │
├─────────────────────────────────────────────────────────┤
│ [C] Form Content                                          │
│                                                           │
│  フォームフィールド群                                      │
│  ┌──────────┐  ┌──────────┐                               │
│  │ Input    │  │ Select   │                               │
│  └──────────┘  └──────────┘                               │
│  ┌──────────────────────────┐                             │
│  │ Checkbox Group           │                             │
│  └──────────────────────────┘                             │
│                                                           │
├─────────────────────────────────────────────────────────┤
│ [D] Navigation                                            │
│  [← 戻る]                      [下書き保存] [次へ →]     │
└─────────────────────────────────────────────────────────┘
```

| Block | 構成 | Required |
|-------|------|----------|
| A | Progress Indicator: ステップの進捗表示 | Required |
| B | Step Header: ステップ番号・タイトル・説明 | Required |
| C | Form Content: そのステップのフォーム | Required |
| D | Navigation: 戻る・次へ・下書き保存 | Required |

---

## Interaction Flow

```
1. ステップ1開始
   └→ Progress Indicator でステップ1がアクティブ
   └→ Form Content表示

2. フィールド入力
   └→ リアルタイムバリデーション（フォーカスアウト時）
   └→ エラーはフィールド直下に表示

3. 「次へ」クリック
   └→ 現在ステップの全フィールドバリデーション
   └→ エラーあり → エラーフィールドにスクロール + フォーカス
   └→ エラーなし → 次のステップに遷移
   └→ Progress Indicator 更新
   └→ ページトップにスクロール

4. 「戻る」クリック
   └→ 入力値は保持したまま前のステップに戻る
   └→ バリデーションなし

5. 「下書き保存」（optional）
   └→ 現在の入力値をサーバーに保存
   └→ Toast で保存完了通知

6. 確認ステップ
   └→ 全ステップの入力内容をサマリー表示
   └→ 各セクションに「編集」ボタン → 該当ステップに戻る
   └→ 「送信する」で最終送信

7. 完了ステップ
   └→ 成功メッセージ + 次のアクション案内
```

---

## Component Composition

| Component | 参照 | 役割 |
|-----------|------|------|
| Input | → `artisan/references/components/input.md` | テキスト入力 |
| Select | → `artisan/references/components/select.md` | 選択入力 |
| Checkbox/Radio | → `artisan/references/components/checkbox-radio.md` | 選択入力 |
| Button | → `artisan/references/components/button.md` | ナビゲーション・送信 |
| Dialog | → `artisan/references/components/dialog.md` | 離脱確認 |
| ProgressBar / Stepper | — | ステップ進捗表示 |
| Toast | — | 保存完了通知 |

---

## Responsive Behavior

| Breakpoint | Layout変更 |
|------------|-----------|
| Desktop (≥1024px) | Progress Indicator: 横一列。フォーム: 2カラムグリッド |
| Tablet (768-1023px) | Progress Indicator: 横一列（ラベル省略、番号のみ）。フォーム: 1カラム |
| Mobile (<768px) | Progress Indicator: 「Step 2 / 4」テキスト表示のみ。フォーム: 1カラム。ボタン: 全幅 |

**モバイルでのProgress Indicator:**
```
┌────────────────────────────┐
│ Step 2 / 4 — 詳細設定       │
│ ████████░░░░░░░ 50%         │
└────────────────────────────┘
```

---

## Accessibility

- **Progress Indicator**: `aria-label="フォームの進捗"`, 各ステップに `aria-current="step"`（アクティブ）
- **ステップ遷移**: 遷移時に `aria-live="polite"` でステップ名を通知
- **バリデーション**: エラーサマリーを `role="alert"` で通知、`aria-invalid` + `aria-describedby` で個別エラー紐付け
- **離脱防止**: `beforeunload` イベントで「入力内容が失われます」警告
- **キーボード**: Tab でフィールド間移動、Enter で「次へ」（フォーム内最後のフィールドから）

---

## Do / Don't

### Do
- ✅ 1ステップ3-5フィールドに抑える → 認知負荷軽減
- ✅ 「戻る」で入力値を保持する → 再入力のストレス防止
- ✅ 確認画面で各セクションに「編集」ボタン → 該当ステップに直接戻れる
- ✅ 離脱時に未保存の確認ダイアログ → データ損失防止
- ✅ 各ステップのバリデーションは「次へ」クリック時に実行 → 入力中は邪魔しない

### Don't
- ❌ 「戻る」ボタンでバリデーションを実行しない → 戻るのは常に自由
- ❌ 後のステップを先にスキップさせない（依存関係がある場合） → データ整合性
- ❌ ステップ数が7を超えないようにする → 複雑すぎる場合はフロー再設計
- ❌ 進捗インジケータを省略しない → 「あとどれくらい」の情報は必須

---

## Code Skeleton

```tsx
function FormWizard() {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<FormData>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  const steps: StepConfig[] = [
    { id: 'basic', title: '基本情報', description: '基本的な情報を入力してください', component: BasicInfoStep },
    { id: 'details', title: '詳細設定', description: '必要な詳細情報を入力してください', component: DetailsStep },
    { id: 'confirm', title: '確認', description: '入力内容を確認してください', component: ConfirmStep },
    { id: 'complete', title: '完了', description: '', component: CompleteStep },
  ]

  const handleNext = async () => {
    const stepErrors = await validateStep(currentStep, formData)
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors)
      focusFirstError()
      return
    }
    setErrors({})
    setCurrentStep(prev => prev + 1)
    scrollToTop()
  }

  const handleBack = () => {
    setCurrentStep(prev => prev - 1)
    scrollToTop()
  }

  const handleSubmit = async () => {
    await submitForm(formData)
    setCurrentStep(steps.length - 1) // Complete step
  }

  const CurrentStepComponent = steps[currentStep].component

  return (
    <div>
      {/* [A] Progress Indicator */}
      <Stepper steps={steps} currentStep={currentStep} />

      {/* [B] Step Header */}
      <StepHeader
        stepNumber={currentStep + 1}
        totalSteps={steps.length}
        title={steps[currentStep].title}
        description={steps[currentStep].description}
      />

      {/* [C] Form Content */}
      <CurrentStepComponent data={formData} errors={errors} onChange={updateFormData} />

      {/* [D] Navigation */}
      <StepNavigation
        currentStep={currentStep}
        totalSteps={steps.length}
        onBack={handleBack}
        onNext={handleNext}
        onSubmit={handleSubmit}
        isConfirmStep={currentStep === steps.length - 2}
      />
    </div>
  )
}
```
