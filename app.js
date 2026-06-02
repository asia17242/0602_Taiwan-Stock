// ==========================================================================
// Antigravity Stock AI - Database & Application Logic (Complete Interactive Version)
// ==========================================================================

// Helper to generate Broker Branch mock data
function generateMockBranchData(symbol, name, basePrice, type) {
    const brokerNames = [
        "元大台北", "凱基台北", "富邦台北", "永豐金台北", "國泰敦南", 
        "群益金鼎台北", "美商高盛", "摩根大通", "台灣摩根士丹利", "美林台北", 
        "瑞士信貸", "花旗環球", "日商野村", "元富台北", "統一南京", 
        "兆豐證券", "華南永昌", "台新金控", "國票證券", "第一金控"
    ];
    const shuffleArray = (arr) => [...arr].sort(() => Math.random() - 0.5);
    const data = {};
    const daysArr = [5, 10, 20, 60, 240];
    const factor = type === 0 ? 1.5 : (type === 1 ? 0.9 : -0.5);
    daysArr.forEach(days => {
        const shuffled = shuffleArray(brokerNames);
        const buyList = [];
        const sellList = [];
        let totalBuyVol = 0;
        let totalSellVol = 0;
        for (let i = 0; i < 15; i++) {
            const baseVol = Math.floor((1000 + Math.random() * 5000) * (days / 5));
            const buyVol = Math.floor(baseVol * (factor > 0 ? (1 + factor * 0.3) : (0.5 + Math.random() * 0.3)));
            totalBuyVol += buyVol;
            buyList.push({
                branch: shuffled[i],
                volume: buyVol
            });
            const sellVol = Math.floor(baseVol * (factor < 0 ? (1 + Math.abs(factor) * 0.3) : (0.5 + Math.random() * 0.3)));
            totalSellVol += sellVol;
            sellList.push({
                branch: shuffled[(i + 5) % brokerNames.length],
                volume: -sellVol
            });
        }
        buyList.sort((a, b) => b.volume - a.volume);
        sellList.sort((a, b) => a.volume - b.volume);
        buyList.forEach(item => {
            item.percent = ((item.volume / totalBuyVol) * 100).toFixed(1) + "%";
        });
        sellList.forEach(item => {
            item.percent = ((Math.abs(item.volume) / totalSellVol) * 100).toFixed(1) + "%";
        });
        let suggestion = "";
        const topBuyer = buyList[0].branch;
        const topSeller = sellList[0].branch;
        if (factor > 0) {
            suggestion = `近 ${days} 日主力分點進出偏向買方。買超第一大分點為【${topBuyer}】，累計買超達 ${buyList[0].volume.toLocaleString()} 張，佔前 15 大買進比重達 ${buyList[0].percent}。整體籌碼由內外資主力積極吸納，平均成本約在近期均線附近，下檔多頭防守力道強，建議逢拉回分批偏多佈局。`;
        } else if (factor === 0 || factor > -0.2) {
            suggestion = `近 ${days} 日分點買賣呈現區間角力，買超第一大為【${topBuyer}】，賣超第一大為【${topSeller}】，買賣超力道相近，並無單一分點顯著鎖碼。代表市場主力仍處於良性換手與觀望期，預計股價短期呈區間整理，建議靜待關鍵主力表態再行跟進。`;
        } else {
            suggestion = `近 ${days} 日分點數據偏向賣方拋售，賣超第一大分點為【${topSeller}】，累計賣超 ${Math.abs(sellList[0].volume).toLocaleString()} 張，籌碼呈現自主力分點流向散戶之跡象。高檔套牢壓力沉重，均價有下壓趨勢，建議持股者暫時減碼或避開，待賣壓竭盡、分點重新回頭買超後再行評估。`;
        }
        data[days] = {
            buy: buyList,
            sell: sellList,
            suggestion: suggestion
        };
    });
    return data;
}

// 1. Common Stock Names Dictionary to resolve stock symbols into names
const commonStockNames = {
    "2330": "台積電",
    "2317": "鴻海",
    "2454": "聯發科",
    "2382": "廣達",
    "3008": "大立光",
    "2303": "聯電",
    "2603": "長榮",
    "3231": "緯創",
    "2357": "華碩",
    "2609": "陽明",
    "2615": "萬海",
    "2881": "富邦金",
    "2882": "國泰金",
    "2891": "中信金"
};

// 2. Recommendations Databases (Top 10 Buy & Sell based on 5 Agents)
const buyRecommendations = [
    { symbol: "2330", name: "台積電", price: "2,380.0", change: "+1.06%", rating: "強力買進", badge: "strong-buy" },
    { symbol: "2317", name: "鴻海", price: "301.5", change: "+4.32%", rating: "偏多佈局", badge: "buy" },
    { symbol: "2382", name: "廣達", price: "409.5", change: "+9.93%", rating: "偏多佈局", badge: "buy" },
    { symbol: "2454", name: "聯發科", price: "4,525.0", change: "+1.20%", rating: "偏多佈局", badge: "buy" },
    { symbol: "3231", name: "緯創", price: "128.5", change: "+2.40%", rating: "偏多佈局", badge: "buy" },
    { symbol: "3008", name: "大立光", price: "2,650.0", change: "+1.90%", rating: "偏多佈局", badge: "buy" },
    { symbol: "2603", name: "長榮", price: "215.5", change: "+3.10%", rating: "偏多佈局", badge: "buy" },
    { symbol: "2308", name: "台達電", price: "380.0", change: "+0.80%", rating: "偏多佈局", badge: "buy" },
    { symbol: "2301", name: "光寶科", price: "118.0", change: "+1.50%", rating: "偏多佈局", badge: "buy" },
    { symbol: "3711", name: "日月光投控", price: "175.0", change: "+2.10%", rating: "偏多佈局", badge: "buy" }
];

const sellRecommendations = [
    { symbol: "2498", name: "宏達電", price: "42.50", change: "-2.30%", rating: "避開或放空", badge: "sell" },
    { symbol: "2609", name: "陽明", price: "72.80", change: "-3.50%", rating: "避開或放空", badge: "sell" },
    { symbol: "2615", name: "萬海", price: "85.50", change: "-4.20%", rating: "避開或放空", badge: "sell" },
    { symbol: "6116", name: "彩晶", price: "9.20", change: "-1.50%", rating: "避開或放空", badge: "sell" },
    { symbol: "2409", name: "友達", price: "16.50", change: "-2.10%", rating: "避開或放空", badge: "sell" },
    { symbol: "3481", name: "群創", price: "13.20", change: "-2.80%", rating: "避開或放空", badge: "sell" },
    { symbol: "2353", name: "宏碁", price: "45.20", change: "-1.10%", rating: "觀望偏中立", badge: "neutral" },
    { symbol: "2324", name: "仁寶", price: "32.80", change: "-0.90%", rating: "觀望偏中立", badge: "neutral" },
    { symbol: "2883", name: "開發金", price: "15.20", change: "+0.10%", rating: "觀望偏中立", badge: "neutral" },
    { symbol: "2618", name: "長榮航", price: "34.50", change: "-1.20%", rating: "觀望偏中立", badge: "neutral" }
];

// 3. Helper function: Generate sequential historical prices for K-line & MAs
function generateHistoricalKLine(basePrice, days = 30, trend = "up") {
    const data = [];
    let currentPrice = basePrice;
    
    let ma5 = basePrice * 0.98;
    let ma20 = basePrice * 0.95;
    let ma60 = basePrice * 0.90;
    let ma100 = basePrice * 0.85;
    let ma240 = basePrice * 0.75;

    const startYear = 2026;
    const startDate = new Date(startYear, 4, 15); // May 15, 2026

    for (let i = 0; i < days; i++) {
        const currentDate = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
        const dateStr = `${currentDate.getMonth() + 1}/${currentDate.getDate()}`;
        
        const changePercent = (Math.random() - (trend === "down" ? 0.55 : 0.43)) * 0.04;
        const delta = currentPrice * changePercent;
        
        const open = currentPrice;
        const close = currentPrice + delta;
        
        const high = Math.max(open, close) + Math.random() * (currentPrice * 0.015);
        const low = Math.min(open, close) - Math.random() * (currentPrice * 0.015);
        const volume = Math.floor(20000 + Math.random() * 80000);

        ma5 = ma5 * 0.8 + close * 0.2;
        ma20 = ma20 * 0.9 + close * 0.1;
        ma60 = ma60 * 0.95 + close * 0.05;
        ma100 = ma100 * 0.97 + close * 0.03;
        ma240 = ma240 * 0.99 + close * 0.01;

        data.push({
            date: dateStr,
            open: parseFloat(open.toFixed(1)),
            high: parseFloat(high.toFixed(1)),
            low: parseFloat(low.toFixed(1)),
            close: parseFloat(close.toFixed(1)),
            volume: volume,
            ma5: parseFloat(ma5.toFixed(1)),
            ma20: parseFloat(ma20.toFixed(1)),
            ma60: parseFloat(ma60.toFixed(1)),
            ma100: parseFloat(ma100.toFixed(1)),
            ma240: parseFloat(ma240.toFixed(1))
        });

        currentPrice = close;
    }
    return data;
}

