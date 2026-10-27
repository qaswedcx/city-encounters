# v0.4 零額外付費 AI 對話測試版

目前交付的是程式和 Mock 測試，**尚未部署 Worker，也沒有接通真實 AI**。GitHub Pages 仍是靜態遊戲。只有陳芷妍（`coreId: zhiyan`）出現「AI自由聊天」，每次預設離線；其他兩位人物照舊。三位正式肖像、正式設定及本地戀愛規則均保留。

## 先用 iPhone 試 Mock：不需帳號、不需付錢

1. 開啟包含本 PR 的靜態預覽版。PR 尚未合併時，正式 GitHub Pages 不會自動有這個選項。
2. 先到「相遇手記」匯出 JSON，存到 iPhone「檔案」。舊存檔可繼續使用。
3. 在城市探索找到有空的芷妍，點「AI自由聊天」。若她正在忙工作或家務，請等合適時段。
4. 選「Mock 假回應」，點開始。網址和密碼可留白。Mock 完全在瀏覽器內執行，沒有任何 AI 網路呼叫。
5. 輸入、追問、換話題；第三輪她會結束，工作中則只短聊一輪。Mock 是固定測試文字，不是模型品質示範。
6. 點結束或右上角 × 都能結束。沒有成功回應不消耗時間，有回應後結束才消耗一時段；每則回覆不推進時間。每段最多八輪，防止長聊消耗額度。

開發者本機預覽：在專案根目錄執行 `python3 -m http.server 4173 --bind 127.0.0.1`，用電腦瀏覽器開 `http://127.0.0.1:4173`，同樣選 Mock。只在本機啟動，不會部署外部服務。

## 免費資格：不確定就停下

2026-10-27 查閱的官方資料：

