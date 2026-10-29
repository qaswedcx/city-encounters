# v0.3 人物圖資契約

三位核心人物的正式標準肖像已接入。來源為儲存庫根目錄已確認的 ruoqing-portrait.png、yian-portrait.png、zhiyan-portrait.png；PNG 原檔保留不修改。對應輸出為各角色目錄的 portrait-default.webp。

轉檔使用 Pillow WebP lossless=True、method=6、exact=True，不縮圖、不裁切、不改色。三張均維持1086×1448；重新解碼為RGBA後與各自PNG逐像素完全相同。WebP大小依序為1,635,204／1,408,076／1,597,306 bytes。

每位角色目錄（ruoqing／yian／zhiyan）預留以下 WebP 檔名：

- portrait-default.webp、portrait-work.webp、portrait-date.webp
- expression-neutral.webp、expression-smile.webp、expression-shy.webp、expression-tired.webp
- scene-encounter.webp、scene-key.webp、scene-romance.webp

目前標準肖像為3:4。圖鑑以3:4完整顯示；相遇與一般對話以正方形半身構圖顯示，採 object-fit: cover、頂端對齊，等比例縮放並裁切下方，保留頭部及五官。真正劇照仍採16:10，回退標準肖像時改為正方形。未來素材建議肖像1200×1600、劇照1600×1000，仍需依構圖驗收。
路徑皆相對於網站根頁，可部署 GitHub Pages 子目錄。增加圖片不需修改存檔。
人物視覺規格、各場合服裝與深度資料見 js/profiles.js。方向為台灣城市生活、自然光、成熟寫實 2D 半身肖像／劇照；不使用 Q 版或 3D 演出。

目前圖鑑／相遇使用 portrait-default、工作使用 portrait-work；事件使用 scene-key、戀愛後事件使用 scene-romance。約會、各表情及 scene-encounter 為後續擴充欄位，尚無自動表情切換。
工作、約會、表情與劇照等其他變體仍待製作。圖片不存在、讀取失敗或損壞時，先嘗試同角色 portrait-default.webp；若標準肖像也失敗才移除 img，保留有角色姓名與色調的安全輪廓卡。每次顯示最多「變體→標準→輪廓」三階段，無循環重試。成功載入才隱藏輪廓卡。沒有外部圖片服務與付費 API。

## 《新的配方》演出圖集

`zhiyan/recipe-expressions.webp` 是本次以原芷妍肖像為參考生成的工作服頭肩圖集，1774×887、三欄等寬、含透明背景。從左至右為專注、微笑、含蓄低頭；只由 `js/scenes.js` 的官方 story6 品質樣本使用。採高領上衣及完整圍裙，沒有取代標準肖像，也沒有將圖集當成 `profiles.js` 中的單張表情檔。

內景為 `assets/scenes/cafe-closing.webp`。新圖資均在生成後轉存 WebP，遊戲執行時只讀取儲存庫本機檔案。手機畫面與相容策略見 `docs/recipe-scene/README.md`；其他角色／事件的圖資擴展須另經美術檢視。