// 4. Stock Database (Hon Hai, TSMC, Quanta, MediaTek)
const stockDB = {
    "2317": {
        symbol: "2317",
        name: "鴻海",
        time: "2026-06-02",
        rating: "偏多佈局",
        badge: "buy",
        suggestion: "由於短線股價創高後乖離偏大，不建議在 300 元以上融資追高。建議採取「拉回分批布局」策略，當股價回測 5/29 跳空缺口（280 - 285 元）或月線（275 - 280 元）附近，且量能縮小時，為極佳的中長線切入點。",
        stoploss: "跌破 5/29 長紅 K 線低點 263 元，或跌破季線 252 元且三日不站回，則中線多頭格局破壞，應果斷停損。",
        
        // Detailed Dimensions Data
        klineData: generateHistoricalKLine(260, 30, "up"),
        fundamentalData: {
            eps: "3.56",
            roe: "14.8",
            nav: "115.4",
            yield: "4.1",
            quarters: ["25Q2", "25Q3", "25Q4", "26Q1"],
            gross: [6.42, 6.22, 6.12, 6.18],
            op: [3.42, 3.25, 3.12, 3.57],
            net: [2.15, 2.02, 1.95, 2.35]
        },
        chipData: [
            { subject: "外資", d5: 126500, d10: 184200, d20: 220100, d60: 350500, d240: 620000 },
            { subject: "投信", d5: 15400, d10: 24300, d20: 48000, d60: 92400, d240: 180300 },
            { subject: "自營商", d5: 5800, d10: 8200, d20: 12000, d60: 20500, d240: 45200 },
            { subject: "八大公股行庫", d5: -12100, d10: -24600, d20: -36200, d60: -80100, d240: -120500 },
            { subject: "美商高盛 (主力分點)", d5: 35200, d10: 52100, d20: 78500, d60: 120200, d240: 210000 },
            { subject: "摩根大通 (主力分點)", d5: 28100, d10: 41300, d20: 60200, d60: 95300, d240: 175600 }
        ],
        branchData: generateMockBranchData("2317", "鴻海", 301.5, 1),
        macroData: {
            indicators: [
                { label: "美國 5 月 CPI", value: "3.1%", change: "持平", trend: "neutral", desc: "符合市場預期，通膨降溫趨勢未變。" },
                { label: "台灣景氣對策燈號", value: "39 分", change: "紅燈", trend: "up", desc: "連續 5 個月亮出熱絡紅燈，景氣強勁。" },
                { label: "美聯準會利率基準", value: "5.25%", change: "-0.25%", trend: "down", desc: "降息循環展開，資金持續回流新興市場。" },
                { label: "美元指數 (DXY)", value: "101.4", change: "-0.8%", trend: "down", desc: "走勢疲弱，有利於非美貨幣及外資匯入。" }
            ],
            news: [
                { title: "NVIDIA 股東會釋出樂觀展望，鴻海 GB200 機櫃確認第三季底出貨", source: "工商時報", url: "https://news.cnyes.com/news/id/5591234", summary: "輝達確認 AI 伺服器需求爆發，鴻海作為最大代工廠，產能已全數排滿，下半年營收將爆發式成長。" },
                { title: "三大法人同步認養！外資 5/29 狂掃鴻海 8 萬張，籌碼大突破", source: "經濟日報", url: "https://tw.stock.yahoo.com/news/foxconn-institutional-chip-breakout-12502.html", summary: "受惠於雲端大廠擴大資本支出，外資單日大砸近百億元鎖碼鴻海，主力籌碼結構呈高度健康換手。" }
            ]
        },

        // Role 5: Company Info Analyst data
        companyData: {
            capital: "1,386.3 億元",
            chairman: "劉揚偉",
            business: "3C 電子代工製造服務 (EMS)、電動車、半導體與 AI 伺服器垂直整合。",
            history: "鴻海精密工業股份有限公司由郭台銘先生創立於 1974 年，以模具技術起家。自 1990 年代起，透過專利佈局與全球化垂直整合，以「Foxconn」品牌發展為全球最大電子代工廠，並於近年積極佈局電動車 (EV)、數位健康、機器人三大新興產業以及人工智慧 (AI) 運算平台研發。",
            newsAnalysis: [
                {
                    title: "鴻海受惠 GB200 機櫃出貨放量，外資調高營收與毛利展望",
                    source: "工商時報",
                    url: "https://news.cnyes.com/news/id/5592317",
                    ai_analysis: "GB200 高階整機櫃（NVL72）的單價極高，預計第三季末出貨後，將對鴻海的營收結構產生劇烈轉變。由於整機櫃的設計難度與軟硬體整合度高，估計其毛利及營益率空間將較以往純硬體代工顯著提升。",
                    ai_suggestion: "建議投資人此時無需在 300 元以上融資追高，高檔震盪整理機率大。若股價拉回至 280-285 元月線支撐附近，為長線分批布局的極佳機會。"
                },
                {
                    title: "鴻海與 NVIDIA 在先進自動化與數位孿生工廠領域深化合作",
                    source: "經濟日報",
                    url: "https://tw.stock.yahoo.com/news/foxconn-nvidia-omniverse-cooperation-03401.html",
                    ai_analysis: "透過引入 NVIDIA Omniverse 平台，鴻海能大舉減少全球新工廠生產線的調整時間與成本，同時能快速切入 AI 自動化設備及後續 AI 機器人代工的先機，中長線有利於產品利潤率提升。",
                    ai_suggestion: "此合作強化了鴻海在 AI 晶片巨頭生態圈的不可替代性，對長期估值提升 (Re-rating) 具有關鍵推動作用，建議列為長線核心持股名單。"
                }
            ]
        },

        expertViews: [
            { area: "技術面", conclusion: "偏多，但防短線回檔", badge: "buy", reason: "均線完美多頭排列但指標超買，短線與季線乖離偏大需震盪整理。" },
            { area: "基本面", conclusion: "看多", badge: "strong-buy", reason: "Q1 財報三率雙升、營益率創 9 年同期新高，AI 伺服器市占率逾四成，估值仍具吸引力。" },
            { area: "籌碼面", conclusion: "看多", badge: "strong-buy", reason: "外資與投信法人持續強勢認養，主力籌碼高度集中，下檔有法人防守買盤。" },
            { area: "總經面", conclusion: "看多", badge: "strong-buy", reason: "台灣景氣對策燈號連五紅，全球 CSP 廠資本支出擴大，AI 需求極度順風。" },
            { area: "公司資訊", conclusion: "偏多", badge: "buy", reason: "實收股本達 1386.3 億元，為全球電子代工巨擘，與 NVIDIA 緊密合作具備極深轉型護城河。" },
            { area: "分點面", conclusion: "看多", badge: "strong-buy", reason: "主力分點元大台北與美商高盛近10日大舉囤貨逾2.5萬張，進出均價落在280-285元，具備極強防禦支撐。" }
        ],
        pros: [
            "<span class='highlight-bold'>AI 機櫃領航者與極佳估值</span>：鴻海在 AI 伺服器全球市占率逾四成，是 NVIDIA Blackwell 平台核心受益者。相較同業，目前約 17-18 倍的預估本益比具有極高的安全邊際。",
            "<span class='highlight-bold'>法人強力鎖碼</span>：5 月底至 6 月初外資與投信聯手大買超，千張大戶持股高檔穩定，籌碼已沈澱於中長線法人手中，結構十分健康。",
            "<span class='highlight-bold'>總經與產業共振</span>：全球 AI 算力基礎設施建置處於高速擴張期，配合台灣景氣對策信號連五紅，營運與總經趨勢高度契合。"
        ],
        cons: [
            "<span class='highlight-bold'>技術指標超買與乖離過大</span>：股價短期漲幅較大，日 KD 與 RSI 均進入極度超買區，且與季線、半年線乖離率過高，需防範短線獲利回吐壓力和震盪。",
            "<span class='highlight-bold'>大盤高檔震盪與資券風險</span>：台股大盤已處於歷史高檔，整體市場融資餘額亦高，若大盤因美股修正而波動，短線股價恐受拖累。"
        ],
        debateLogs: [
            { sender: "技術專家", area: "tech", content: "股價短線從 260 拉到 300 元以上，短線與 20MA 乖離近 8%，日 KD 鈍化於 90 以上，這在技術面是需要震盪修正的警訊。" },
            { sender: "籌碼專家", area: "chip", content: "同意技術面的緊繃。不過 5/29 帶量長紅是外資單日大買 8 萬張砸出來的，6/2 外資又買超 2.5 萬張。這代表是法人大單推動，並非散戶虛拉。回檔在 280-285 元會有極強防守力。" },
            { sender: "基本面專家", area: "fund", content: "第一季營益率 3.57% 創 9 年同期新高，這印證了我們對 AI 伺服器出貨結構改善毛利的預測。如果下半年 GB200 機櫃如期放量，全年 EPS 要挑戰 17 元甚至 18 元並非難事，目前本益比 17 倍非常具吸引力。" },
            { sender: "公司專家", area: "company", content: "從公司層面來看，鴻海股本 1386 億元在代工廠中規模最大，具有全球垂直整合能力。劉揚偉董事長特別強調了與 NVIDIA 的Omniverse數位孿生合作，這會在中長期大舉降低調整產線的時間成本，且公司有成熟的海外建廠布局，抗地緣政治能力強。" },
            { sender: "總經專家", area: "macro", content: "總經景氣對策燈號連五紅，AI 需求很扎實。但下半年台灣景氣因基期墊高可能回落，且美元弱勢下，台幣急升是否會帶來匯損？" },
            { sender: "基本面專家", area: "fund", content: "鴻海有成熟的全球外匯避險機制，且 AI 機櫃是美元報價的高單價產品，營收基數極大，高毛利產品出貨能稀釋匯率波動影響。基本面高成長能完全支撐總經風向。" }
        ]
    },
    "2330": {
        symbol: "2330",
        name: "台積電",
        time: "2026-06-02",
        rating: "強力買進",
        badge: "strong-buy",
        suggestion: "台積電基本面及全球科技戰略地位無可匹敵，2380 元附近建議採取「逢回買進」策略。由於 6/11 即將除息 6 元，且 6/4 股東會在即，中長線投資人可於現階段分批布局，或於拉回至短期均線（如 10MA 約 2330 元）時建立基本部位。",
        stoploss: "中長線防守價設於波段起漲點 2200 元或季線 2180 元。若跌破且週線收低，則考慮調節部分持股。",
        
        // Detailed Dimensions Data
        klineData: generateHistoricalKLine(2200, 30, "up"),
        fundamentalData: {
            eps: "22.08",
            roe: "26.4",
            nav: "410.2",
            yield: "2.5",
            quarters: ["25Q2", "25Q3", "25Q4", "26Q1"],
            gross: [53.2, 54.1, 53.8, 54.5],
            op: [42.1, 43.2, 42.8, 43.9],
            net: [38.2, 39.5, 38.9, 40.1]
        },
        chipData: [
            { subject: "外資", d5: 45200, d10: 95400, d20: 154200, d60: 280100, d240: 512000 },
            { subject: "投信", d5: 4800, d10: 8900, d20: 16500, d60: 31200, d240: 89000 },
            { subject: "自營商", d5: 2100, d10: -1200, d20: 5400, d60: 12100, d240: 32000 },
            { subject: "八大公股行庫", d5: -5100, d10: -12400, d20: -24100, d60: -54200, d240: -105000 },
            { subject: "美商高盛 (主力分點)", d5: 14200, d10: 28400, d20: 51200, d60: 98100, d240: 185000 },
            { subject: "台灣摩根士丹利", d5: 11500, d10: 24100, d20: 41200, d60: 74200, d240: 151000 }
        ],
        branchData: generateMockBranchData("2330", "台積電", 2380, 0),
        macroData: {
            indicators: [
                { label: "美國 5 月 CPI", value: "3.1%", change: "持平", trend: "neutral", desc: "符合預期，通膨降溫有利於科技股評價提升。" },
                { label: "台灣景氣對策燈號", value: "39 分", change: "紅燈", trend: "up", desc: "AI 及先進半導體出口創高是景氣長紅主因。" },
                { label: "費城半導體指數", value: "5,310", change: "+1.2%", trend: "up", desc: "創歷史新高，海外半導體熱潮持續拉動台股。" },
                { label: "美元兌台幣匯率", value: "31.95", change: "-0.2%", trend: "down", desc: "外資持續匯入買超台積電，台幣呈走強格局。" }
            ],
            news: [
                { title: "台積電 6/4 股東會在即，市場聚焦先進封裝 CoWoS 再擴產計畫", source: "中央社", url: "https://news.cnyes.com/news/id/5592330", summary: "由於輝達及超微需求急切，傳台積電將上修今年 CoWoS 產能目標，並擴大台灣本土建廠規模。" },
                { title: "Q1 單季 EPS 22.08 元！台積電晶圓代工漲價效應顯現", source: "工商時報", url: "https://tw.stock.yahoo.com/news/tsmc-earnings-eps-record-high-1102.html", summary: "隨著 3 奈米製程占比攀升與定價權優勢，台積電第一季財報各項指標均超越市場預期，毛利率站穩高點。" }
            ]
        },

        // Role 5: Company Info Analyst data
        companyData: {
            capital: "2,593.2 億元",
            chairman: "魏哲家",
            business: "先進與成熟製程晶圓代工、CoWoS 先進封裝服務。",
            history: "台灣積體電路製造股份有限公司成立於 1987 年，由創辦人張忠謀先生在新竹科學園區創立，開創了全球「純晶圓代工 (Foundry)」商業模式。目前為全球規模最大且技術領先的半導體製造公司，在 3 奈米與未來 2 奈米先進製程占有高達 90% 以上份額，是全球電子產業最關鍵的護城河。",
            newsAnalysis: [
                {
                    title: "台積電 3 奈米先進製程產能爆滿，大客戶認同調漲 2026 代工價格",
                    source: "高盛證券",
                    url: "https://news.cnyes.com/news/id/5590920",
                    ai_analysis: "先進製程產能呈現供不應求，台積電的定價權在此時發揮極致。預計代工價格調漲 3-5% 將順利轉嫁給 NVIDIA、Apple 等大客戶，這將完全覆蓋海外設廠（美、日、德）折舊與地緣政治所帶來的成本上升。",
                    ai_suggestion: "調漲價格是基本面強大的體現，將強力支撐股價。建議中長線配置者在 2300 元左右分批買進，伴隨除息機會長期持有。"
                },
                {
                    title: "AI 晶片出貨瓶賺在先進封裝，台積電大動作擴充 CoWoS 產能",
                    source: "中央社",
                    url: "https://tw.stock.yahoo.com/news/tsmc-advanced-packaging-cowos-expansion-09100.html",
                    ai_analysis: "AI 伺服器 GPU 出貨的最主要限制器是 CoWoS 先進封裝。台積電積極購置國內舊廠房進行封裝廠改建，預期 2026 全年產能將呈倍數增長，這將帶動先進製程投片量的進一步釋放。",
                    ai_suggestion: "先進封裝瓶頸的消除直接等於下半年營收的高成長，這是一個長線的基本面強利多，支撐台積電邁向 5000 點以上的估值評級。"
                }
            ]
        },

        expertViews: [
            { area: "技術面", conclusion: "多方趨勢，高檔震盪", badge: "buy", reason: "6/1 創下歷史新高 2415 元，目前短線呈高檔強勢整理，各期均線維持多頭排列。" },
            { area: "基本面", conclusion: "極度看多", badge: "strong-buy", reason: "Q1 單季 EPS 達 22.08 元創歷史新高. 先進製程 (3nm/5nm) 產能爆滿，CoWoS 先進封裝供不應求，市場上修 2026 全年獲利預估。" },
            { area: "籌碼面", conclusion: "看多", badge: "strong-buy", reason: "外資與主被動基金長線持續加碼，千張大戶持股比例維持極高水位，散戶融資無失控跡象。" },
            { area: "總經面", conclusion: "看多", badge: "strong-buy", reason: "全球 AI 算力軍備競賽加劇，輝達 Blackwell 及 Rubin 晶片代工唯一首選，為 AI 時代最大受惠者。" },
            { area: "公司資訊", conclusion: "強力看多", badge: "strong-buy", reason: "實收股本達 2593.2 億元，董事長魏哲家帶領團隊全球擴廠，定價權極強，擁有無法被超越的半導體霸權。" },
            { area: "分點面", conclusion: "強力看多", badge: "strong-buy", reason: "外資主力分點高盛與美商美林近20日合計鎖碼逾6萬張，買超力道無衰退跡象，籌碼極度安定。" }
        ],
        pros: [
            "<span class='highlight-bold'>先進製程絕對壟斷</span>：在 3 奈米及未來 2 奈米技術上維持 90% 以上市占率，定價權極強，客戶排隊加價爭奪產能，利潤率將維持高檔。",
            "<span class='highlight-bold'>AI 產業唯一的「賣水人」</span>：不論是輝達、超微、微軟、谷歌還是亞馬遜的晶片，都必須在台積電代工，具備無與倫比的防禦性與護城河。",
            "<span class='highlight-bold'>財務結構極度健康</span>：單季賺取逾兩百億美元利潤，自由現金流充沛，季配息持續提升（本次除息 6 元），提供良好下檔保護。"
        ],
        cons: [
            "<span class='highlight-bold'>地緣政治風險溢價</span>：台海局勢與全球產能分散壓力（美德日建廠），使得資本支出與折舊成本上升，短期可能對毛利率有微幅壓抑。",
            "<span class='highlight-bold'>電力與水資源供應瓶頸</span>：國內先進製程擴廠（寶山、高雄）帶來的用電與用水龐大需求，中長期須面對台灣本土基礎設施的供給考驗。"
        ],
        debateLogs: [
            { sender: "技術專家", area: "tech", content: "台積電衝過 2400 元大關後，日線稍微與月線有些正乖離，KD 雖然在超買區但沒有背離，這是極強的軋空走勢。按短線防禦操作仍須謹慎。" },
            { sender: "基本面專家", area: "fund", content: "第一季 EPS 22.08 元已經證明了實力。現在客戶連先進封裝 CoWoS 的產能都在搶，甚至同意台積電調漲代工價格。這代表毛利率下半年將挑戰 55% 以上，這能支撐 2400 元以上的股價。" },
            { sender: "公司專家", area: "company", content: "公司資訊看來，台積電股本達 2593 億元，市值全球前十。目董魏哲家掌舵，全球布局策略明確。雖然海外設廠成本高昂，但台積電能對海外代工定更高價格，且 3nm 產能被蘋果與輝達完全包下，基本面護城河沒有任何鬆動。" },
            { sender: "分點專家", area: "branch", content: "台積電在突破 2300 元過程中，美商高盛與台灣摩根士丹利分點累計大買逾 6 萬張，均價非常接近現價，且籌碼持續沉澱，無高檔出貨跡象。" },
            { sender: "總經專家", area: "macro", content: "同意基本面極佳。但要注意美國大選以及各國要求台積電到當地設廠的補貼限制。美國建廠成本是台灣的數倍，折舊會在 2026 年底開始陸續反映，這是否會侵蝕未來毛利率？" },
            { sender: "基本面專家", area: "fund", content: "海外建廠成本雖然高，但台積電採用『彈性定價策略』，海外生產的晶片會向客戶收取更高價格以維持毛利率。而且台灣本土先進製程產能仍佔八成以上，影響可控。" },
            { sender: "籌碼專家", area: "chip", content: "籌碼面來看，全球主動型科技基金與 ETF 幾乎是『被迫』必須配置台積電。只要外資資金因降息循環持續流入亞洲，台積電就是首要受益者，籌碼面完全支撐股價。" }
        ]
    },
        "2454": {
        symbol: "2454",
        name: "聯發科",
        time: "2026-06-02",
        rating: "偏多佈局",
        badge: "buy",
        suggestion: "聯發科在 4500 元上下強勢震盪。空手投資人應等待股價回測 20MA (約 4480 元) 或月線附近分批承接。由於 Edge AI 需求明確，中長線有望挑戰 5000 元整數關卡，操作上建議以現股分批布局為主。",
        stoploss: "以近期的防守均線或支撐位 4350 元為警戒線，若收盤跌破且三日不站回則減碼防守。",
        
        // Detailed Dimensions Data
        klineData: generateHistoricalKLine(4500, 30, "up"),
        fundamentalData: {
            eps: "70.50",
            roe: "22.8",
            nav: "310.5",
            yield: "4.8",
            quarters: ["25Q2", "25Q3", "25Q4", "26Q1"],
            gross: [48.5, 49.2, 48.9, 50.1],
            op: [21.5, 22.4, 21.8, 23.2],
            net: [18.2, 19.1, 18.5, 19.8]
        },
        chipData: [
            { subject: "外資", d5: 8400, d10: 12500, d20: 28400, d60: 45200, d240: 98100 },
            { subject: "投信", d5: 4120, d10: 8900, d20: 15400, d60: 28400, d240: 52100 },
            { subject: "自營商", d5: 1200, d10: 2500, d20: 4500, d60: 8900, d240: 15400 },
            { subject: "八大公股行庫", d5: -2100, d10: -4500, d20: -9800, d60: -15400, d240: -32000 },
            { subject: "美商高盛 (主力分點)", d5: 4500, d10: 8200, d20: 15400, d60: 28100, d240: 54100 },
            { subject: "台灣摩根士丹利 (主力分點)", d5: 3500, d10: 6200, d20: 12100, d60: 22000, d240: 41500 }
        ],
        branchData: generateMockBranchData("2454", "聯發科", 4525.0, 1),
        macroData: {
            indicators: [
                { label: "美國 5 月 CPI", value: "3.1%", change: "持平", trend: "neutral", desc: "宏觀通膨穩定，有利於高估值IC設計股之重估。" },
                { label: "台灣景氣對策燈號", value: "39 分", change: "紅燈", trend: "up", desc: "電子產品出口旺盛拉動半導體供應鏈營運。" },
                { label: "美元兌台幣匯率", value: "31.95", change: "-0.2%", trend: "down", desc: "台幣偏強，顯示外資對台股權值股有強烈配置興趣。" },
                { label: "費城半導體指數", value: "5,310", change: "+1.2%", trend: "up", desc: "半導體板塊強勢，提供聯發科良好外部大環境氛圍。" }
            ],
            news: [
                { title: "聯發科與 NVIDIA 聯手開發 AI PC 晶片！預計 2026 下半年問世", source: "時報資訊", url: "https://news.cnyes.com/news/id/5592454", summary: "雙方深化合作，開發 ARM 架構之 Windows AI PC 處理器，挑戰高通與英特爾的壟斷地位。" },
                { title: "天璣 9400 採用台積電 3nm！邊緣 AI 晶片拉貨動能強勢", source: "工商時報", url: "https://tw.stock.yahoo.com/news/mediatek-dimensity-tsmc-3nm-12345.html", summary: "新一代晶片效能大增且功耗降低，已獲多家陸系品牌旗艦機大額預定，帶動下半年出貨增溫。" }
            ]
        },
        companyData: {
            capital: "159.9 億元",
            chairman: "蔡明介",
            business: "無線通訊、多媒體與消費性電子客製化晶片 (ASIC) 設計與研發。",
            history: "聯發科技股份有限公司創立於 1997 年，原為聯華電子旗下的 IC 設計部門，在董事長蔡明介先生帶領下獨立。公司以光碟機晶片起家，隨後在 2G/3G/4G 手機時代成功突圍，目前發展為全球第二大無晶圓廠 (Fabless) 手機晶片設計大廠，並大舉切入車用電子、智慧家庭以及高階 AI 伺服器 ASIC 領域。",
            newsAnalysis: [
                {
                    title: "聯發科與 NVIDIA 在汽車與 AI PC 領域深化合作，目標價喊上 5000 元",
                    source: "高盛證券",
                    url: "https://news.cnyes.com/news/id/5590920",
                    ai_analysis: "蔡明介董事長帶領的聯發科，股本僅 159.9 億元，卻有強大的 IP 庫及手機晶片壟斷權。目前與 NVIDIA 合作開發 ARM PC 處理器及車用 SoC 晶片已逐步成形，這對估值倍數的提升極為有利，將使其跳脫傳統手機晶片股的框架。",
                    ai_suggestion: "ASIC 與 ARM PC 為公司重估值的最大催化劑，高盛喊出 5000 元目標價合情合理。建議中長期資金在 4450-4520 區間建立中線倉位。"
                }
            ]
        }
    },
    "2382": {
        symbol: "2382",
        name: "廣達",
        time: "2026-06-02",
        rating: "偏多佈局",
        badge: "buy",
        suggestion: "廣達 6/2 強勢漲停收在 409.5 元，衝破波段整理區間。空手投資人應等待股價回測 5MA (約 380 - 388 元) 或帶量突破點 (約 375 元) 時分批承接。由於短線波動劇烈，建議以現股波段操作為主，不宜过度槓桿。",
        stoploss: "以 6/2 漲停長紅K棒的起漲點 372.5 元作為防守點，若跌破且三日內未能重新站回，應執行停損。",
        
        // Detailed Dimensions Data
        klineData: generateHistoricalKLine(350, 30, "up"),
        fundamentalData: {
            eps: "5.12",
            roe: "19.5",
            nav: "88.2",
            yield: "4.5",
            quarters: ["25Q2", "25Q3", "25Q4", "26Q1"],
            gross: [8.12, 8.35, 8.52, 9.15],
            op: [4.15, 4.42, 4.35, 5.02],
            net: [3.20, 3.45, 3.32, 3.98]
        },
        chipData: [
            { subject: "外資", d5: 35400, d10: -5400, d20: 24100, d60: 74200, d240: 154000 },
            { subject: "投信", d5: 18200, d10: 29400, d20: 41500, d60: 68100, d240: 120500 },
            { subject: "自營商", d5: 4120, d10: 3100, d20: 8900, d60: 15400, d240: 28400 },
            { subject: "八大公股行庫", d5: -8400, d10: -14200, d20: -18900, d60: -36000, d240: -84200 },
            { subject: "美商高盛 (主力分點)", d5: 12500, d10: -2100, d20: 8900, d60: 28100, d240: 54100 },
            { subject: "富邦台北 (地緣券商)", d5: 8400, d10: 14100, d20: 22000, d60: 39500, d240: 81200 }
        ],
        branchData: generateMockBranchData("2382", "廣達", 409.5, 1),
        macroData: {
            indicators: [
                { label: "美國 5 月 CPI", value: "3.1%", change: "持平", trend: "neutral", desc: "通膨走穩，有利於北美 CSP 廠（微軟、Meta）維持高額資本支出。" },
                { label: "台灣景氣對策燈號", value: "39 分", change: "紅燈", trend: "up", desc: "資通訊產品出口熱絡是本次紅燈核心動能。" },
                { label: "美債 10 年期殖利率", value: "4.15%", change: "-0.08%", trend: "down", desc: "債息回落，利好高本益比成長股估值重估。" },
                { label: "NVIDIA 收盤價", value: "$1,120", change: "+4.2%", trend: "up", desc: "在台北國際電腦展前股價維持極強軋空行情。" }
            ],
            news: [
                { title: "廣達 4 月營收 3,399 億年增 120.7%！AI 伺服器進入瘋狂出貨期", source: "工商時報", url: "https://news.cnyes.com/news/id/5592382", summary: "受惠於微軟與亞馬遜 AI 伺服器專案放量，廣達單月營收呈現爆發式倍增，訂單能見度已達 2026 年底。" },
                { title: "黃仁勳台北演講力挺台灣供應鏈，廣達 6/2 強鎖漲停創 27 年新高", source: "中央社", url: "https://tw.stock.yahoo.com/news/quanta-stock-limit-up-nv-cooperation-07401.html", summary: "輝達創辦人高調宣布與廣達深入合作下一代 Rubin 平台，吸引市場資金工作流湧入，股價亮燈鎖死。" }
            ]
        },

        // Role 5: Company Info Analyst data
        companyData: {
            capital: "386.3 億元",
            chairman: "林百里",
            business: "AI 伺服器、雲端運算系統解決方案、車用電子、高階筆記型電腦設計與製造。",
            history: "廣達電腦股份有限公司由林百里先生與梁次震先生創立於 1988 年，起初專注於筆記型電腦的 OEM/ODM 代工。自 2000 年起，廣達領先業界轉型至雲端資料中心伺服器設計製造，目前已成為全球一線 CSP 廠（Meta、Google、微軟、亞馬遜）整機櫃伺服器設計與代工大廠。",
            newsAnalysis: [
                {
                    title: "廣達受惠微軟與亞馬遜大舉追加 GB200 訂單，產能排至 2026 年底",
                    source: "時報財經",
                    url: "https://news.cnyes.com/news/id/5592382",
                    ai_analysis: "廣達做為雲端伺服器龍頭，在 NVIDIA GB200 機櫃的組裝良率及散熱整合能力具備領先優勢，微軟大單追加將大幅推升下半年及明年的營收與獲利，獲利能力明顯上修。",
                    ai_suggestion: "這將強力支撐廣達估值回歸同業水準。建議操作上可於回測 5MA (約 380 - 388 元) 附近分批買進，停損守 372 元。"
                }
            ]
        }
    }
};

