# TaskMgr — Memory Simulator (React)

An interactive, step-by-step visualization of how a Go program uses the **CPU
registers**, the **stack**, the **heap**, and the **virtual address space**. Walk a
small CLI task manager through 31 execution steps and watch memory and the x86-64
register file change on every step.

This is an idiomatic **React + TypeScript + Vite** port of the original
single-file `memory_simulator.html`. The original HTML files are intentionally left
untouched in the parent directory.

## Features

- **All Regions** view — stack, heap, code segment, data segment, and the full CPU
  register panel, with per-step allocation / update / free highlighting.
- **CPU Registers** view — program counter (RIP), instruction register, decoder,
  RSP / RBP, all 16 general-purpose registers at 64 / 32 / 16 / 8-bit widths,
  RFLAGS, segment, SIMD, and control registers, with writeback markers and
  change highlights.
- **Goroutines**, **Heap Map**, and **Virtual Map** views.
- Step-view with syntax-highlighted code + CPU narration, and a full `task.go` view.
- Heap/stack **timeline sparkline** (click to seek), search, auto-play, keyboard
  shortcuts, a copy-to-clipboard snapshot, and a responsive mobile layout.

## Getting started

```bash
npm install
npm run dev       # start the dev server
npm run build     # type-check + production build into dist/
npm run preview   # serve the production build
npm run lint      # ESLint
```

> Note: `npm run dev` relies on Vite's file watcher, which does not work when the
> project lives on a Windows network share. Use `npm run build` + `npm run preview`
> there, or move the project to a local disk for HMR.

## Architecture

```
src/
  data/        # verbatim datasets extracted from the original (steps, Go source,
               # register metadata, intro HTML) — typed via src/types.ts
  lib/         # pure logic, no DOM: register derivation, formatters, snapshot
  hooks/       # useSimulator (state/keyboard/hash/auto-play), tooltip + pointer
               # engines, responsive helper, and the SimulatorContext
  components/  # presentational components (TopBar, StepsSidebar, CenterPanel,
               # MemoryPanel, …); memory/ and registers/ hold the sub-views
  styles/      # the verbatim stylesheet carried over from the original
scripts/       # one-shot data extractors (documented, re-runnable)
```

Design notes:

- **Separation of concerns** — data, pure logic, state, and presentation are kept in
  separate layers. Logic functions take plain values and never touch the DOM.
- **Verbatim data** — the 31-step dataset, Go source, metadata, intro copy, and the
  stylesheet are extracted unchanged from the original to guarantee fidelity. The
  extraction scripts in `scripts/` document exactly how.
- **Trusted HTML** — a few pre-built, app-generated HTML fragments (highlighted code,
  descriptions, intro banners) render via a small `<Html>` helper. The content is
  never user-derived.

## Tech

React 19 · TypeScript · Vite. No runtime dependencies beyond React.
