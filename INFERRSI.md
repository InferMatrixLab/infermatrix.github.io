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

## MiniCPM-o 4.5 addition — 2026-10-20

Adds a third bilingual dedicated-engine example from [the pinned engine README](https://github.com/InferMatrixLab/minicpm-o-4.5-single-gpu-engine/blob/a4f4778f312791c2d190b48e521141887ed160c8/README.md),
[architecture](https://github.com/InferMatrixLab/minicpm-o-4.5-single-gpu-engine/blob/a4f4778f312791c2d190b48e521141887ed160c8/docs/architecture.md) and [results](https://github.com/InferMatrixLab/minicpm-o-4.5-single-gpu-engine/blob/a4f4778f312791c2d190b48e521141887ed160c8/docs/current-results.md).
The card targets H200; H200 execution is unverified. Its explicitly labelled L20X source
C1/C32 comparison uses the `track_s_fast_r11` five-run means and computes throughput ratios from
the unrounded `docs/current-results.json` values. Baseline revisions and configurations, raw run
values and qualifications are recorded under `minicpm` in `BENCHMARK_EVIDENCE.json`.

The engine shares Thinker/Talker paged KV and CUDA graphs in one process and uses a Token2Wav
worker under CUDA MPS. Reported memory use is about 95 GB on a 143 GB L20X. The README default
`track_s_fast` differs from the measured r11 profile. r11 exceeds the HiFT error bound on 1/190
chunks and lacks the final speech-quality runs; the all-concurrency/all-metric 2× gate is unmet.
The planned H200 K=10 acceptance has not run. Neither the throughput ratios nor TTFA values are presented as H200 measurements. These are author-reported development measurements;
no hardware benchmark was rerun for this update. SGLang-Omni returns one whole waveform, so its
TTFA equals end-to-end latency.

Verification: JavaScript syntax and the existing VM interaction suite passed (its legacy
absolute fixture paths were mapped to this checkout in memory). Browser checks covered
the new Chinese/English card, desktop three-column layout and 390 px mobile layout with
no page overflow or console warnings/errors. Source JSON arithmetic was checked; no
hardware inference was run. Remote follow-up: H200 startup and memory, exact-profile
speech quality, numerical parity and the documented acceptance protocol.