// 5. Dynamic Generator for Custom Symbols
function generateMockReport(symbol, name) {
    const symNum = parseInt(symbol) || 2303;
    const validName = name || `個股`;
    const type = symNum % 3;
    
    let rating, badge, suggestion, stoploss, expertViews, pros, cons, debateLogs;

    const basePrice = (symNum % 700) + 50; 
    const currentPrice = basePrice.toFixed(1);
    const stoplossPrice = (basePrice * 0.9).toFixed(1);
    const targetPrice = (basePrice * 1.25).toFixed(1);

    // Dynamic calculations for detail charts
    const mockKLine = generateHistoricalKLine(basePrice, 30, type === 0 ? "up" : (type === 1 ? "up" : "down"));
    const mockFinance = {
        eps: (basePrice * 0.04).toFixed(2),
        roe: (12 + (symNum % 15)).toFixed(1),
        nav: (basePrice * 0.4).toFixed(1),
        yield: (2.5 + (symNum % 5) * 0.5).toFixed(1),
        quarters: ["25Q2", "25Q3", "25Q4", "26Q1"],
        gross: [32.5 + (symNum % 10), 31.8 + (symNum % 10), 33.2 + (symNum % 10), 34.5 + (symNum % 10)],
        op: [12.5 + (symNum % 5), 11.8 + (symNum % 5), 12.2 + (symNum % 5), 13.9 + (symNum % 5)],
        net: [9.5 + (symNum % 4), 8.8 + (symNum % 4), 9.2 + (symNum % 4), 10.5 + (symNum % 4)]
    };

    const factor = type === 0 ? 1.5 : (type === 1 ? 0.8 : -0.7);
    const mockChip = [
        { subject: "外資", d5: Math.floor(4500 * factor), d10: Math.floor(8200 * factor), d20: Math.floor(12000 * factor), d60: Math.floor(25000 * factor), d240: Math.floor(58000 * factor) },
        { subject: "投信", d5: Math.floor(1200 * factor), d10: Math.floor(2500 * factor), d20: Math.floor(5400 * factor), d60: Math.floor(12000 * factor), d240: Math.floor(28000 * factor) },
        { subject: "自營商", d5: Math.floor(600 * factor), d10: Math.floor(800 * factor), d20: Math.floor(1500 * factor), d60: Math.floor(3200 * factor), d240: Math.floor(8900 * factor) },
        { subject: "八大公股行庫", d5: Math.floor(-1500 * factor), d10: Math.floor(-3200 * factor), d20: Math.floor(-6800 * factor), d60: Math.floor(-15000 * factor), d240: Math.floor(-35000 * factor) },
        { subject: "主力指標分點 A", d5: Math.floor(2200 * factor), d10: Math.floor(3500 * factor), d20: Math.floor(5100 * factor), d60: Math.floor(9800 * factor), d240: Math.floor(18000 * factor) }
    ];

    const mockMacro = {
        indicators: [
            { label: "美國 5 月 CPI", value: "3.1%", change: "持平", trend: "neutral", desc: "宏觀通膨形勢走穩，無系統性風險。" },
            { label: "台灣景氣對策燈號", value: "39 分", change: "紅燈", trend: "up", desc: "連續 5 紅顯示產業鏈總量需求在擴張週期。" },
            { label: "美債 10 年期殖利率", value: "4.15%", change: "-0.08%", trend: "down", desc: "美債殖利率偏弱，成長股資金環境充裕。" },
            { label: "台股加權指數", value: "22,150", change: "+0.8%", trend: "up", desc: "大盤多頭延續，支撐個股多頭行情。" }
        ],
        news: [
            { title: `${symbol} 最新研發專利通過，外資對其未來展望持樂觀態度`, source: "時報資訊", url: `https://news.cnyes.com/news/id/${2200000 + (symNum * 123) % 900000}`, summary: "報導指出，公司在新研發項目進展順利，產能利用率高檔，預估下半年出貨量穩步墊高。" },
            { title: `全球算力相關鏈需求外溢，${symbol} 客戶拉貨能見度擴大`, source: "理財網", url: `https://tw.stock.yahoo.com/news/${(symNum * 456) % 1000000}.html`, summary: "受益於全球算力基礎設施建置以及邊緣運算晶片商追加需求，相關供應鏈皆呈現高景氣度。" }
        ]
    };

    // Role 5 Mock Data
    const mockChairman = ["李憲華", "王國泰", "陳重光", "張安德"][symNum % 4];
    const mockCapital = (50 + (symNum % 250)).toFixed(1) + " 億元";
    const mockBusiness = type === 0 ? "半導體先進製程與高速算力客製化晶片 (ASIC) 製造。" : (type === 1 ? "精密電子光學元件、通訊高頻天線及高階連接器研發。" : "綠能發電電網建置、智能工業重電與儲能控管系統。");
    const mockHistory = `${validName} 成立於 ${1990 + (symNum % 25)} 年，創辦團隊早期專注於傳統工業及零組件代工，奠定了深厚的精密製造與工藝基礎。隨著產業轉型，公司近年切入 ${mockBusiness.replace("製造。", "")}，以極具前瞻性的專利布局與卓越的製造良率，在全球相關供應鏈中取得了不可忽視的地位。`;
    const mockCompanyData = {
        capital: mockCapital,
        chairman: mockChairman,
        business: mockBusiness,
        history: mockHistory,
        newsAnalysis: [
            {
                title: `${symbol} 客戶追加訂單，產能利用率攀升，外資評定具備產業領先優勢`,
                source: "時報財經",
                url: `https://news.cnyes.com/news/id/${2300000 + (symNum * 123) % 900000}`,
                ai_analysis: `最新一季毛利率呈現良性反彈，主要係因生產效率改善以及高單價之「${mockBusiness.substring(0, 5)}」產品出貨比重拉升。公司持續優化產線，預期未來獲利能力將進一步墊高。`,
                ai_suggestion: `這對長期評價重估具有利多支撐。建議操作上可採分批承接策略，拉回至月均線支撐附近偏多布局，防守價設在 ${stoplossPrice} 元。`
            },
            {
                title: `${symbol} 宣佈大舉投資資本支出，擴充自動化產線卡位算力鏈外溢機會`,
                source: "工商時報",
                url: `https://tw.stock.yahoo.com/news/${(symNum * 789) % 1000000}.html`,
                ai_analysis: `公司積極拓展「邊緣 AI 與綠色基建」相關商機，本次大舉擴產將縮短客戶新產品的前置開發期，在下一代大客戶晶片釋出時，能迅速占得首批供應商份額。`,
                ai_suggestion: `自動化擴產為長線基本面轉型必經之路，雖短期折舊略微壓抑利潤，但中長期獲利將翻倍，對長線持股者為強力信心催化劑。`
            }
        ]
    };

    const mockBranch = generateMockBranchData(symbol, validName, basePrice, type);

    if (type === 0) { 
        rating = "強力買進";
        badge = "strong-buy";
        suggestion = `該股目前技術面呈現強勢突破，均線呈多頭排列，基本面有新產能放量與大訂單挹注。建議在現階段（${currentPrice} 元附近）或回測 5MA 時分批買進，中線目標價上看 ${targetPrice} 元。`;
        stoploss = `明確守住波段起漲點或跳空缺口支撐價位 ${stoplossPrice} 元，若跌破且三日不站回則果斷出場。`;
        
        expertViews = [
            { area: "技術面", conclusion: "多方趨勢，突破整理", badge: "strong-buy", reason: "股價放量衝破整理區間，均線呈完美多頭排列，技術指標強勢發散。" },
            { area: "基本面", conclusion: "看多", badge: "buy", reason: "季度營收 YoY 雙位數成長，獲利三率雙升，新產品市占率攀升。" },
            { area: "籌碼面", conclusion: "看多", badge: "strong-buy", reason: "外資與投信聯手持續買超，千張大戶持股比率創近期新高，籌碼高度集中。" },
            { area: "總經面", conclusion: "偏多", badge: "buy", reason: "所屬產業處於復甦擴張期，全球供應鏈去庫存結束，迎來強勁補庫存需求。" },
            { area: "公司資訊", conclusion: "看多", badge: "buy", reason: `實收股本為 ${mockCapital}，由 ${mockChairman} 董事長帶領。切入核心業務「${mockBusiness.substring(0, 10)}」，市場前景極佳。` }
        ];

        pros = [
            `<span class='highlight-bold'>法人聯手卡位</span>：籌碼顯示三大法人特別是外資與投信有連續性買超，籌碼集中度大增，有利於股價穩步推升。`,
            `<span class='highlight-bold'>基本面顯著好轉</span>：受惠於產業週期性復甦及核心客戶訂單增加，預期下半年單季營收與獲利將創下歷史佳績。`
        ];

        cons = [
            `<span class='highlight-bold'>短線正乖離偏大</span>：短線股價漲幅較大，與月線乖離增加，須提防短線獲利回吐壓力產生的震盪。`
        ];

        debateLogs = [
            { sender: "技術專家", area: "tech", content: `${symbol} 股價帶量突破先前盤整區，均線糾結後向上發散，短線動能極強。` },
            { sender: "籌碼專家", area: "chip", content: "沒錯，觀察主力分點，近期有特定外資大戶在囤貨，散戶融資反而減少，這是極佳的籌碼沉澱特徵。" },
            { sender: "公司專家", area: "company", content: `我調查了這家公司背景，其實實收股本達 ${mockCapital} 且創立已久，董事長 ${mockChairman} 在業界口碑很好。近期他們的新專利與自動化擴產新聞，顯示正在大舉轉型高毛利的「${mockBusiness.substring(0, 10)}」業務，前景大好。` },
            { sender: "基本面專家", area: "fund", content: "基本面也給出支撐，最新一季毛利率季增明顯，主要是高毛利產品出貨占比提升。隨著新產能開出，獲利成長可期。" },
            { sender: "總經專家", area: "macro", content: "所屬產業目前完全跟隨景氣回溫的風向，美元震盪走弱也利於外資資金回流台股，該股將是主要資金避風港。" }
        ];
    } else if (type === 1) { 
        rating = "偏多佈局";
        badge = "buy";
        suggestion = `目前股價處於中長期均線（如 60MA）附近的支撐區，基本面持穩，下檔風險有限。建議採取「回測不破分批承接」策略，於 ${currentPrice} 元以下分批布局，耐心等待催化劑出現。`;
        stoploss = `以波段低點支撐價位 ${stoplossPrice} 元為防守依據，若有效跌破則執行減碼防守。`;
        
        expertViews = [
            { area: "技術面", conclusion: "偏多，支撐區整理", badge: "buy", reason: "股價回測重要均線支撐守穩，指標處於低檔黃金交叉，蓄勢反彈。" },
            { area: "基本面", conclusion: "中立偏多", badge: "neutral", reason: "營運穩健，雖然高成長爆發力稍緩，但估值（本益比）處於歷史偏低水位。" },
            { area: "籌碼面", conclusion: "看多", badge: "buy", reason: "投信法人逢低吸納認養，千張大戶持股持平，無大量拋售跡象。" },
            { area: "總經面", conclusion: "中立", badge: "neutral", reason: "產業景氣溫和復甦，無重大利空，但需防範全球總體需求回溫速度不如預期的風險。" },
            { area: "公司資訊", conclusion: "中立", badge: "neutral", reason: `股本為 ${mockCapital}。歷史發展穩健，但主力轉型「${mockBusiness.substring(0, 8)}」的貢獻速度較溫和，適合中長線持有。` }
        ];

        pros = [
            `<span class='highlight-bold'>估值具備安全邊際</span>：目前本益比及股價淨值比均處於歷史低檔區間，下檔空間有限，適合穩健型資金做中長線分批布局。`,
            `<span class='highlight-bold'>投信逢低認養</span>：內資投信在近期拉回過程中呈現買超，顯示法人對其長期基本價值認同，具備抗跌屬性。`
        ];

        cons = [
            `<span class='highlight-bold'>營收動能溫和</span>：短期內缺乏強力的成長催化劑，股價可能以緩步墊高或區間震盪為主，需要較長的時間成本。`,
            `<span class='highlight-bold'>市場關注度偏低</span>：目前資金集中在AI主流股，該股屬於基期較低的價值股，需要等待資金輪動機會。`
        ];

        debateLogs = [
            { sender: "技術專家", area: "tech", content: `${symbol} 股價近期回檔至月線與季線支撐，量能壓縮，顯示賣壓已經逐步竭盡，有打底完成跡象。` },
            { sender: "基本面專家", area: "fund", content: "同意。雖然目前月營收年增率僅個位數，但本益比已經調整到歷史下緣，提供了極佳的安全邊際。" },
            { sender: "公司專家", area: "company", content: `這間公司股本 ${mockCapital}，創立至今經營團隊極其穩健，蔡明介式的穩紮穩打風格。董事長 ${mockChairman} 近期加強在「${mockBusiness.substring(0, 10)}」的自動化佈局，新聞解讀與操作建議也認為中長線自動化會帶來毛利提升，這會提供良好的下檔保護。` },
            { sender: "籌碼專家", area: "chip", content: "籌碼面看到投信近期在默默低接，似乎是為了下半年的行情提前卡位，雖然外資沒有太大動作，但籌碼仍在良性換手。" },
            { sender: "總經專家", area: "macro", content: "全球總經雖然平穩，但資金主要追逐高成長科技股。該股短期可能會因關注度不夠而盤整，操作上要有耐心，分批承接為宜。" }
        ];
    } else { 
        rating = "觀望偏中立";
        badge = "neutral";
        suggestion = `由於股價近期面臨前波套牢壓力區，且基本面營收暫無突破性表現，建議暫時在 ${currentPrice} 元附近觀望，等待股價放量突破上檔壓力，或回測下方關鍵均線支撐時再行考慮。`;
        stoploss = `若已持股者，以短期支撐 ${stoplossPrice} 元為警戒線，一旦帶量跌破應考慮降低水位防範回檔。`;
        
        expertViews = [
            { area: "技術面", conclusion: "盤整期，上有壓力", badge: "neutral", reason: "股價處於區間震盪，上檔面臨均線套牢壓力，量能未見有效放大。" },
            { area: "基本面", conclusion: "中立", badge: "neutral", reason: "營收表現持平，毛利率維持穩定但無明顯改善，轉型效果仍待觀察。" },
            { area: "籌碼面", conclusion: "中立偏空", badge: "sell", reason: "法人買賣超無連續性，散戶融資維持高檔，籌碼略顯渙散。" },
            { area: "總經面", conclusion: "中立", badge: "neutral", reason: "所屬產業景氣循環處於停滯期，市場需求持平，缺乏大環境順風的帶動。" },
            { area: "公司資訊", conclusion: "中立", badge: "neutral", reason: `股本規模達 ${mockCapital}。近期業務面面臨重組調整期，新聞分析顯示仍需等待具體進展。` }
        ];

        pros = [
            `<span class='highlight-bold'>財務結構穩定</span>：公司負債比率低，自由現金流充沛，具備每年穩定配發股利的能力，股殖利率可提供一定支撐。`
        ],
        cons = [
            `<span class='highlight-bold'>籌碼結構渙散</span>：融資在高檔未退，法人買盤斷斷續續，缺乏法人連續鎖碼，股價突破壓力區的難度較高。`,
            `<span class='highlight-bold'>缺乏成長動能</span>：主營業務市場飽和，新產品研發尚未貢獻營收，缺乏獲利爆發力，估值重估動能不足。`
        ];

        debateLogs = [
            { sender: "技術專家", area: "tech", content: `${symbol} 股價目前在區間震盪，每次反彈到季線附近就遇到賣壓，均線呈現糾結且下彎，短線缺乏方向。` },
            { sender: "籌碼專家", area: "chip", content: "對，三大法人近期交互買賣超，沒有定性。且融資餘額在高檔卡著，說明套牢散戶不少，拉高容易引來解套賣壓。" },
            { sender: "公司專家", area: "company", content: `該公司目前股本規模有 ${mockCapital}，但主要獲利的業務依然是舊有代工，董事長 ${mockChairman} 雖試圖切入新技術，但目前新聞分析與建議都指出新專利轉化為營收的時程仍有不確定性，整體發展處於陣痛期。` },
            { sender: "基本面專家", area: "fund", content: "基本面營收年增率一直在零軸附近徘徊，毛利率也持平。我們需要看到新業務或者大客戶訂單的實質回溫，否則現在談高成長言之過早。" },
            { sender: "總經專家", area: "macro", content: "外部環境對於這個產業沒有明顯的拉動作用，目前既不順風也不逆風，就是跟隨大盤震盪。同意大家看法，暫時保持中立觀望。" }
        ];
    }

    return {
        symbol,
        name: validName,
        time: "2026-06-02",
        rating,
        badge,
        suggestion,
        stoploss,
        expertViews,
        pros,
        cons,
        debateLogs,
        
        // Modal sub data
        klineData: mockKLine,
        fundamentalData: mockFinance,
        chipData: mockChip,
        macroData: mockMacro,
        companyData: mockCompanyData,
        branchData: mockBranch
    };
}

