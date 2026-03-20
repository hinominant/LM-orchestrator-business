// Stop Hook
// セッション終了時にサマリをエージェントメモリに書き込み、Activity Log を更新する

const fs = require("fs");
const path = require("path");

function getInput() {
  try {
    return JSON.parse(fs.readFileSync("/dev/stdin", "utf8"));
  } catch (_e) {
    return null;
  }
}

function main() {
  const input = getInput();
  if (!input) {
    // Parse error → continue to avoid blocking
    console.log(JSON.stringify({ continue: true }));
    return;
  }
  const { session_id, stop_reason } = input;

  // ツールログからセッションサマリを生成
  const logFile = path.join(process.cwd(), ".context", "tool-log.jsonl");

  if (fs.existsSync(logFile)) {
    const lines = fs.readFileSync(logFile, "utf8").trim().split("\n");
    const sessionLogs = lines
      .map((l) => {
        try {
          return JSON.parse(l);
        } catch {
          return null;
        }
      })
      .filter((l) => l && l.session_id === session_id);

    if (sessionLogs.length > 0) {
      const summary = {
        session_id,
        stop_reason,
        timestamp: new Date().toISOString(),
        tool_count: sessionLogs.length,
        tools_used: [...new Set(sessionLogs.map((l) => l.tool))],
        errors: sessionLogs.filter((l) => !l.success).length,
      };

      // セッションサマリを記録
      const summaryDir = path.join(process.cwd(), ".context", "sessions");
      if (!fs.existsSync(summaryDir)) {
        fs.mkdirSync(summaryDir, { recursive: true });
      }
      const summaryFile = path.join(
        summaryDir,
        `${new Date().toISOString().split("T")[0]}.jsonl`
      );
      fs.appendFileSync(summaryFile, JSON.stringify(summary) + "\n");
    }
  }

  // RESUME_CONTEXT.md: コンテキスト圧縮・セッション再開時の必読ファイル
  // Context Recovery プロトコル（_framework.md）がこのファイルを参照する
  try {
    const resumeFile = path.join(process.cwd(), ".claude", "RESUME_CONTEXT.md");
    const resumeContent = [
      "# Context Recovery — 必読",
      "",
      `> Session ended: ${new Date().toISOString()}`,
      "> このファイルはセッション終了時に自動生成される。次セッション開始時に必ず読むこと。",
      "",
      "## ⚠️ データ保護ルール（コンテキスト状態に関わらず常に有効）",
      "",
      "1. **入力禁止** — 採用候補者データ・本番DB接続文字列・未公開財務情報・顧客個人情報を Claude のプロンプトに含めない",
      "2. **本番DB禁止** — 接続先は必ず localhost / 開発DB。本番 URL は Safety Gate でブロックされる",
      "3. **データ作業前** — データを扱うタスクの前に `/data-guard` を実行する",
      "4. **シークレット禁止** — `.env` はコミットしない。API キー・パスワードをコードに書かない",
      "",
      "詳細: `_common/DATA_PROTECTION.md`",
      "",
      "## Context Recovery 手順",
      "",
      "1. このファイルを読んだ",
      "2. `_common/DATA_PROTECTION.md` を確認した（データ作業の場合）",
      "3. `.agents/PROJECT.md` で作業状態を把握した",
      "4. `git log --oneline -10` + `git status` で確認した",
      "5. 上記完了まで実装作業に入らない",
    ].join("\n");
    const claudeDir = path.join(process.cwd(), ".claude");
    if (!fs.existsSync(claudeDir)) {
      fs.mkdirSync(claudeDir, { recursive: true });
    }
    fs.writeFileSync(resumeFile, resumeContent, "utf8");
  } catch (_resumeErr) {
    // Non-critical — continue without blocking
  }

  console.log(JSON.stringify({ continue: true }));
}

main();
