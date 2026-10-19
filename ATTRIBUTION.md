# Asset attribution / 素材来源

This file records the assets used by the current website, checked on 2026-10-12. Rights remain with their respective owners. Linking a project, showing its name or mark, or including an Apache-licensed architecture figure does not grant rights to its trademarks or to unrelated InferMatrix branding.

## Official upstream architecture assets

### vLLM-Omni

- Included file: `assets/architecture/omni.png` (1757 × 895).
- Source: [vllm-project/vllm-omni architecture figure](https://github.com/vllm-project/vllm-omni/blob/main/docs/source/architecture/omni-modality-model-architecture.png).
- Original Git blob: `7bbd5b9b3ec99b9a15165e0467ce6353feae56f6`; the included PNG is byte-identical to that blob.
- Upstream project: vLLM-Omni; authors and contributors retain their rights.
- License: Apache License 2.0. A complete, unchanged copy of the upstream license is included as [licenses/vllm-omni-LICENSE.txt](licenses/vllm-omni-LICENSE.txt).
- No image modifications.

### afd-plugin

- Included file: `assets/architecture/afd.svg` (1280 × 720).
- Source: [vllm-project/afd-plugin architecture figure](https://github.com/vllm-project/afd-plugin/blob/main/docs/assets/vllm-afd-plugin-architecture.svg).
- Original Git blob: `99e3065a5dd82aaf0870ddbf86760c78edbd2e02`.
- Upstream project: afd-plugin; authors and contributors retain their rights.
- License: Apache License 2.0. A complete, unchanged copy of the upstream license is included as [licenses/afd-plugin-LICENSE.txt](licenses/afd-plugin-LICENSE.txt). That license file also retains the upstream notice concerning CAM operator code; no CAM operator code is distributed here.
- Modification notice: the deployed SVG retained here contains one additional trailing newline compared with the original Git blob. Diagram geometry, text, embedded source, and metadata are unchanged. See also [the accompanying modification notice](assets/architecture/afd.svg.license).

The source repositories' root and relevant ancestor directories were checked for separate LICENSE, NOTICE, or copyright files. The license copies above were the applicable repository-level license files found; neither source had a separate NOTICE in those checked locations.

## Supplied InferMatrix artwork

- `assets/infermatrix-logo.png`: supplied InferMatrix logo, 2048 × 683; original PNG bytes preserved.
- `assets/favicon.svg`: favicon wrapper embedding that exact original logo PNG. The SVG changes the presentation viewport; it does not redraw the logo.
- `assets/infermatrix-poster.png`: supplied InferMatrix brand poster, 1862 × 2048; original PNG bytes preserved.

These assets were supplied for this website. No additional license grant for the logo, poster, or third-party marks within them is made here. The licenses for the upstream figures above do not apply to InferMatrix branding as a whole.

## Poster-matched vector redraws

The four files below are newly authored SVG transcriptions of individual panels in the supplied poster. They are clearly identified in the interface as poster-based redraws. Their editable SVG geometry and text are the source files.

- `assets/architecture/router-poster.svg` (1800 × 1360): panel 03, vLLM Router. Retains the poster's API, profiling/monitoring, scheduling, cache, transport, and worker hierarchy. Three tiny annotations that could not be read reliably were omitted. The small vLLM mark is a vector approximation. This depicts the poster concept and is not a claim about the current project implementation.
- `assets/architecture/agent-poster.svg` (1295 × 1260): panel 04, agent-infer. Redraw of the poster architecture, rather than the separately styled architecture image in the current project repository.
- `assets/architecture/rlt-poster.svg` (1544 × 1028): panel 05, recurrent looped Transformer / OURO inference. Retains the light-background, multiple-pass illustration from the poster. Website text uses the updated recurrent looped Transformer description.
- `assets/architecture/mlx-poster.svg` (1792 × 1044): panel 06, vllm-omni-mlx. Redraw of the poster's API and modality branches; it does not substitute a later documentation topology.

Source for all four: [the included InferMatrix poster](assets/infermatrix-poster.png). These redraws do not receive an Apache-2.0 license merely because the projects they illustrate use one. No new blanket licensing or trademark permission is asserted.

## Runtime fonts

`styles.css` requests DM Sans and Manrope through Google Fonts. No font binaries are bundled in this repository. Font delivery is an external browser request and falls back to system fonts when unavailable.

## Machine-readable record

[ASSET_PROVENANCE.json](ASSET_PROVENANCE.json) records the included assets and their hashes. [SHA256SUMS](SHA256SUMS) records this source snapshot. Older, unused diagrams and preview images are not included.

## October 19 additions
InferRSI architecture is a brand-styled original SVG redraw based on the linked project documentation; it is not the upstream graphic. See INFERRSI.md. Video provenance is recorded in SHOWCASE.md. Benchmark sources and exact revisions are in BENCHMARK_EVIDENCE.json. Existing asset licenses are unchanged.