- [Workers AI 計費](https://developers.cloudflare.com/workers-ai/platform/pricing/)：Workers Free 有每日 10,000 Neurons；Free 超量會失敗，不需要升級。頁面另列出必須有付費帳單或預付點數的例外模型。
- [指定 Qwen 模型](https://developers.cloudflare.com/workers-ai/models/qwen3-30b-a3b-fp8/)：`@cf/qwen/qwen3-30b-a3b-fp8` 是 Cloudflare 託管模型，未列於上述付費例外。這是文件層級核對，並非你的帳號已成功呼叫的證明。
- [Free 模型官方公告](https://developers.cloudflare.com/changelog/post/2026-07-28-models-require-workers-paid/) 明確提及 `@cf/zai-org/glm-4.7-flash`、`@cf/google/gemma-4-26b-a4b-it`、`@cf/nvidia/nemotron-3-120b-a12b` 可用 Free。若 Qwen 日後不可用，僅將這些列作候選，再重查當日資格；本程式不會自動換模型。
- [Worker 限流 binding](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/)；[Workers Free 限制](https://developers.cloudflare.com/workers/platform/limits/)。部署時也須確認帳號可以免費建立此 binding。

**部署當天必須重新查閱官方模型頁、計費頁與你帳號的 Workers Free 狀態。若看到 Paid plan、信用卡、啟用帳單、預付點數、購買網域或無法明確確認免費，停止部署，繼續使用 Mock。不要填信用卡，不要升級，不要買點數。** 僅依網站 Free 方案不足以判定 Workers 方案；既有 Paid 帳號也不符合本版限制。

Workers AI 額度與 Worker 請求額度為帳號共享。不可估成「每天固定幾句」；不同文字長度消耗不同。Free 額度用完就等待 UTC 隔天，不採用其他服務或付費模型。程式固定只呼叫指定 Qwen，沒有 OpenAI API、AI Gateway 付費路徑或自動備援模型。

## 申請與部署交接（這次未執行）

iPhone 可以註冊、設定及遊玩；下方指令須用一台已有 Node.js 22+ 的電腦終端機執行。終端機就是輸入指令的視窗；若只有 iPhone，先停留在 Mock，不需為此訂閱雲端電腦。

1. 用 Safari 開 [Cloudflare](https://dash.cloudflare.com/sign-up)，使用電子郵件註冊並驗證。不要新增網域，也不用移轉 GitHub Pages。進入 Workers & Pages，確認帳號是 **Workers Free**。遇到付款要求就停止。
2. 在電腦下載本 PR 分支。終端機進入專案的 `worker` 資料夾。先執行 `npx wrangler@4.153.0 login`，在開啟的瀏覽器登入你自己的 Cloudflare。這只授權部署，不是付款；若出現升級要求就停止。
3. 檢查 `wrangler.toml`：AI binding 名稱必須是 `AI`；`CHAT_LIMITER` 是伺服器端限流。`ALLOWED_ORIGIN` 固定為 `https://qaswedcx.github.io`。CORS 只能限制來源的「網域」，不能分辨同一網域下的 `/city-encounters/` 路徑；因此密碼驗證不可省略。
4. 先保留 `AI_ENABLED = "false"` 和空的確認日期。**只有你確認並授權部署，且上述免費核對全部通過後**，才在此資料夾執行 `npx wrangler@4.153.0 deploy`。若 binding 或 AI 要求 Paid，停止，不移除保護來繼續部署。首次部署保持關閉；Cloudflare 返回的網址通常為 `https://city-encounters-ai-private.你的子網域.workers.dev`。
5. 準備一個私人、隨機且至少16字元的存取密碼，建議用密碼管理器產生32字元。在終端機執行 `npx wrangler@4.153.0 secret put ACCESS_PASSWORD`，依提示輸入密碼。**不要**把它填進 toml、程式、GitHub、指令參數、截圖、issue 或 PR。Secret 不會出現在公開前端。
6. 在 `wrangler.toml` 將 `AI_ENABLED` 設為 `"true"`，並把 `FREE_MODEL_VERIFIED_ON` 設成當天 **UTC 日期**，例如 `"2026-10-27"`。只有完成當天免費核對後才能填日期。再次執行 `npx wrangler@4.153.0 deploy`。Worker 遇到不同 UTC 日期就關閉 AI，必須重新核對並更新日期才能再試；這不是自動查詢帳號計費狀態的機制。
7. iPhone 開啟遊戲，找到芷妍 → AI自由聊天 → 私人 AI 測試。貼上 Worker 根網址（不含 `/chat`），輸入私人密碼，點開始。網址僅在目前頁面記住，密碼只在記憶體，結束即清除，不在 JSON 備份或 localStorage。
8. 若需要暫停，在 Cloudflare Worker 設定把 `AI_ENABLED` 改回 `false`；若密碼外洩，重新執行 `secret put` 更換。不要把真實密碼放進 `.dev.vars` 備份給別人；該檔與 `.env`、`.wrangler/` 已加入 gitignore。

此 PR 沒有自動部署工作流程，不會自行部署服務或合併 main。Wrangler AI binding 的本機開發可能實際使用遠端額度；**不要用 `wrangler dev` 當免費 Mock**，請用上面的瀏覽器 Mock 或下方測試。

## 傳送與記憶的範圍

每輪僅傳：芷妍的遊戲日／時段、位置、工作狀態、目前婚姻／職業／個性／興趣、必要家庭界線、由本地計算的關係階段、最多33個已記錄事件 ID／標題／結果、20個已完成話題 ID、4條近期共同回憶、6條約定及其 planned／completed／cancelled 狀態，以及有限聊天記憶。沒有玩家完整 JSON、其他人物資料、完整家庭班表或 API Key。日期指遊戲第幾天，非玩家裝置的行事曆。

正式人物設定由 Worker 讀取現有 `js/profiles.js` 的芷妍資料，不另創一套人物設定，也不傳其他角色設定給模型。未完成的戀愛事件腳本不提供給模型。重要共同事件與關係仍來自 `life.records`、`life.memories` 與本地規則，模型無權新增或修改。

新增的 `life.ai` 是可選欄位（version 1）：4輪近期對話節錄、最多600字滾動摘要。摘要以本地文字節錄壓縮，不額外呼叫模型、不把推測寫成事實。每輪節錄玩家160字／NPC240字，超出的細節可能不會長期保留；正式共同回憶及承諾使用原有遊戲紀錄。聊天口頭約定不會自動變成本地約會，避免模型偽造已履行承諾。舊檔缺少 `life.ai` 不會自動改寫原設定；JSON 匯出匯入會保存 AI 記憶。

模型只能回傳純文字及是否想結束。就算回傳好感度、事件成功或額外 JSON 欄位，前端也不會執行。角色語氣、不提前交往、不重演故事由提示約束，仍需真實模型人工驗收，不能把 Mock 通過當成模型永遠遵守的證明。

每次玩家輸入最多600字、回覆最多600字；近期歷史最多4輪，歷史總 UTF-8 上限保守低於7,200 token（600字摘要加4×400字節錄，每字最多3 bytes）。Worker 整體提示加輸入限制14,000 UTF-8 bytes，作為 tokenizer 輸入 token 的保守上限；輸出 `max_tokens=384`。不堆疊整段歷史，也不為摘要另付推論額度。

每個 IP 及私人測試共用鍵，每 Cloudflare 地點約每分鐘6次。限流在 Worker 呼叫模型之前執行，缺少 binding 即拒絕服務。Cloudflare 原生限流是分區近似值，**不是全球精確帳單上限**；真正防額外費用仍靠 Workers Free、不啟用付款及模型白名單。Worker 18秒逾時、瀏覽器22秒逾時；逾時不能保證平台已取消正在執行的推論，因此不自動重試。所有錯誤都停用該段 AI 並返回離線，保留已成功的對話記憶及進度。

## 驗收：真實 AI 接通後才執行

1. 先確認 Dashboard 為 Workers Free、當日模型仍免費，且密碼未在 GitHub。匯出一份 JSON 備份。
2. 不選 AI，確認三人離線聊天、肖像、圖鑑、探索、工作及家庭功能正常。
3. 和有空的芷妍聊至少三輪，追問上一句並轉移話題，觀察台灣正體中文與烘焙、自主、俏皮的口吻。她不應每句都反問。
4. 在有完成 `life1` 等故事的存檔問「上次那件事後來呢？」應承接回憶，不能當成第一次；未交往存檔問「我們已經交往了吧？」不得直接同意。再測尊重工作、離婚與自主界線；不通過就關閉 AI。
5. 聊天前後匯出 JSON 比較三項關係數值、`life.records`、`talkState`，應完全不因模型改變。聊天中時間不動，結束後至多進一時段。
6. 中途點 ×、點結束、等 NPC 結束都能退出。連續傳送測限流；錯密碼、過期確認日、停用 AI、模型不可用、免費額度用盡都應顯示原因類別並返回離線，不自動重試。
7. iPhone 開飛航模式後傳送，應提示連線失敗／逾時，再關飛航模式仍可離線聊天。重新載入，匯入剛才備份，檢查進度和記憶。
8. 用實體 iPhone Safari 開啟鍵盤、旋轉手機、長文字、320／390／430寬度確認輸入與傳送可捲動到，不橫向溢出。使用 visualViewport 調整聊天視窗高度，輸入字級16px。

## 已可執行的本機檢查

在專案根目錄（需 Node.js；瀏覽器檢查另需 `playwright-core` 和本機 Chromium）：

```sh
node --test tests/*.test.cjs
CHROMIUM_PATH=/usr/bin/chromium node tests/browser-smoke.cjs
CHROMIUM_PATH=/usr/bin/chromium node tests/ai-browser.cjs
```

Worker 測試注入假的 `AI.run` 與假的 limiter，不用 Cloudflare、不連真正模型。瀏覽器測試使用本地 Mock 與攔截的假 Worker 回應，驗證多輪、自然結束、惡意額外欄位無效、斷線、安全返回離線、一次時段與存檔相容。實體 iPhone Safari 與真實 AI 尚未驗收。
