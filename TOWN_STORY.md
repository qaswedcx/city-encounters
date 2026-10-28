## v0.5 小鎮與三人主事件（待人工驗收）
- 沿用 `main` 的 `index.html` 入口、`Core.statusAt/status` 行程優先序、`Core.available/begin/choose` 與 `Core.advance`。移動不耗時；事件完整結束推進一時段。
- `#town-map` 是原「城市探索」畫面內新增的觸控小鎮；六個建築使用獨立向量立面及標誌性造型（社區屋頂、傳統市場騎樓攤棚、百貨玻璃立面、咖啡廳遮棚、樹木與長椅、圖書館屋頂），地點 ID 與原資料一致。早午晚依 `state.slot` 調色。
- `js/story.js` 含三人各七段主事件；`life.js` 依既有 `previous/slot/location/minimum/trust/nodes` 附加故事，保留原日常話題和 legacy 事件。每段三個專屬選項，選擇的節點回覆與結算記在 `records`；下段開場回顧上一段的具體角色回應。前六段成功推進，暫緩最早改天重試；結尾分為自願發展、友情及暫緩，未自動修改婚姻。
- 為讓社區事件有實際可到場時段，新遊戲的預設晚間家庭責任保留在平日，芷妍預設週末晚上改為社區、星期二／四晚上可在咖啡廳。其他工作、家庭、臨時事件仍由原 resolver 判斷；不依地圖臆造 NPC。已存在人物自訂排程可繼續導致事件無法出現，應由玩家自行調整日程。
- PR 不部署、不合併、不改付費或 AI 設定，沒有刻意修改存檔鍵或版本；正式 iPhone Safari、工作班表自訂後的所有排列與視覺美術仍待人工驗收。

### 驗證
本次在已連線的儲存庫原始碼上執行 JavaScript 語法檢查、`Core.createState`／`Core.statusAt` 路徑可達性及三位角色完整七段流程（含戀愛、友情、暫緩結算），全部通過。新增 `node --test tests/town-story.test.cjs` 供後續 CI 重跑。
原有 `node --test tests/*.test.cjs`、`CHROMIUM_PATH=/usr/bin/chromium node tests/browser-smoke.cjs`、`node tests/portraits-browser.cjs` 仍應在有 Node 與 Chromium 的環境執行。本次未在該環境重跑，不能宣稱既有套件及實際瀏覽器通過。
