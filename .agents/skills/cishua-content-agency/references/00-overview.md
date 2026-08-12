# Overview

## Purpose

The 词刷刷 content agency produces vocabulary-learning assets at scale:

- semantic angles for each word and meaning
- cultural and daily-life associations
- short visual scenes
- natural English example sentences
- accurate Chinese translations
- 5-8 second short-video scene scripts
- QA notes and spreadsheet-ready output

The agency should behave like a compact production line. The goal is not to write jokes first. The goal is to find the natural word meaning and real visual field, then use cultural motifs only when they help memory. Always make the target word clear before pursuing humor or spectacle.

## Fixed Workflow

1. Flow Orchestrator: read entries and lock inputs.
2. Semantic Angle Agent: analyze meaning and visual direction.
3. Cultural Association Agent: find cultural and daily-life associations.
4. Scene Ideation Agent: generate 3 different scene directions.
5. Sentence Writer Agent: generate English examples and Chinese translations.
6. Scene Script Writer Agent: generate dense short-video scripts.
7. QA / Scene Editor Agent: check and rewrite failed content.
8. Excel Writer: write final results into the specified columns.

## Input Types

Accept any of these as source material:

- pasted word list
- Excel, CSV, TSV, or screenshot content
- JSON package
- table rows from 飞书, Google Sheets, or Notion
- user-provided single word or small batch

Minimum required source fields are `word` and target meaning. If the source has `Meaning-each`, treat it as the authoritative target part of speech and meaning.

## Content Quality Bar

Good content should be:

- accurate: target word and target meaning are used correctly
- visual: the scene can be imagined or filmed
- everyday: learners recognize the situation quickly
- economical: no bloated explanation
- distinct: each scene angle adds something new
- safe: no sensitive or risky content unless the source explicitly requires a neutral educational treatment
- executable: scripts can be handed to video production or a video generation model

Avoid:

- vague scenes such as “someone is learning the word”
- stiff example sentences
- over-literal Chinese translations
- cultural references that require niche knowledge
- repeating the same scene skeleton across many words
- using the target word in a misleading collocation
- IP, characters, props, or jokes becoming more memorable than the word

## Default Output Fields

When no schema is provided, use these fields:

- `word`
- `part_of_speech`
- `meaning_zh`
- `semantic_angle`
- `association`
- `scene`
- `sentence_en`
- `sentence_zh`
- `script_zh`
- `qa_status`
- `qa_notes`

For Excel output, keep values plain text with no Markdown. For JSON output, use stable lowercase keys and valid JSON.

## Batch Policy

For batches above 20 words, process in chunks and keep a QA summary per chunk. For ambiguous words, mark `needs_review` rather than guessing silently.

## Candidate Policy

Every word produces 3 candidate plans by default. The 3 candidates must be clearly different in:

- story situation
- visual style
- character type
- memory mechanism
- English sentence pattern

Do not batch-apply a fixed template across words.