// 6. Application State & Orchestrator
let currentAnalysisData = null;
let timerInterval = null;

document.addEventListener("DOMContentLoaded", () => {
    const stockInput = document.getElementById("stock-input");
    const analyzeBtn = document.getElementById("analyze-btn");
    const quickChips = document.querySelectorAll(".quick-chip");
    const exportBtn = document.getElementById("export-btn");
    
    const detailModal = document.getElementById("detail-modal");
    const modalCloseBtn = document.getElementById("modal-close-btn");
    const appLogo = document.getElementById("app-logo");

    // Click handler for Search/Analyze button
    analyzeBtn.addEventListener("click", () => {
        const query = stockInput.value.trim();
        if (query) runPipeline(query);
    });

    // Enter key handler for input
    stockInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            const query = stockInput.value.trim();
            if (query) runPipeline(query);
        }
    });

    // Handlers for Quick Chips
    quickChips.forEach(chip => {
        chip.addEventListener("click", () => {
            const symbol = chip.getAttribute("data-symbol");
            stockInput.value = symbol;
            runPipeline(symbol);
        });
    });

    // Handler for Export to Excel button
    exportBtn.addEventListener("click", () => {
        if (currentAnalysisData) {
            exportToExcel(currentAnalysisData);
        }
    });

    // Modal Close handlers
    modalCloseBtn.addEventListener("click", closeModal);
    detailModal.addEventListener("click", (e) => {
        if (e.target === detailModal) closeModal();
    });

    // Handlers for Branch Modal Tabs
    const branchTabBtns = document.querySelectorAll(".branch-tab-btn");
    branchTabBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            branchTabBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            const days = parseInt(btn.getAttribute("data-days"));
            renderBranchModalData(days);
        });
    });

    // ESC key closes Modal
    window.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && !detailModal.classList.contains("hidden")) {
            closeModal();
        }
    });

    // Logo click to reset to home state
    appLogo.addEventListener("click", () => {
        resetToHome();
    });

    // Initial load: render recommendations
    renderRecommendations();
});

