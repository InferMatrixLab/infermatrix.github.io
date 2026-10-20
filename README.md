# InferMatrix

**Open to Infer. Built to Evolve.**

InferMatrix 开源推理生态展示网站。当前版本提供中文/英文切换、七个项目的分类筛选、架构图缩放查看、生态方向探索，以及原始海报下载。

A bilingual, buildless website showcasing seven open-source inference projects: vLLM-Omni, afd-plugin, vLLM Router, agent-infer, vllm-rlt, vllm-omni-mlx, and InferRSI.

## 本地运行 / Run locally

不需要 npm 安装、构建步骤或后端。使用 Python 3 在仓库根目录运行：

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open [http://localhost:8000](http://localhost:8000). The deployable files are already at the repository root: `index.html`, `styles.css`, `app.js`, `robots.txt`, `sitemap.xml`, and `assets/`.

The stylesheet requests DM Sans and Manrope from Google Fonts. System-font fallbacks remain available when the external font service cannot be reached.

## 检查与维护 / Check and maintain

可选维护工具只依赖 Node.js 18+ 的内置模块，无需安装第三方包。

Optional maintenance checks use Node.js 18+ built-in modules only:

```sh
node --check app.js
node --check prepare-initial-content.cjs
node --check qa-interactions.cjs
node qa-interactions.cjs
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

- A repo-grouped video showcase with five vLLM-Omni videos, local poster previews, click-to-play and fullscreen controls.
- InferRSI as a seventh project and an evidence-driven optimization direction, with a brand-styled, scalable architecture SVG.
- Qwen3-TTS and Drama 3 dedicated-engine examples with pinned, workload-specific C1/C64 audio-throughput comparisons. See `INFERRSI.md` and `BENCHMARK_EVIDENCE.json`; these are author-reported results, not independently rerun benchmarks.
- MiniCPM-o 4.5 single-GPU streaming speech: H200 target configuration with explicitly labelled L20X source C1/C32 measurements and reproduction links. The all-metric 2× target is unmet; the measured r11 profile has a HiFT numerical failure and pending speech-quality gates.
- Infer RSI in the focus strip and a fifth bilingual autonomous-inference-optimization explorer direction.
- Public Recipes catalog links in the navigation and InferRSI section.

## 素材与许可 / Assets and licensing

See [ATTRIBUTION.md](ATTRIBUTION.md) for asset-specific sources and [licenses/](licenses/) for the retained upstream licenses. The two official upstream diagrams retain their Apache-2.0 terms. The logo, poster, and poster-based vector redraws are not assigned an open-source license by this repository. No blanket license is asserted for all website code and branding.
