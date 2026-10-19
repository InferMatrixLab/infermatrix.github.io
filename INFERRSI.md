# InferRSI website section

Updated 2026-10-19. Adds a seventh ecosystem project, using a brand-styled scalable redraw of the documented InferRSI implemented modules, plus a dedicated bilingual direction and two model/hardware-specific example cards.

Sources read for this update:
- https://github.com/InferMatrixLab/InferRSI/blob/main/README.md (blob 29534cc2e71d4188c685cb24a10f04d3292548f3)
- https://github.com/InferMatrixLab/InferRSI/blob/main/docs/assets/modular-components-en.svg
- https://github.com/InferMatrixLab/qwen3-tts-engine/blob/main/README.md
- https://github.com/InferMatrixLab/drama-3-single-b300-engine/blob/main/README.md

InferRSI is positioned as a user-driven CLI optimization workbench, not an autonomous optimization system. Engine examples are scoped to their models and hardware; author-reported campaign acceptance does not imply production readiness or generic superiority. Drama 3's original all-concurrency target remains unmet and optimization is paused. No new performance experiment was run for this website update.

Recipes entry: https://recipes.infermatrix.si . Website content and audiences are managed separately; preserve the existing brand site's audience.

The prior v9 video showcase, original logo and six original architecture assets are retained. Historical poster artwork still contains six projects and is not rewritten.

## Performance comparisons
Pinned author-reported audio throughput added for C1 and C64. Qwen3-TTS uses three-run means; Drama uses medians, except vLLM-Omni C64 has only two completed runs plus a timeout. Drama C64 is approximately parity with vLLM-Omni; 2.47× applies only to SGLang-Omni. Tests were not rerun for the website. Detailed sources and configuration evidence are in `BENCHMARK_EVIDENCE.json`.