// 7. Render Top 10 Buy/Sell Panels on Home Load
function renderRecommendations() {
    const buyBody = document.getElementById("buy-rec-body");
    const sellBody = document.getElementById("sell-rec-body");

    // Populate Buy Table
    buyBody.innerHTML = "";
    buyRecommendations.forEach(item => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td style="font-family: var(--font-mono);">${item.symbol}</td>
            <td><span class="clickable-stock" data-symbol="${item.symbol}">${item.name}</span></td>
            <td style="font-family: var(--font-mono);">${item.price}</td>
            <td class="val-buy" style="font-family: var(--font-mono);">${item.change}</td>
            <td><span class="badge ${item.badge}">${item.rating}</span></td>
        `;
        buyBody.appendChild(tr);
    });

    // Populate Sell Table
    sellBody.innerHTML = "";
    sellRecommendations.forEach(item => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td style="font-family: var(--font-mono);">${item.symbol}</td>
            <td><span class="clickable-stock" data-symbol="${item.symbol}">${item.name}</span></td>
            <td style="font-family: var(--font-mono);">${item.price}</td>
            <td class="val-sell" style="font-family: var(--font-mono);">${item.change}</td>
            <td><span class="badge ${item.badge}">${item.rating}</span></td>
        `;
        sellBody.appendChild(tr);
    });

    // Bind click events on clickable stock names
    document.querySelectorAll(".clickable-stock").forEach(el => {
        el.addEventListener("click", () => {
            const symbol = el.getAttribute("data-symbol");
            const stockInput = document.getElementById("stock-input");
            stockInput.value = symbol;
            runPipeline(symbol);
        });
    });
}

