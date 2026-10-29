# 小鎮地圖 2.0 驗收

日期：2026-10-29（Asia/Taipei）；基準最新 main `7abc68dc3ae4c735cb1b12880b84ee160f71bf36`。此專案是靜態 HTML／CSS／原生 JavaScript，沒有套件建置步驟；以語法、靜態資源載入與實際遊戲瀏覽器流程驗證部署內容。

## 結構與整合

- 唯一入口仍為 `index.html` 的城市探索，保留地點面板、三個底部導覽、圖鑑、日誌、完整立繪及對話 sheet。
- 六個 ID／名稱仍取自 `CityData.PLACES`；`assets/town-map.svg` 以 600×1040 viewBox 畫連續街區，`CityTown.layout` 僅保存對應熱區與頭像位置。
- `CityTown.population` 呼叫既有 `Core.prepare`，再以 `Core.statusAt(state, character, day, slot)` 計算一次當下排程。同一份結果供地點在場名單與地圖使用，不新增狀態或改動移動／時間／事件引擎。
- 保留既有「臨時事件 → 確定活動 → 家庭 → 工作 → 平日／週末」優先順序。home／office 不投影到六處；busy 者不顯示可相遇頭像，但原有地點內的忙碌／拒絕互動仍保留。可短暫服務工作按原狀態顯示。
- 現有資料沒有另外的角色解鎖可見性欄位；角色是否在場、是否忙碌均以原 resolver 為準。地圖不讀事件前置來推測人物位置，也不展示未解鎖事件標題；事件入口仍經 `Core.begin/available`，一般互動仍經原對話引擎。
- 移除下方 `place-grid` DOM、生成碼、監聽器及樣式；原六宮格立面與裝飾 hero 由一張連續地景取代。

## 實際驗證

- `node --test tests/*.test.cjs`：8 個測試檔共 81 項全部通過，含新增 `town-map.test.cjs` 的 7 項規則測試。涵蓋工作與休閒互斥、家庭覆蓋、臨時事件與取消約定、週末與跨日、對話完成後一次時間推進、無重複人物、多人同處及投影不改寫已準備的進度。
- `CHROMIUM_PATH=/usr/bin/chromium node tests/town-map-browser.cjs`：7 組通過。320／390／430px 手機觸控，六處點擊及目前位置、移動零耗時、官方頭像路徑、姓名／地點預覽、工作招呼、未完對話移動保護、等待及跨日更新、三張頭像與 `+N`、320px 多人不遮臉不溢出、完整在場名單、自訂人物／缺圖輪廓、未解鎖事件不提前顯示、鍵盤操作與底部導覽淨空。
- `CHROMIUM_PATH=/usr/bin/chromium node tests/browser-smoke.cjs`：原有 17 組回歸通過，涵蓋人物管理、工作家庭、作者事件、三人戀愛／友情／失敗、存檔匯入匯出與損壞存檔保護。
- `CHROMIUM_PATH=/usr/bin/chromium node tests/portraits-browser.cjs`：原有 5 組回歸通過，涵蓋三人立繪、對話刷新、變體與損壞圖資回退。
- `CHROMIUM_PATH=/usr/bin/chromium node tests/ai-browser.cjs`：既有 Mock AI 回歸通過；無真實模型或付費 API 呼叫。
- 全部 `js/*.js` 語法、SVG XML 格式及 `git diff --check` 通過；瀏覽器無 JavaScript 頁面例外，新增地圖沒有外部圖資／CDN／套件依賴。正式 SVG 約 13KB。
- 已檢視 `work/town-map-320.png`、`work/town-map-390.png`、`work/town-map-430.png` 手機截圖；頭像直徑 36 CSS px、觸控區至少 44×44 CSS px。測試與截圖輸出在忽略提交的 `work/`。

原 main 的舊非核心生命規則案例會被後加的 `story*` 核心劇情干擾，已在未修改的 main 副本重現失敗。本次只修正測試 fixture 隔離：非核心案例排除核心故事、自訂事件 fixture 使用非核心 ID、舊 v0.3 路線 fixture 封鎖新故事首事件；正式人物、故事、引擎與結果判定未更改。21 個故事事件仍由 `town-story.test.cjs` 驗證。

## 限制與人工驗收

- 已驗證 Chromium 手機觸控模擬；實體 iPhone Safari／WebKit 的安全區、低記憶體與長時間遊玩仍待人工檢查。
- 靜態部署須包含 `assets/town-map.svg`、`js/town.js` 及原完整資源。未發布正式 Pages、未修改發布設定、未合併 PR。

