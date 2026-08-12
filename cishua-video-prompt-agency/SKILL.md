---
name: cishua-video-prompt-agency
description: Use this skill when converting 词刷刷 English vocabulary short-video scene scripts, shot beats, example sentences, teaching dialogue, spreadsheet rows, JSON packages, or pasted Chinese scene copy into Seedance 2.0-ready video prompts. It routes the work through visual style, continuity card, scene rewrite, camera design, Seedance prompt writing, QA, examples, style library, director toolbox, and spreadsheet/JSON-ready output modules for vocabulary learning videos.
---

# 词刷刷 Seedance 视频提示词 Agency

Turn 词刷刷 scene scripts into compact, production-ready Seedance 2.0 prompts while preserving the target word, Chinese meaning, example sentence, learning intent, and visual continuity.

## Operating Mode

Default to direct conversion. If the user provides many rows, process in batches and preserve all user-provided IDs, headers, ordering, and existing generated columns.

Keep chat output short. Put large prompt tables, JSON packages, or QA reports into files when useful.

## Flow

1. Read [01-flow-controller.md](references/01-flow-controller.md) to choose the path, lock source fields, and decide which downstream agents are needed.
2. Read [02-visual-style-agent.md](references/02-visual-style-agent.md) to choose a visual style that supports the word sense and learner memory.
3. Read [03-visual-continuity-card-agent.md](references/03-visual-continuity-card-agent.md) to build the continuity card before writing the prompt.
4. Read [04-scene-playwright-agent.md](references/04-scene-playwright-agent.md) to turn the source script into a video-native mini-scene.
5. Read [05-camera-design-agent.md](references/05-camera-design-agent.md) to specify framing, motion, lens feel, light, and timing.
6. Read [06-seedance-prompt-writer-agent.md](references/06-seedance-prompt-writer-agent.md) to write the final Seedance 2.0 prompt.
7. Read [07-continuity-qa-agent.md](references/07-continuity-qa-agent.md) to check continuity, word sense, prompt density, safety, and output readiness.

## Supporting References

- Read [output-format.md](references/output-format.md) when exporting table, CSV/TSV, JSON, workbook-ready fields, or prompt-only results.
- Read [examples.md](references/examples.md) when the user asks for examples or when calibrating a new batch.
- Read [style-library.md](references/style-library.md) when a style needs to be selected or normalized.
- Read [director-toolbox.md](references/director-toolbox.md) when a scene needs stronger camera, blocking, lighting, motion, or performance design.

## Default Output

For each input item, produce:

- `video_prompt_zh`: Seedance-ready Chinese prompt.
- `negative_prompt`: concise avoid list when useful.
- `duration`: default `5-8s`.
- `aspect_ratio`: default `9:16`.
- `visual_style`: selected style label.
- `continuity_card`: compact continuity summary when requested or useful for batch QA.
- `qa_notes`: short notes only for ambiguity, repaired continuity, or production risk.

## Non-Negotiables

- Preserve the exact target word, part of speech, Chinese meaning, and English example sentence from the source.
- Treat `Meaning-each` as authoritative when present.
- Keep the word sense visually demonstrable through action, contrast, state, object feature, relationship, or result.
- Make the first frame immediately readable.
- Use one main subject, one setting, one visible meaning beat, one result or reaction, and one clear teaching cue.
- Keep prompts compact and concrete. Avoid generic style filler.
- Avoid brand-heavy, celebrity, real-private-person, unsafe, explicit, hateful, illegal, medical, financial, or evasion-like content.
- Preserve spreadsheet headers and row order exactly when exporting.

## Ambiguity

Repair obvious continuity or wording issues silently when the target word, meaning, and sentence are clear.

Ask the user only when the word sense, required example sentence, output schema, or safety boundary cannot be inferred with confidence.