// Reset view back to Home State
function resetToHome() {
    const stockInput = document.getElementById("stock-input");
    const agentStage = document.getElementById("agent-stage");
    const reportSection = document.getElementById("report-section");
    const recPanel = document.getElementById("recommendation-panel");

    // Clear input
    stockInput.value = "";
    
    // Hide analysis & report
    agentStage.classList.add("hidden");
    reportSection.classList.add("hidden");
    
    // Show home recommendations
    recPanel.classList.remove("hidden");
    recPanel.scrollIntoView({ behavior: "smooth" });
    
    currentAnalysisData = null;
    if (timerInterval) clearInterval(timerInterval);
}

// 8. Run the Multi-Agent Pipeline
function runPipeline(query) {
    let symbol = query.replace(/[^\w\u4e00-\u9fa5]/g, ""); 
    let name = "";
    let resolvedData = null;
    
    for (const key in stockDB) {
        if (key === symbol || stockDB[key].name === symbol || (symbol.includes(key) && symbol.includes(stockDB[key].name))) {
            resolvedData = stockDB[key];
            symbol = resolvedData.symbol;
            name = resolvedData.name;
            break;
        }
    }

    if (!resolvedData) {
        if (commonStockNames[symbol]) {
            name = commonStockNames[symbol];
        } else {
            const parts = query.split(/\s+/);
            if (parts.length >= 2) {
                symbol = parts[0];
                name = parts[1];
            } else {
                if (/^\d+$/.test(symbol)) {
                    name = "個股";
                } else {
                    name = symbol;
                    symbol = "自訂股";
                }
            }
        }
        resolvedData = generateMockReport(symbol, name);
    }

    currentAnalysisData = resolvedData;

    const agentStage = document.getElementById("agent-stage");
    const reportSection = document.getElementById("report-section");
    const debateFlow = document.getElementById("debate-flow");
    const timerDisplay = document.getElementById("stage-timer");
    const recPanel = document.getElementById("recommendation-panel");

    // Hide Home Panel & Report, show stage
    recPanel.classList.add("hidden");
    reportSection.classList.add("hidden");
    agentStage.classList.remove("hidden");
    
    debateFlow.innerHTML = '<div class="debate-placeholder">準備啟動代理人工作流...</div>';
    
    const agents = ["agent-tech", "agent-fund", "agent-chip", "agent-macro", "agent-company"];
    agents.forEach(id => {
        const node = document.getElementById(id);
        node.classList.remove("active");
        node.querySelector(".status-indicator").textContent = "待命中...";
        node.querySelector(".progress-bar").style.width = "0%";
    });

    let startTime = Date.now();
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        timerDisplay.textContent = `${elapsed.toFixed(2)}s`;
    }, 10);

    agentStage.scrollIntoView({ behavior: "smooth" });

    // Step-by-step 5 Agent loading simulation
    setTimeout(() => {
        activateAgent("agent-tech", "獨立研究中...", 100);
        appendDebateMessage("system", "核心秘書", `「台股 AI 分析團隊」已受理 ${resolvedData.symbol} ${resolvedData.name} 的分析請求，獨立研究啟動。`);
        setTimeout(() => {
            appendDebateMessage("tech", "技術專家", `已完成價格與量價分析：目前股價為 ${resolvedData.expertViews[0].conclusion === "中立" ? "高檔震盪" : "多頭強勢排列"}，技術指標 ${resolvedData.expertViews[0].conclusion.includes("防") ? "有短線超買訊號" : "尚屬健康"}。`);
        }, 300);
    }, 500);

    setTimeout(() => {
        activateAgent("agent-fund", "獨立研究中...", 100);
        appendDebateMessage("fund", "基本面專家", `已拉取最新季報與月營收數據：Q1 獲利與毛利表現${resolvedData.expertViews[1].conclusion.includes("多") ? "創下佳績" : "平穩穩健"}。本益比估值區間為合理偏低。`);
    }, 1500);

    setTimeout(() => {
        activateAgent("agent-chip", "獨立研究中...", 100);
        appendDebateMessage("chip", "籌碼專家", `正追蹤三大法人主力進出與資券餘額：千張大戶持股比率${resolvedData.expertViews[2].conclusion.includes("多") ? "維持高檔且法人持續認養" : "無顯著波動"}。`);
    }, 2500);

    setTimeout(() => {
        activateAgent("agent-macro", "獨立研究中...", 100);
        appendDebateMessage("macro", "總經專家", `已調閱景氣燈號與產業供需現況：台灣景氣信號亮出熱絡紅燈，全球相關供應鏈景氣循環${resolvedData.expertViews[3].conclusion.includes("多") ? "正處於強勁上升軌道" : "表現中平"}。`);
    }, 3500);

    setTimeout(() => {
        activateAgent("agent-company", "獨立研究中...", 100);
        appendDebateMessage("company", "公司專家", `正拉取公司經營檔案、實收股本與重大新聞解讀：該公司股本為 ${resolvedData.companyData.capital}，經營業務為 ${resolvedData.companyData.business.substring(0, 18)}...`);
    }, 4500);

    // 5 Agent Debate
    setTimeout(() => {
        agents.forEach(id => {
            document.getElementById(id).querySelector(".status-indicator").textContent = "交叉質詢中...";
        });
        appendDebateMessage("system", "核心秘書", `獨立研究完畢，進入【五位專家交叉質詢與共識辯論階段】。`);
        
        setTimeout(() => {
            const log = resolvedData.debateLogs[0];
            appendDebateMessage(log.area, log.sender, log.content);
        }, 300);

        setTimeout(() => {
            const log = resolvedData.debateLogs[1];
            appendDebateMessage(log.area, log.sender, log.content);
        }, 1500);

        setTimeout(() => {
            const log = resolvedData.debateLogs[2];
            appendDebateMessage(log.area, log.sender, log.content);
        }, 2700);

        setTimeout(() => {
            const log = resolvedData.debateLogs[3];
            appendDebateMessage(log.area, log.sender, log.content);
        }, 3900);

        setTimeout(() => {
            const log = resolvedData.debateLogs[4];
            appendDebateMessage(log.area, log.sender, log.content);
        }, 5100);

        if (resolvedData.debateLogs[5]) {
            setTimeout(() => {
                const log = resolvedData.debateLogs[5];
                appendDebateMessage(log.area, log.sender, log.content);
            }, 6200);
        }
    }, 5500);

    // Final Report Generation
    setTimeout(() => {
        clearInterval(timerInterval);
        appendDebateMessage("system", "核心秘書", `達成共識！「台股綜合投資決策報告」產出成功。`);
        
        setTimeout(() => {
            agentStage.classList.add("hidden");
            renderReport(resolvedData);
            reportSection.classList.remove("hidden");
            reportSection.scrollIntoView({ behavior: "smooth" });
        }, 800);
    }, 12500);
}

