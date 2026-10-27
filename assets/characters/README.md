# v0.3 人物圖資契約

正式圖片尚未提供；目前以 CSS 輪廓卡呈現，不將占位輪廓當正式人物美術。

每位角色目錄（ruoqing／yian／zhiyan）預留以下 WebP 檔名：

- portrait-default.webp、portrait-work.webp、portrait-date.webp
- expression-neutral.webp、expression-smile.webp、expression-shy.webp、expression-tired.webp
- scene-encounter.webp、scene-key.webp、scene-romance.webp

建議肖像 1200×1600，人物置中、頭頂保留裁切空間；劇照 1600×1000。介面採 object-fit: cover，手機會裁切，應以實際構圖驗收。
路徑皆相對於網站根頁，可部署 GitHub Pages 子目錄。增加圖片不需修改存檔。
人物視覺規格、各場合服裝與深度資料見 js/profiles.js。方向為台灣城市生活、自然光、成熟寫實 2D 半身肖像／劇照；不使用 Q 版或 3D 演出。

目前圖鑑／相遇使用 portrait-default、工作使用 portrait-work；事件使用 scene-key、戀愛後事件使用 scene-romance。約會、各表情及 scene-encounter 為後續擴充欄位，尚無自動表情切換。
圖片不存在、讀取失敗或損壞時移除 img，保留有角色姓名、主題與不同色調的輪廓卡；成功載入才隱藏輪廓卡。沒有外部圖片服務與付費 API。
