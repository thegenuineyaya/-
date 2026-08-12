# Output Format

## Default Fields

Append these fields unless the user provides another schema:

- `visual_style`
- `continuity_card`
- `video_prompt_zh`
- `negative_prompt`
- `duration`
- `aspect_ratio`
- `qa_notes`

Optional:

- `video_prompt_en`
- `scene_core`
- `camera_design`
- scene_playwright

## Chat Preview

Use:

```text
word | visual_style | video_prompt_zh | negative_prompt | qa_notes
```

## JSON

Use:

```json
{
  "word": "",
  "meaning": "",
  "sentence_en": "",
  "visual_style": "",
  "continuity_card": "",
  "video_prompt_zh": "",
  "negative_prompt": "",
  "duration": "5-8s",
  "aspect_ratio": "9:16",
  "qa_notes": ""
}
```

## Spreadsheet Rules

Never rename, omit, overwrite, or delete user-provided headers.

Append generated columns after existing columns unless the user asks otherwise.

Keep uncertain rows present with `qa_notes`.