function activateAgent(agentId, statusText, targetProgress) {
    const node = document.getElementById(agentId);
    node.classList.add("active");
    const indicator = node.querySelector(".status-indicator");
    indicator.textContent = statusText;
    
    const progressBar = node.querySelector(".progress-bar");
    let currentWidth = 0;
    const interval = setInterval(() => {
        if (currentWidth >= targetProgress) {
            clearInterval(interval);
            indicator.textContent = "研究完成 ✓";
        } else {
            currentWidth += 5;
            progressBar.style.width = `${currentWidth}%`;
        }
    }, 40);
}

function appendDebateMessage(senderClass, senderName, content) {
    const debateFlow = document.getElementById("debate-flow");
    const placeholder = debateFlow.querySelector(".debate-placeholder");
    if (placeholder) placeholder.remove();

    const msg = document.createElement("div");
    msg.className = `debate-message ${senderClass}`;
    msg.innerHTML = `
        <span class="msg-sender">${senderName}</span>
        <span class="msg-content">${content}</span>
    `;
    debateFlow.appendChild(msg);
    debateFlow.scrollTop = debateFlow.scrollHeight;
}

// 9. Render Report
function renderReport(data) {
    const displayTitle = data.symbol === "自訂股" ? `${data.name}` : `${data.symbol} ${data.name}`;
    document.getElementById("report-title").textContent = `📈 [${displayTitle}] 綜合分析報告`;
    document.getElementById("report-time").textContent = data.time;

    // Render Table (with Clickable Headers)
    const tableBody = document.getElementById("summary-table-body");
    tableBody.innerHTML = "";
    data.expertViews.forEach(view => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td class="clickable-domain" data-domain="${view.area}" title="點擊查看詳細圖表數據">
                <i class="fa-solid ${getAreaIcon(view.area)}"></i> ${view.area}
            </td>
            <td><span class="badge ${view.badge}">${view.conclusion}</span></td>
            <td style="color: var(--text-secondary); font-size: 0.9rem;">${view.reason}</td>
        `;
        tableBody.appendChild(row);
    });

    // Add click events to table cells
    document.querySelectorAll(".clickable-domain").forEach(td => {
        td.addEventListener("click", () => {
            const domain = td.getAttribute("data-domain");
            openDetailModal(domain);
        });
    });

    // Render Pros List
    const prosList = document.getElementById("pros-list");
    prosList.innerHTML = "";
    data.pros.forEach(pro => {
        const li = document.createElement("li");
        li.innerHTML = pro;
        prosList.appendChild(li);
    });

    // Render Cons List
    const consList = document.getElementById("cons-list");
    consList.innerHTML = "";
    data.cons.forEach(con => {
        const li = document.createElement("li");
        li.innerHTML = con;
        consList.appendChild(li);
    });

    // Render Strategy & Rating
    const ratingBadge = document.getElementById("strategy-rating");
    ratingBadge.textContent = data.rating;
    ratingBadge.className = `rating-badge ${data.badge}`;
    
    document.getElementById("strategy-suggestion").textContent = data.suggestion;
    document.getElementById("strategy-stoploss").textContent = data.stoploss;
}

function getAreaIcon(area) {
    switch (area) {
        case "技術面": return "fa-chart-line";
        case "基本面": return "fa-chart-pie";
        case "籌碼面": return "fa-gem";
        case "總經面": return "fa-globe";
        case "公司資訊": return "fa-building";
        default: return "fa-circle-question";
    }
}

// 10. Modal Controller (Support 5 Experts)
function openDetailModal(domain) {
    const modal = document.getElementById("detail-modal");
    const titleIcon = document.getElementById("modal-title-icon");
    const titleText = document.getElementById("modal-title-text");

    document.querySelectorAll(".modal-sub-content").forEach(el => el.classList.add("hidden"));

    titleIcon.className = "fa-solid " + getAreaIcon(domain);
    const displayTitle = currentAnalysisData.symbol === "自訂股" ? `${currentAnalysisData.name}` : `${currentAnalysisData.symbol} ${currentAnalysisData.name}`;
    titleText.textContent = `${displayTitle} - ${domain}深度分析`;

    modal.classList.remove("hidden");
    document.body.style.overflow = "hidden"; 

    // Render contents based on domain
    if (domain === "技術面") {
        document.getElementById("modal-content-tech").classList.remove("hidden");
        setTimeout(() => {
            const canvas = document.getElementById("kline-canvas");
            drawKLineChart(canvas, currentAnalysisData.klineData);
        }, 50);
    } 
    else if (domain === "基本面") {
        document.getElementById("modal-content-fund").classList.remove("hidden");
        
        const fData = currentAnalysisData.fundamentalData;
        document.getElementById("fund-eps").textContent = `${fData.eps} 元`;
        document.getElementById("fund-roe").textContent = `${fData.roe} %`;
        document.getElementById("fund-nav").textContent = `${fData.nav} 元`;
        document.getElementById("fund-yield").textContent = `${fData.yield} %`;

        setTimeout(() => {
            const canvas = document.getElementById("finance-canvas");
            drawFinanceChart(canvas, fData);
        }, 50);
    } 
    else if (domain === "籌碼面") {
        document.getElementById("modal-content-chip").classList.remove("hidden");
        const tableBody = document.getElementById("chip-table-body");
        tableBody.innerHTML = "";
        
        currentAnalysisData.chipData.forEach(row => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td style="font-weight:700;">${row.subject}</td>
                <td class="${row.d5 >= 0 ? 'val-buy' : 'val-sell'}">${row.d5 >= 0 ? '+' : ''}${row.d5.toLocaleString()}</td>
                <td class="${row.d10 >= 0 ? 'val-buy' : 'val-sell'}">${row.d10 >= 0 ? '+' : ''}${row.d10.toLocaleString()}</td>
                <td class="${row.d20 >= 0 ? 'val-buy' : 'val-sell'}">${row.d20 >= 0 ? '+' : ''}${row.d20.toLocaleString()}</td>
                <td class="${row.d60 >= 0 ? 'val-buy' : 'val-sell'}">${row.d60 >= 0 ? '+' : ''}${row.d60.toLocaleString()}</td>
                <td class="${row.d240 >= 0 ? 'val-buy' : 'val-sell'}">${row.d240 >= 0 ? '+' : ''}${row.d240.toLocaleString()}</td>
            `;
            tableBody.appendChild(tr);
        });
    } 
    else if (domain === "總經面") {
        document.getElementById("modal-content-macro").classList.remove("hidden");
        
        const indicatorsContainer = document.getElementById("macro-indicators");
        indicatorsContainer.innerHTML = "";
        currentAnalysisData.macroData.indicators.forEach(ind => {
            const card = document.createElement("div");
            card.className = "macro-card";
            
            let changeClass = "down";
            if (ind.trend === "up") changeClass = "up";
            else if (ind.trend === "neutral") changeClass = "neutral";

            card.innerHTML = `
                <span class="macro-label">${ind.label}</span>
                <div class="macro-value-wrapper">
                    <span class="macro-value">${ind.value}</span>
                    <span class="macro-change ${changeClass}">${ind.change}</span>
                </div>
                <span class="macro-desc">${ind.desc}</span>
            `;
            indicatorsContainer.appendChild(card);
        });

        // news list with outbound links
        const newsContainer = document.getElementById("macro-news-list");
        newsContainer.innerHTML = "";
        currentAnalysisData.macroData.news.forEach(news => {
            const item = document.createElement("div");
            item.className = "news-item";
            item.innerHTML = `
                <div class="news-meta">
                    <span>${news.source}</span>
                    <span>2026-06-02</span>
                </div>
                <h5 class="news-title">
                    <a href="${news.url}" target="_blank" rel="noopener noreferrer" class="news-link-title" title="點擊在新分頁開啟財經新聞">
                        ${news.title} <i class="fa-solid fa-arrow-up-right-from-square"></i>
                    </a>
                </h5>
                <p class="news-summary">${news.summary}</p>
            `;
            newsContainer.appendChild(item);
        });
    }
    else if (domain === "公司資訊") {
        document.getElementById("modal-content-company").classList.remove("hidden");
        
        const cData = currentAnalysisData.companyData;
        document.getElementById("company-capital").textContent = cData.capital;
        document.getElementById("company-chairman").textContent = cData.chairman;
        document.getElementById("company-business").textContent = cData.business;
        document.getElementById("company-history").textContent = cData.history;

        // news analysis with outbound links
        const newsAnalysisList = document.getElementById("company-news-analysis-list");
        newsAnalysisList.innerHTML = "";
        cData.newsAnalysis.forEach(news => {
            const card = document.createElement("div");
            card.className = "news-analysis-card";
            card.innerHTML = `
                <div class="news-meta">
                    <span>${news.source}</span>
                    <span>2026-06-02</span>
                </div>
                <h5 class="analysis-news-title">
                    <a href="${news.url}" target="_blank" rel="noopener noreferrer" class="news-link-title" title="點擊在新分頁開啟財經新聞">
                        ${news.title} <i class="fa-solid fa-arrow-up-right-from-square"></i>
                    </a>
                </h5>
                <div class="analysis-bubble">
                    <strong><i class="fa-solid fa-robot"></i> AI 專家深度解讀</strong>
                    <span>${news.ai_analysis}</span>
                </div>
                <div class="suggestion-bubble">
                    <strong><i class="fa-solid fa-lightbulb"></i> 投資操作策略建議</strong>
                    <span>${news.ai_suggestion}</span>
                </div>
            `;
            newsAnalysisList.appendChild(card);
        });
    }
    else if (domain === "分點面") {
        document.getElementById("modal-content-branch").classList.remove("hidden");
        
        // Reset tabs active state to 5 days
        const branchTabBtns = document.querySelectorAll(".branch-tab-btn");
        branchTabBtns.forEach(b => b.classList.remove("active"));
        if (branchTabBtns.length > 0) branchTabBtns[0].classList.add("active");
        
        renderBranchModalData(5);
    }
}

