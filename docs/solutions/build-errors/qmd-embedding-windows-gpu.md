---
title: "qmd embedding completion on Windows with node-llama-cpp"
date: 2026-02-18
category: build-errors
tags: [qmd, semantic-search, node-llama-cpp, CUDA, Vulkan, embeddings, Windows, GPU-acceleration]
module: content-analysis
severity: medium
symptoms:
  - "SessionReleasedError during CPU embedding (~85% chunk failure rate)"
  - "Vulkan SDK cmake unable to locate cl.exe from bash shell"
  - "CUDA Toolkit 13.1 incompatible with VS2022 bundled cmake 3.26"
  - "npx builds binary in cache instead of qmd's node_modules"
  - "nvm junction path mismatch causes 'incompatible binary' error"
  - "CUDA runtime init failed despite successful compilation"
root_cause: "node-llama-cpp CPU path unstable for large volumes; GPU toolchain version mismatches across cmake/CUDA/drivers; binary caching in wrong location"
resolution_summary: "Accumulated embeddings via multiple partial CPU runs; completed with qmd embed -f from VS Developer Command Prompt with Git bash + cmake 4.2.3 on PATH"
---

# qmd Embedding on Windows: GPU Attempts and CPU Workaround

## Problem

Needed to embed ~1,772 markdown files (2,529 chunks) using `qmd` v1.0.6 (which uses node-llama-cpp + embeddinggemma-300M model). On a Windows 11 machine with RTX 4070 Ti.

## Environment

- Windows 11, RTX 4070 Ti (12GB VRAM), Ryzen 9 7900X, 64GB RAM
- Node.js v25.5.0 via nvm
- qmd v1.0.6, node-llama-cpp 3.15.1, llama.cpp b7836
- VS2022 Community (MSVC 19.36)

## Investigation Steps

### Attempt 1: CPU embedding (failed)

```bash
qmd embed
```

Result: ~350/2,529 chunks succeed, rest fail with `SessionReleasedError`. Repeated twice — same ~85% failure rate. CPU path is fundamentally unstable for this volume.

### Attempt 2: Vulkan GPU (failed)

Installed Vulkan SDK at `C:\VulkanSDK\1.4.341.1`. Build failed:

```
No CMAKE_C_COMPILER could be found
```

Root cause: bash shell can't properly load `vcvarsall.bat` for the nested cmake build of vulkan-shaders-gen. Also, node-llama-cpp detects NVIDIA driver and prefers CUDA over Vulkan — no env var to override without patching source.

### Attempt 3: CUDA GPU (partial success)

Installed CUDA Toolkit v13.1.115. Build failed with VS2022's bundled cmake 3.26:

```
The CUDA Toolkit directory '' does not exist
```

Fix: installed standalone cmake 4.2.3. Binary compiled successfully from VS Developer Command Prompt:

```cmd
set PATH=C:\Program Files\CMake\bin;%PATH%
cd "C:\Program Files\nodejs\node_modules\@tobilu\qmd"
npx node-llama-cpp source download --gpu cuda
```

**But**: CUDA runtime failed to initialize at runtime:

```
ggml_cuda_init: failed to initialize CUDA: (null)
```

**Confirmed cause**: Driver 560.94 only supports up to CUDA 12.6. Toolkit 13.1 needs driver 570+.

```bash
nvidia-smi
# Driver Version: 560.94    CUDA Version: 12.6
# "CUDA Version" here = max supported by driver, NOT installed toolkit version
```

**Fix (for future)**: Either update NVIDIA driver to 570+ or install CUDA Toolkit 12.6 instead of 13.1.

### Attempt 4: CPU with GPU disabled (final solution)

CUDA crashes at runtime (`ggml-cuda.cu:96: CUDA error`) on both local and prebuilt binaries — even after updating driver to 591.86. Likely a node-llama-cpp/llama.cpp CUDA bug on this system. Vulkan build also fails (cmake issues).

**Fix**: Force CPU mode by disabling GPU:

```cmd
set NODE_LLAMA_CPP_GPU=false
qmd embed
```

Completes all 2,529 chunks in ~30 seconds. Fast enough — no need for GPU.

## Working Solution

**End result**: 1,772 files / 2,529 chunks fully embedded on CPU in one run.

### Quick reference commands

```bash
# Check status
qmd status

# Embed (force CPU to avoid CUDA crash)
set NODE_LLAMA_CPP_GPU=false
qmd embed

# Force re-embed all (use after major content changes)
qmd embed -f

# Must run from VS Developer Command Prompt on Windows with:
# set PATH=C:\Program Files\Git\bin;C:\Program Files\CMake\bin;%PATH%
# (qmd's bin is a bash script, needs Git bash; cmake 4.2.3 needed for CUDA builds)
```

## Prevention / Future Notes

1. **CPU with `NODE_LLAMA_CPP_GPU=false` is fast enough**: ~30 seconds for 2,529 chunks. Use this.
2. **CUDA crashes at runtime** even with driver 591.86 + Toolkit 13.1. Likely a llama.cpp bug. May be fixed in future node-llama-cpp versions.
3. **Vulkan build fails** on Windows due to nested cmake issues. Also likely fixable in future versions.
4. **iCloud for Windows**: May trigger unrelated download popups during heavy I/O. Safe to cancel.
5. **nvm path gotcha**: `C:\Program Files\nodejs` is an nvm junction to `C:\Users\Kento\AppData\Roaming\nvm\v25.5.0`. Builds done via one path may not be found when loaded via the other.

## Cross-references

- Deep CUDA root cause analysis: `docs/solutions/integration-issues/qmd-search-modes-and-cuda-failure.md` — includes source code fix (patch llm.js to prefer Vulkan)
- Memory: `~/.claude/projects/.../memory/search-engine-plan.md` — full progress log
- qmd GitHub: https://github.com/tobi/qmd
- node-llama-cpp GPU docs: https://node-llama-cpp.withcat.ai/guide/gpu
