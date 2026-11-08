# 語言學習與AI協作公會

把每次練習累積成自己的語言筆記。交流各種語言的學習資源與 AI 工具，一起練習閱讀、寫作、口說與溝通。

[開啟啟動台](https://freetwai.github.io/guild-language-ai/) · [進入自由工坊工作區](https://freetwai.com/#guilds/guild_custom_e3ab38b68bcd43058b79686477bdabf5/start)

## 本公會的工作路徑

1. 挑選翻譯或語言練習技能書：從公會技能書找到方法與原始工具。
2. 選一段內容與 AI 一起練習：選擇適合的工具，接續已有的設定與操作。
3. 記下修正、例句與下一次練習：在你的工作區保存筆記與成果，之後可以繼續。

成果：一份閱讀、寫作或口說練習紀錄。

## 修改、預覽與發布

需要 Node 24。執行 npm ci、npm test、npm run build、npm run preview；開啟 http://127.0.0.1:4417。瀏覽器驗證：npx playwright install chromium，再執行 npm run test:browser。

文字與流程在 workspace.json，畫面在 src/。本 Repo 的 PR 由非作者維護者審查；verify 通過並合併 main 後，由 GitHub Actions 自動發布本公會的 GitHub Pages，毋須重建主站或其他公會。release.json 記錄實際發布的 source SHA。

需回復時，在 Verify and publish workspace 的 Run workflow 選 main，填入曾合併到 main 的完整 source_sha。它會重新驗證並發布該版本；一般發布留空。main 分支與 github-pages 環境的保護不能關閉。發布失敗保留原站點；以 Actions 與公開 release.json 核對實際結果。

## 與中央平台的邊界

本 Repo 擁有啟動台的畫面與導覽。會員登入、入會、技能書、應用安裝、私人工作與版本資料仍由 freedom-platform 的原 API 管理。本頁可獨立開啟，也能由主站以 sandbox=allow-scripts 載入；freedom.guild-launchpad/v1 只提供 work、skills、tools、information 導覽，沒有任意 URL、讀取私人資料或提交命令。新增業務操作需在中央領域審查接入，不能自行複製權限邏輯。

模板初始來源與檔案摘要見 template.lock.json；它只記錄起點，不阻止公會獨立改版。軟體採 MIT，沿用 FreeTWAI contributors 署名；brand.png 是自由工坊原始品牌資產，維持原有品牌權利，不因 MIT 程式授權取得另外的品牌授權。