---

以下保留先前版本驗收紀錄；本次結果以上方為準。

# v0.3 正式人物肖像整合驗收

日期：2026-10-27（Asia/Taipei）；基準最新 main `6420a0e`。本次只修改圖片、顯示回退與圖片布局，不改人物設定、對話規則或存檔格式。

## 實際通過

- 三張根目錄來源PNG均存在且保留原檔。無損WebP各自解碼為RGBA後，與來源逐像素完全相同；格式WEBP、尺寸1086×1448。檔案納入Git，路徑沿用原profiles.js契約。
- `node tests/portraits-browser.cjs`：5組通過。Chromium手機觸控，圖鑑／探索在320、390、430px三人對應ID與實際圖片尺寸正確、無水平溢出；三人的一般對話均顯示本人肖像，刷新保留未完對話並只推進一次時間。
- 工作、關鍵事件與戀愛後事件經實際UI驗證缺少變體時回退本人標準肖像。約會、表情及scene-encounter目前沒有專屬觸發玩法，因此以既有圖片元素請求這些缺少的本機路徑，驗證共用錯誤處理鏈；未新增換裝或事件功能。
- 標準肖像404或200但檔案損壞時，安全輪廓仍顯示，另外兩人不受影響，沒有破圖或循環；仍可完成對話，圖片載入不改寫遊戲進度。以schema3舊存檔實際JSON匯入驗證關係73／64／31、戀愛成功紀錄、工作家庭與日誌保留，重新整理前後狀態相同。
- `node tests/browser-smoke.cjs`：17組既有回歸通過。已把舊版假圖／缺圖主畫面檢查改成真正三張正式WebP檢查。涵蓋手機表單、工作家庭、一般對話、自訂事件、三人共九種路線結果、實際JSON匯出／匯入、損壞存檔保護。
- 五份 `tests/*.test.cjs` 共66項核心測試通過，0失敗。所有 `js/*.js` 語法檢查及 `git diff --check` 通過。
- 瀏覽器沒有頁面JavaScript例外或外部圖片／CDN請求。預期的缺少變體404屬於回退驗證；無付費API或imagegen呼叫。

本機瀏覽器因listen權限限制在工具批准的沙箱外執行。輸出（不提交）為work/portraits-browser-results.json、work/browser-results.json、work/official-portraits-430.png。已視覺檢查圖鑑：三人五官、服裝、色調與來源一致，圖鑑顯示完整3:4肖像，半身畫面頂端對齊等比例裁切下方。

## 尚未實測

- 實體iPhone Safari／WebKit、安全區、低記憶體、慢速網路下的實際解碼效能；目前為Chromium手機觸控模擬。
- 其他正式變體尚未製作；已測其缺圖回退，未以假圖充作正式變體。
- 正式GitHub Pages未發布，未修改發布設定，也未合併main。三張無損WebP合計約4.43MiB，優先保留正式素材細節；圖片沿用lazy loading。

---

以下為前一輪v0.3驗收紀錄，圖資現況及本次結果以本頁上方為準。

# v0.3 測試與驗收

日期：2026-10-27（Asia/Taipei），基準 main `6beec1f`。未發布或覆蓋正式 GitHub Pages。

## 本輪核心測試

以下命令實際通過，共66項、0失敗：

```sh
node tests/core.test.cjs          # 19：原互動、安全匯入、資料隔離、舊存檔
node tests/life.test.cjs          # 14：工作家庭、事件、生活優先、非核心拒絕規則
node tests/work-schedule.test.cjs # 6：工作表單資料、週行程、舊休假保留
node tests/dialogue.test.cjs      # 12：原一般對話、選項、續談、收益與事件分離
node tests/profiles.test.cjs      # 15：v0.3人物與路線
```

新增驗證涵蓋三份完整人物設定、10種圖資路徑、初始資料鎖定、三人各自戀愛／友情／失敗、戀愛後事件與記憶、1–3版附加遷移且不改輸入、保留舊拒絕、新路線仍可推進、舊未完關鍵事件續接、生活忙碌與本人不願意、100數值不自動成功、deadline錯過、18–55與舊56–99安全收斂。舊事件規則測試明確使用非核心人物，以繼續保護自訂人物的永久拒絕語意。

所有 `js/*.js` 語法檢查、`git diff --check` 通過。

## 手機瀏覽器回歸