function renderBranchModalData(days) {
    const bData = currentAnalysisData.branchData[days];
    if (!bData) return;

    document.getElementById("branch-suggestion-text").textContent = bData.suggestion;

    const buyBody = document.getElementById("branch-buy-tbody");
    const sellBody = document.getElementById("branch-sell-tbody");

    buyBody.innerHTML = "";
    sellBody.innerHTML = "";

    bData.buy.forEach((item, idx) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${idx + 1}</td>
            <td style="font-weight:700;">${item.branch}</td>
            <td class="val-buy">+${item.volume.toLocaleString()}</td>
            <td style="color:var(--text-secondary);">${item.percent}</td>
        `;
        buyBody.appendChild(tr);
    });

    bData.sell.forEach((item, idx) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${idx + 1}</td>
            <td style="font-weight:700;">${item.branch}</td>
            <td class="val-sell">${item.volume.toLocaleString()}</td>
            <td style="color:var(--text-secondary);">${item.percent}</td>
        `;
        sellBody.appendChild(tr);
    });
}

function closeModal() {
    document.getElementById("detail-modal").classList.add("hidden");
    document.body.style.overflow = ""; 
}

// ==========================================================================
// 11. Custom Canvas Drawing Engines (Pure & Beautiful HTML5 Canvas)
// ==========================================================================

// 11.1 Technical K-Line & MAs Drawing Engine
function drawKLineChart(canvas, klineData) {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Background style
    ctx.fillStyle = "#0c0f1c";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const padding = { top: 30, right: 60, bottom: 60, left: 50 };
    const chartWidth = canvas.width - padding.left - padding.right;
    const chartHeight = canvas.height - padding.top - padding.bottom;
    const volumeHeight = chartHeight * 0.22; 
    const priceAreaHeight = chartHeight - volumeHeight - 20;

    let maxPrice = -Infinity;
    let minPrice = Infinity;
    let maxVolume = 0;

    klineData.forEach(day => {
        if (day.high > maxPrice) maxPrice = day.high;
        if (day.low < minPrice) minPrice = day.low;
        const mas = [day.ma5, day.ma20, day.ma60, day.ma100, day.ma240];
        mas.forEach(v => {
            if (v > maxPrice) maxPrice = v;
            if (v < minPrice) minPrice = v;
        });
        if (day.volume > maxVolume) maxVolume = day.volume;
    });

    const priceDiff = maxPrice - minPrice;
    maxPrice += priceDiff * 0.03;
    minPrice -= priceDiff * 0.03;

    const getX = (index) => padding.left + (index * (chartWidth / (klineData.length - 1)));
    const getY = (price) => padding.top + priceAreaHeight - ((price - minPrice) / (maxPrice - minPrice)) * priceAreaHeight;
    const getVolY = (volume) => canvas.height - padding.bottom - (volume / maxVolume) * volumeHeight;

    // Draw Grid Lines (Y axis price labels)
    ctx.strokeStyle = "rgba(255,255,255,0.04)";
    ctx.lineWidth = 1;
    ctx.fillStyle = "#9ca3af";
    ctx.font = "10px Consolas, monospace";
    ctx.textAlign = "right";

    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
        const val = minPrice + (priceDiff * (i / gridLines));
        const y = getY(val);
        
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(canvas.width - padding.right, y);
        ctx.stroke();

        ctx.fillText(val.toFixed(1), padding.left - 10, y + 4);
    }

    // Draw Volume Separator Grid
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.beginPath();
    ctx.moveTo(padding.left, canvas.height - padding.bottom - volumeHeight);
    ctx.lineTo(canvas.width - padding.right, canvas.height - padding.bottom - volumeHeight);
    ctx.stroke();

    // Draw X axis dates (4 dates spaced out)
    ctx.textAlign = "center";
    ctx.fillStyle = "#6b7280";
    const dateInterval = Math.floor(klineData.length / 4);
    for (let i = 0; i < klineData.length; i += dateInterval) {
        const x = getX(i);
        ctx.fillText(klineData[i].date, x, canvas.height - padding.bottom + 15);
    }

    // 11.1.1 Draw Volume Bars
    const barWidth = (chartWidth / klineData.length) * 0.65;
    klineData.forEach((day, i) => {
        const x = getX(i);
        const yVal = getVolY(day.volume);
        const yBottom = canvas.height - padding.bottom;

        ctx.fillStyle = day.close >= day.open ? "rgba(239, 68, 68, 0.45)" : "rgba(52, 211, 153, 0.45)"; 
        ctx.fillRect(x - barWidth / 2, yVal, barWidth, yBottom - yVal);
    });

    // 11.1.2 Draw K Lines
    klineData.forEach((day, i) => {
        const x = getX(i);
        const yOpen = getY(day.open);
        const yClose = getY(day.close);
        const yHigh = getY(day.high);
        const yLow = getY(day.low);

        const isRise = day.close >= day.open;
        const color = isRise ? "#ef4444" : "#34d399";
        
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;

        // Shadow lines
        ctx.beginPath();
        ctx.moveTo(x, yHigh);
        ctx.lineTo(x, yLow);
        ctx.stroke();

        // K-line Body
        ctx.fillStyle = color;
        const bodyHeight = Math.max(Math.abs(yClose - yOpen), 1.5);
        const bodyY = Math.min(yOpen, yClose);
        ctx.fillRect(x - barWidth / 2, bodyY, barWidth, bodyHeight);
    });

    // 11.1.3 Draw 5 Moving Averages (MA5, 20, 60, 100, 240)
    const drawMA = (key, color) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        klineData.forEach((day, i) => {
            const x = getX(i);
            const y = getY(day[key]);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();
    };

    drawMA("ma5", "#ff007f");
    drawMA("ma20", "#00e5ff");
    drawMA("ma60", "#00e676");
    drawMA("ma100", "#ffd600");
    drawMA("ma240", "#ff6d00");
}

// 11.2 Fundamental Margin Trends Drawing Engine
function drawFinanceChart(canvas, fData) {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Background style
    ctx.fillStyle = "#0c0f1c";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const padding = { top: 30, right: 40, bottom: 40, left: 50 };
    const chartWidth = canvas.width - padding.left - padding.right;
    const chartHeight = canvas.height - padding.top - padding.bottom;

    let maxMargin = 0;
    fData.gross.forEach((v, idx) => {
        maxMargin = Math.max(maxMargin, v, fData.op[idx], fData.net[idx]);
    });
    maxMargin = Math.min(100, maxMargin + 10);

    const getX = (index) => padding.left + (index * (chartWidth / (fData.quarters.length - 1)));
    const getY = (val) => padding.top + chartHeight - (val / maxMargin) * chartHeight;

    // Draw grid lines
    ctx.strokeStyle = "rgba(255,255,255,0.04)";
    ctx.lineWidth = 1;
    ctx.fillStyle = "#9ca3af";
    ctx.font = "10px Consolas, monospace";
    ctx.textAlign = "right";

    const lines = 4;
    for (let i = 0; i <= lines; i++) {
        const val = (maxMargin * (i / lines));
        const y = getY(val);
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(canvas.width - padding.right, y);
        ctx.stroke();
        ctx.fillText(`${val.toFixed(0)}%`, padding.left - 10, y + 4);
    }

    // Draw X axis quarter text
    ctx.textAlign = "center";
    ctx.fillStyle = "#9ca3af";
    fData.quarters.forEach((q, i) => {
        ctx.fillText(q, getX(i), canvas.height - padding.bottom + 18);
    });

    const drawLine = (dataArray, color) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        dataArray.forEach((val, i) => {
            const x = getX(i);
            const y = getY(val);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();

        dataArray.forEach((val, i) => {
            const x = getX(i);
            const y = getY(val);

            ctx.fillStyle = "#0c0f1c";
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = "#f3f4f6";
            ctx.font = "bold 9px Consolas, monospace";
            ctx.fillText(`${val.toFixed(2)}%`, x, y - 10);
        });
    };

    drawLine(fData.gross, "#ff1744"); 
    drawLine(fData.op, "#2979ff");    
    drawLine(fData.net, "#00e676");   
}

// ==========================================================================
// 12. SheetJS Excel Export Logic
// ==========================================================================
function exportToExcel(data) {
    try {
        const wb = XLSX.utils.book_new();

        const s1Data = [
            ["台股 AI 綜合分析團隊 - 專家觀點摘要"],
            [`個股：${data.symbol} ${data.name}`],
            [`分析日期：${data.time}`],
            [], 
            ["領域", "核心結論", "關鍵理由"]
        ];
        
        data.expertViews.forEach(v => {
            s1Data.push([v.area, v.conclusion, v.reason]);
        });
        
        const ws1 = XLSX.utils.aoa_to_sheet(s1Data);
        ws1["!cols"] = [{ wch: 12 }, { wch: 22 }, { wch: 60 }];
        XLSX.utils.book_append_sheet(wb, ws1, "專家觀點摘要");

        const cleanText = (html) => {
            const doc = new DOMParser().parseFromString(html, 'text/html');
            return doc.body.textContent || "";
        };

        const s2Data = [
            ["台股 AI 綜合分析團隊 - 深度多空論證"],
            [`個股：${data.symbol} ${data.name}`],
            [`分析日期：${data.time}`],
            [], 
            ["類型", "核心論證細節"]
        ];

        data.pros.forEach(p => {
            s2Data.push(["多方亮點 (順風優勢)", cleanText(p)]);
        });
        data.cons.forEach(c => {
            s2Data.push(["空方風險 (潛在隱憂)", cleanText(c)]);
        });

        const ws2 = XLSX.utils.aoa_to_sheet(s2Data);
        ws2["!cols"] = [{ wch: 24 }, { wch: 70 }];
        XLSX.utils.book_append_sheet(wb, ws2, "深度多空論證");

        const s3Data = [
            ["台股 AI 綜合分析團隊 - 綜合評等與操作策略"],
            [`個股：${data.symbol} ${data.name}`],
            [`分析日期：${data.time}`],
            [], 
            ["決策項目", "核心決策內容"],
            ["團隊綜合評等", data.rating],
            ["策略建議", data.suggestion],
            ["防守 / 停損價位", data.stoploss]
        ];

        const ws3 = XLSX.utils.aoa_to_sheet(s3Data);
        ws3["!cols"] = [{ wch: 20 }, { wch: 75 }];
        XLSX.utils.book_append_sheet(wb, ws3, "操作策略與評等");

        const fileName = `${data.symbol}_${data.name}_綜合分析報告_${data.time.replace(/-/g, "")}.xlsx`;
        XLSX.writeFile(wb, fileName);
    } catch (error) {
        console.error("Excel Export Error:", error);
        alert("Excel 匯出失敗，請檢查瀏覽器主控台 (Console) 以獲取詳細資訊。");
    }
}
