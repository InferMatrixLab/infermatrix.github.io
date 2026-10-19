# Repository showcase

The `#showcase` section initially includes five vLLM-Omni videos. Metadata lives in `assets/showcase/videos.json`; each record declares a repository, title, bilingual description, poster, local video URL, and pinned original source.

Source: InferMatrixLab/infermatrix-marketing at commit `5e6b91b881b784aa221db021b12bdeb49b8882da`, `vllm_omni/video/` (2026-10-19).

- Matrix-Game-4: web-optimized H.264/AAC 720p derivative; original 1080p remains linked.
- Aura: web-optimized H.264/AAC derivative, original resolution.
- WorkSwarm Design: original video/audio streams, remuxed for fast-start playback.
- Qwen3-Omni and PersonaPlex: original H.264 video with audio converted from HE-AAC to standard AAC-LC for browser compatibility; fast-start playback.
- Posters are actual frames at 4 seconds; no architecture or logo artwork was replaced.

Videos are not requested until the visitor clicks a preview. Native controls support seeking, audio, full screen and mobile inline playback. Starting a video stops and unloads the previous one (its preview is restored), and hiding the page pauses playback. Original source links remain visible on playback failure. Display titles are taken from supplied filenames and do not assert model/benchmark support beyond the materials.

To add another repository, add a clearly labelled group rather than mixing unrelated project clips. Keep original source attribution and verify codecs, duration and actual playback. Do not preload entire media files.

The site is buildless; serve the repository root. No GitHub Pages workflow is configured by this update.

The repository copies of Aura and Matrix-Game-4 were additionally encoded with H.264 CRF 23, a 900 kb/s video rate cap and original audio streams, retaining their web-export resolution and duration. This keeps each binary within the publishing API size limit. The original marketing sources remain linked.
