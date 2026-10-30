# InferMatrix

**Open to Infer. Built to Evolve.**

InferMatrix 开源推理生态展示网站。当前版本提供中文/英文切换、七个项目的分类筛选、架构图缩放查看、生态方向探索、视频资源专栏，以及原始海报下载。

A bilingual, buildless website showcasing seven open-source inference projects: vLLM-Omni, afd-plugin, vLLM Router, agent-infer, vllm-rlt, vllm-omni-mlx, and InferRSI.

## 本地运行 / Run locally

不需要 npm 安装、构建步骤或后端。使用 Python 3 在仓库根目录运行：

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open [http://localhost:8000](http://localhost:8000). The deployable files are already at the repository root: `index.html`, `styles.css`, `assistant.css`, `app.js`, `showcase.js`, `inferrsi.js`, `assistant.js`, `resource-library.js`, `robots.txt`, `sitemap.xml`, and `assets/`.

The stylesheet requests DM Sans and Manrope from Google Fonts. System-font fallbacks remain available when the external font service cannot be reached.

## 检查与维护 / Check and maintain

可选维护工具只依赖 Node.js 18+ 的内置模块，无需安装第三方包。

Optional maintenance checks use Node.js 18+ built-in modules only:

```sh
node --check app.js
node --check resource-library.js
node --check prepare-initial-content.cjs
node --check qa-interactions.cjs
node qa-interactions.cjs
node qa-resources.cjs
```

The interaction suite reads the current `index.html` and runs `app.js` in a simulated DOM using Node's VM. It covers filtering, bilingual content, keyboard navigation, project/poster dialogs, focus return, motion preferences, blocked storage, and all six architecture viewers. This is a logic regression check; it does not replace real-browser visual or accessibility testing.

项目资料和中英文文案集中在 `app.js`。修改项目卡片内容后，重新生成 HTML 中供无 JavaScript 环境阅读的卡片：

After editing project content in `app.js`, refresh the pre-rendered no-JavaScript cards:

```sh
node prepare-initial-content.cjs
node qa-interactions.cjs
```

`ASSET_PROVENANCE.json` records the included image sources, dimensions, and SHA-256 hashes. `SHA256SUMS` covers every file in this source snapshot except the checksum file itself. Verify on Linux with `sha256sum -c SHA256SUMS`, or on macOS with `shasum -a 256 -c SHA256SUMS`. After intentional edits, refresh the relevant provenance hashes and checksum manifest.

## 网站地址 / Site address

Live websites: https://infermatrix.si for the brand website and https://recipes.infermatrix.si for the Recipes catalog. All three Recipes entries on the brand site link to the Recipes subdomain.

Both sites use Cloudflare Pages Free with GitHub automatic deployments. The Pages addresses remain available at https://infermatrix.pages.dev and https://infermatrix-recipes.pages.dev.

For the brand site, select framework `None`, leave the build command empty, and use the repository root (`.`) as the build output directory. For `InferMatrixLab/recipe`, use `pnpm build`, output directory `out`, Node.js 24, and pnpm 11.25.0. Leave `NEXT_PUBLIC_BASE_PATH` unset for the Recipes subdomain.

Bind each custom domain in its Pages project. The registrar must delegate `infermatrix.si` to the Cloudflare nameservers assigned to the zone before the custom domains can become active. Both sites are public and require no sign-in.

## Latest additions

- A bilingual Articles column with 14 verified technical articles and practical guides covering all seven projects, separate filters and search, and six entries per page.

- A bilingual Video resources column for external learning tutorials and project talks, with project/type filters and search. Eleven links cover vLLM-Omni, afd-plugin and vLLM Router, with available publisher information and verification sources retained.
- A repo-grouped video showcase with five vLLM-Omni videos and two InferRSI English demos, local poster previews, click-to-play and fullscreen controls.
- InferRSI as a seventh project and an evidence-driven optimization direction, with a brand-styled, scalable architecture SVG.
- Qwen3-TTS and Drama 3 dedicated-engine examples with pinned, workload-specific C1/C64 audio-throughput comparisons. See `INFERRSI.md` and `BENCHMARK_EVIDENCE.json`; these are author-reported results, not independently rerun benchmarks.
- MiniCPM-o 4.5 single-GPU streaming speech: H200 target configuration with explicitly labelled L20X source C1/C32 measurements and reproduction links. The all-metric 2× target is unmet; the measured r11 profile has a HiFT numerical failure and pending speech-quality gates.
- h3-metal as a fourth dedicated-engine example: original H3 and distilled FastH3 on Apple M5 Max, with separate cold/warm measurements, pinned evidence and explicit checkpoint/quality limitations.
- Infer RSI in the focus strip and a fifth bilingual autonomous-inference-optimization explorer direction.
- Public Recipes catalog links in the navigation and InferRSI section.

## MIRA assistant guide

The header avatar and a small full-body floating sticker open the same bilingual
project guide. The floating sticker appears after the header leaves the viewport;
its dismiss control appears on mouse hover or keyboard focus and remains available
on touch devices. Dismissal is remembered, and opening the guide from the header
or footer restores the sticker.

This is an explicitly labeled **local-content navigation demo**, not a connected
AI model. Replies use preset project material and source links. No model endpoint,
API key, or chat logging service is configured. See [LOCAL_PREVIEW.md](LOCAL_PREVIEW.md)
for the optional dependency-free Node preview and interaction checklist.

## 视频资源 / Video resources

首页导航的「视频专栏」指向 `#video-resources`，与「演示展示」分别维护。专栏收录学习教程、技术分享和宣讲回放的外部链接，点击后在新窗口打开原发布平台，不嵌入或下载视频。

资源清单集中在 `assets/video-resources.json`。当前收录 11 条：vLLM-Omni 8 条、afd-plugin 2 条、vLLM Router 1 条；其他四个项目暂未找到可核实的教程或宣讲回放。用户指定合集分集时保留 `p` 参数，并移除分享链接中的跟踪参数；可用 B 站官方分页元数据核实分集标题、讲者（标题明确标注时）与时长。每添加一条资源，填写以下格式；示例仅说明字段，不是已收录的视频：

```json
{
  "id": "unique-video-id",
  "project": "omni",
  "type": "tutorial",
  "title": {"zh": "视频中文标题", "en": "Video title"},
  "description": {"zh": "介绍视频内容与适合的观众。", "en": "Describe the content and intended audience."},
  "url": "https://www.youtube.com/watch?v=REPLACE_WITH_VIDEO_ID",
  "platform": "YouTube",
  "publisher": "发布者或活动主办方",
  "speaker": "讲者姓名",
  "publishedAt": "2026-10-28",
  "duration": "35:20"
}
```

项目 ID：`omni`（vLLM-Omni）、`afd`（afd-plugin）、`router`（vLLM Router）、`agent`（agent-infer）、`rlt`（vllm-rlt）、`mlx`（vllm-omni-mlx）、`inferrsi`（InferRSI）。类型为 `tutorial`（学习教程）或 `talk`（技术分享 / 宣讲）。`publisher`、`speaker`、`publishedAt`、`duration` 可省略；链接必须使用 HTTPS。标题与简介提供中英文，列表按清单顺序显示。发布前核实链接、项目归属和视频内容，清单中不要保留示例占位链接。

每条已收录资源还保留 `sourceUrl`、`verifiedAt` 和 `sourceNote`，供维护者核对来源、核实日期及证据范围；有依据时记录 `eventDate`。这些维护字段不显示在视频卡片上。`publishedAt` 只填写已确认的视频上传日期，不能用会议日期或配套文章日期代替。中英文标题是便于浏览的编辑文案；原始标题与信息请以来源页面为准。首批资料来源包括 vLLM 官方 Office Hours、Conf42、Red Hat Developer、B 站原视频页面以及 vLLM 小课堂的原视频与课件索引。B 站的部分页面/API 会对自动抓取返回 412；其链接由原始页面索引或配套资料交叉核对，未逐条验证实际播放。

The library is rendered by `resource-library.js`. Project counts reflect the full catalog; results combine project, content-type, and text filters. Results are paginated at 6 videos per page, with bilingual previous/next controls and the current visible range. Changing a filter or search resets to page one; changing language preserves the current page and filters. Pagination is hidden for a single page, empty results, loading and errors. Search covers both languages, project names, platforms, publishers, and speakers. Empty catalogs, no matches, and failed requests have distinct states; failed requests can be retried.

The catalog is fetched with `cache: 'no-store'` and a fresh request parameter so edits to the JSON appear on the next page reload, even when the document or previous JSON response was cached. Changing only the page URL's query string does not invalidate a separately fetched resource. The script entry also carries a version parameter to refresh older copies of the loader.

## 文章专栏 / Articles

首页导航的「文章专栏」指向 `#article-resources`。首批收录 14 篇官方博客、社区技术解读与项目实践指南，覆盖七个项目。点击「阅读原文」前往原发布平台；中英文标题和简介为本站编辑文案，正文以原文为准。

文章清单位于 `assets/article-resources.json`，与视频分开维护。字段沿用视频资源结构；类型为 `tutorial`（学习教程）或 `technical`（技术解读），可选作者字段为 `author`，无需填写 `speaker` 或 `duration`。每条记录保留 `sourceUrl`、`sourceNote` 和 `verifiedAt`，核实日期使用 `YYYY-MM-DD`。只有来源明确提供发布日期时才填写 `publishedAt`；持续更新的项目文档不使用仓库修改时间代替发布日期。

视频与文章在同一个 `#learning-resources` 区域，通过「视频专栏 / 文章专栏」页签切换，一次显示一个栏目。普通访问默认选择视频；`#video-resources` 与 `#article-resources` 深链接、首页对应导航仍可直达指定栏目。页签支持左右方向键循环切换及 Home / End；无 JavaScript 时保留两个资源清单的访问入口。

`resource-library.js` initializes the video and article libraries independently using the same rendering and filtering logic. Each keeps its own project/type filters, search, page, loading and retry state across tab and language changes. Both show at most six entries per page. Article search includes authors; links and text use the same HTTPS validation and escaping as videos. `qa-resources.cjs` exercises both libraries together, including accessible tab navigation, deep links, isolated fetch failures, invalid entries, pagination and language changes.

## 素材与许可 / Assets and licensing

See [ATTRIBUTION.md](ATTRIBUTION.md) for asset-specific sources and [licenses/](licenses/) for the retained upstream licenses. The two official upstream diagrams retain their Apache-2.0 terms. The logo, poster, and poster-based vector redraws are not assigned an open-source license by this repository. No blanket license is asserted for all website code and branding.
