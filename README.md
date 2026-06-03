# Antigravity Stock AI - 台股 AI 綜合分析團隊 📈

這是一個基於 **多代理人協作管線 (Multi-Agent Pipeline)** 的台股綜合分析與決策系統。採用現代的前端視覺化技術，展示多位 AI 專家在技術面、基本面、籌碼面、總經面、公司資訊及分點面上的獨立研究、交叉質詢與最終共識決策過程。

## 🌐 專案展示 & 線上體驗 (Live Demo)
* **GitHub Pages 線上直接體驗**：[https://asia17242.github.io/0602_Taiwan-Stock/](https://asia17242.github.io/0602_Taiwan-Stock/)
* **GitHub 原始碼倉庫**：[https://github.com/asia17242/0602_Taiwan-Stock](https://github.com/asia17242/0602_Taiwan-Stock)

---

## 👥 六大 AI 代理人團隊角色 (Team Roles)

1. **📈 技術分析高手 (Technical Analyst)**
   * 評估價格走勢、均線排列與糾結扣抵狀況。
   * 追蹤 KD、RSI、MACD 交叉及背離訊號。
   * 畫出包含 5MA (桃紅)、20MA (湖藍)、60MA (翠綠)、100MA (黃)、240MA (橘) 五條移動平均線的日 K 線 Canvas 圖表。
2. **📊 基本面分析高手 (Fundamental Analyst)**
   * 追蹤營收 YoY/MoM 成長性及每季 EPS。
   * 評估毛利率、營業利益率與純益率（三率）走勢折線圖。
   * 分析 ROE、每股淨值與估值區間安全邊際。
3. **💎 籌碼分析高手 (Chip Analyst)**
   * 追蹤三大法人（外資、投信、自營商）與八大公股行庫多天期累計買賣超統計。
   * 追蹤千張大戶持股比率變動。
4. **🌍 總經分析高手 (Macroeconomics Analyst)**
   * 連結全球總經指標（美國 CPI、美債殖利率、聯準會利率、美元指數）。
   * 整合最新產業鏈前景與國際相關財經新聞。
5. **🏢 公司資訊專家 (Company Info Analyst)**
   * 提供實收股本、董事長、主營業務與歷史背景。
   * 提供最新重大新聞的 **AI 深度解讀** 與 **投資操作策略建議**。
6. **🤝 分點分析專家 (Branch Analyst)**
   * 統計個股在 5、10、20、60、240 天的前 15 大買進與賣出券商分點明細與佔比。
   * 提供分點專家主力吸貨/出貨的平均成本與操作建議。

## 🏆 股市高手群組選股建議 (Stock Masters)
系統整合了六位投資大師的經典理論，對個股進行嚴格的量化與質性體檢：
* **威廉‧歐尼爾 (CAN SLIM)**：尋找高動能飆股雛形。
* **華倫‧巴菲特 (Economic Moat)**：評估企業長期護城河與 ROE。
* **彼得‧林區 (Growth & PEG)**：生活投資學與四步驟分類診斷。
* **班傑明‧葛拉漢 (Margin of Safety)**：台股在地化七大指標防禦型投資。
* **喬伊‧葛林布雷 (Magic Formula)**：ROC 與 EY 雙重排名量化選股。
* **雷‧達里歐 (Macro Cycle)**：總體經濟週期與全球資產配置風險評估。

---

## ✨ 核心功能特色

* 🌌 **暗黑磨砂玻璃視覺 (Glassmorphism)**：高質感的深色未來感介面，自定義霓虹漸層光暈與微動畫。
* ⚙️ **Multi-Agent 協作模擬管線**：以時序動畫模擬 6 個代理人從獨立研究加載、交叉對話辯論到產出報告的全過程。
* 🌍 **全球總經獨立診斷**：首頁一鍵啟動宏觀環境分析，包含 8 大核心指標監控與動態雷達圖。
* 📊 **HTML5 雙 Canvas 繪圖引擎**：
  * **技術面**：支援多區間切換（1季至10年），具備 Crosshair 十字游標與即時 O/H/L/C 數據。
  * **基本面/籌碼面**：包含月營收 YoY、P/E 河流圖、法人買賣超趨勢等多樣化動態圖表。
* 📥 **一鍵匯出 Excel**：整合 **SheetJS (XLSX)**，免後端純前端生成標準三頁籤（專家摘要、多空論證、操作策略）美化 Excel 報表。
* 🔍 **智慧模糊查詢**：內建台積電、鴻海、聯發科與廣達的 2026 最新真實分析數據；自訂股號（如 2303、3008）則由演算法動態產生合理的模擬數據，查無代號時自動對照個股名稱字典。

---

## 🚀 本地快速啟動

專案為純前端網頁，無須任何複雜的後端伺服器配置：

### 1. 雙擊開啟（最簡單）
直接雙擊 [index.html](index.html) 即可在瀏覽器中直接運行。

### 2. 啟動輕量本地伺服器（推薦，匯出 Excel 相容性最佳）
在專案根目錄下使用 Python 啟動本地伺服器：
```bash
python -m http.server 8000
```
接著在瀏覽器中訪問：[http://localhost:8000](http://localhost:8000)

---

## 🛠️ 技術棧 (Tech Stack)

* **結構**：HTML5
* **樣式**：Vanilla CSS 3 (變數、毛玻璃、網格佈局、霓虹發光)
* **邏輯**：Vanilla JavaScript (ES6+)
* **圖表**：HTML5 Canvas 2D Context API
* **工具**：[SheetJS (XLSX)](https://github.com/SheetJS/sheetjs) CDN
* **圖示**：FontAwesome 6.4.0
* **字體**：Google Fonts (Outfit & Noto Sans TC)

---

*免責聲明：本系統所有報告內容均為 AI 模擬與資料整合，不構成實際投資建議。投資有風險，入市需謹慎。*
