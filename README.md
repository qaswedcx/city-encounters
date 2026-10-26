# 城市邂逅 v0.2 開發版

延伸 v0.1 的六地點、人物管理、關係數值、圖鑑、日誌和 JSON 備份。繁體中文、純 HTML/CSS/JavaScript，無後端或付費 API。

新增多輪選擇、事件記憶、關鍵關係判定、星期與工作家庭排程；原單檔分離為 styles.css、js/data.js、js/core.js、js/app.js。保留 localStorage `city-encounters-v1` 鍵並升級資料版本為 2。

啟動：在根目錄執行 `python3 -m http.server 8000`。GitHub Pages 需一起部署 index.html、styles.css、js/ 目錄；不需要建置。

驗證：`node tests/core.test.cjs`。詳見 TESTING.md。此為尚未完成全部需求的開發版，請勿直接取代正式 v0.1；未完成項目見 GAME_SPEC.md。