```sh
CHROMIUM_PATH=/usr/bin/chromium node tests/browser-smoke.cjs
```

使用已安裝的 playwright-core 與本機 Chromium，390px觸控模擬並檢查320／390／430px；開發用依賴不加入遊戲。沙箱內本機listen遭EPERM，經工具批准後在沙箱外執行。

涵蓋三分頁與人物／進階作者表單不溢出、55上限與56不合法、文字轉義、新增編輯隨機刪除、一般談話刷新且只耗一次時間、實際JSON下載／還原、壞JSON不覆寫、舊鍵保護、工作班表與家庭覆蓋、週預覽、服務工作招呼、舊休假、自訂多節點事件編輯與實際執行。

v0.3新增：三張核心檔案與逐步揭露；缺圖移除img而輪廓卡保留；攔截一個本機圖資請求提供有效測試影像，確認成功載入後隱藏占位；三人各三種結果透過實際觸控與刷新後仍保留；事件面板有劇照區；三種寬度結果檔案不溢出。無頁面JS例外或外部執行期請求；缺圖所預期的本機404不算錯誤。測試有效圖片只存在請求攔截，不當正式素材提交。

輸出為忽略提交的 `work/browser-results.json`、`work/v03-dossier.png`。

## 待人工驗收

- 實體iPhone Safari／WebKit尚未實測：安全區、鍵盤、原生選單、螢幕閱讀器、分享匯出到「檔案」與長時間localStorage限制。
- 正式人物圖片未提供：正式肖像、服裝、表情與劇照的一致性、裁切及實際載入效能，待素材補齊依 assets/characters/README.md 驗收。約會／表情／scene-encounter為預留版本，沒有新增自動換裝系統。
- 正式Pages未部署；可由PR分支建立獨立測試站，務必包含 profiles.js 及完整目錄。
- 未重跑完整quota／storage讀取例外注入；保留原保護機制，已驗證損壞本機存檔不覆寫。
- 未窮舉玩家自訂的所有事件組合；作者可改寫資料，深層人物資料在原始碼及進階作者頁可讀，圖鑑解鎖不是資料保密機制。

## iPhone人工流程

1. 先匯出舊版存檔，再在獨立測試站載入；確認工作、家庭、舊記憶與未完對話保留。舊56–99歲角色會變為55。
2. 開圖鑑看初識外貌與鎖定段落，累積熟悉／共同事件後檢查分層解鎖；展開生活管理查看工作與週行程。
3. 每人完成日常兩事件、曖昧與關鍵選擇；分別驗證成功、友情、失敗。若晴應有可成功的新路線，數值100不能跳過事件。
4. 成功後完成專屬後續，確認標籤、回憶、家庭／婚姻與工作保留。刷新並匯出還原一次。
5. 缺圖下對話仍可完成；補正式圖片後驗證頭部裁切、工作立繪與劇照，關閉視窗後焦點與捲動恢復。

## v0.4 AI 測試（2026-10-27）

- 基礎為 main `527077d3fee9c66d90157df3dd1bc8e56ec5a32b`。
- `node --test tests/*.test.cjs`：六個測試檔通過，包含新增 Worker／記憶測試。
- `CHROMIUM_PATH=/usr/bin/chromium node tests/browser-smoke.cjs`：原有17項檢查通過，包含三位正式肖像、圖鑑、探索、工作家庭、離線事件路線、JSON匯入匯出與損壞存檔保護。
- `CHROMIUM_PATH=/usr/bin/chromium node tests/ai-browser.cjs`：本機 Mock 連續三輪、NPC結束、一次時段、只開放芷妍、320／390／430寬無橫向溢出、關係及事件不受惡意回應額外欄位影響、網路中斷後可離線聊天均通過。
- Worker 使用假 AI binding 與假限流測試來源、Secret、限流拒絕、缺少binding、免費日期閘門、輸入及歷史上限、額度錯誤與純文字輸出；沒有呼叫真實模型。
- Wrangler 4.153.0 `deploy --dry-run` 打包通過（約36.72 KiB）；辨識 AI、CHAT_LIMITER、關閉的 AI_ENABLED 與空的免費確認日，沒有部署。
- 新增假計時器驗證18秒 Worker 逾時安全返回、不自動重試。
- 實體 iPhone Safari、真實模型的人設／記憶品質、真實免費帳號限流與額度耗盡仍待有權限後驗收。操作步驟見 [README_AI_SETUP.md](README_AI_SETUP.md)。
