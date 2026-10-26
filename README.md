# 城市邂逅 v0.1

手機直式操作的繁體中文生活探索與關係模擬遊戲，無外部套件。

## 玩法
- 探索六地點：社區、傳統市場、百貨公司、咖啡廳、公園、圖書館。
- 人物依每日早上、下午、晚上的行程出現。
- 打招呼、閒聊、深入交流以提升三項關係數值。
- 在人物頁面手動或隨機新增角色。
- 進度儲存在瀏覽器 localStorage，紀錄頁可匯出及匯入 JSON 備份。

## iPhone + GitHub Pages 部署
1. 在 iPhone Safari 登入 GitHub，建立 Public repository，名稱可為 `city-encounters`。
2. 點 `Add file` → `Upload files`，從 iPhone「檔案」App 選擇 **`index.html`、`README.md`、`GAME_SPEC.md`**，上傳到儲存庫**根目錄**（不要只上傳 ZIP）。按 `Commit changes`。
3. 到 `Settings` → `Pages` → `Build and deployment` → `Source: Deploy from a branch` → `main` → `/(root)` → `Save`。
4. 由 Pages 顯示的網址在 Safari 開啟遊戲。頁面發布需要一段處理時間，若暫時 404 可查看 GitHub Actions/Pages 狀態。

> Public repository 上傳的原始碼和預設示範資料是公開的。請勿將 API Key、個人隱私或真實人物的敏感資料提交到 GitHub。

## 用 Codex 接手
1. 在支援的網頁版 Codex Cloud 建立並發布一個連接到此 GitHub 儲存庫的環境。
2. 啟動雲端任務，請 Codex 先閱讀 `GAME_SPEC.md` 與 `index.html`，再開始修改。
3. 提醒 Codex：「保持手機觸控相容、不得引入付費 API、改動必須通過簡單測試；提交修改前列出摘要」。

## 技術資訊
- 純單檔 HTML、CSS、原生 JavaScript。
- 這是 MVP 示範遊戲，不是 AI 自由聊天，也不是已上架 iOS App。
- 清除瀏覽器網站資料可能會失去本機進度；請先匯出備份。
