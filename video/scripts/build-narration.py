#!/usr/bin/env python3
"""Build the RE:STACK demo narration with Microsoft Edge neural TTS.

The final track is 57.1 s so it can be placed as one root-level <audio> clip.
Requires: python -m pip install --user edge-tts, plus ffmpeg/ffprobe on PATH.
"""

from __future__ import annotations

import asyncio
import json
import shutil
import subprocess
import sys
from pathlib import Path

import edge_tts

ROOT = Path(__file__).resolve().parents[1]
SEGMENTS = ROOT / "assets" / "audio" / "segments"
OUT = ROOT / "assets" / "audio" / "narration.wav"
DURATION = 57.1

VOICE = "en-US-AndrewMultilingualNeural"
RATE = "+6%"
PITCH = "-2Hz"

# (start seconds, end of available window, line)
LINES = [
    (0.35, 4.85, "RE:STACK. Old cards. New connections."),
    (5.20, 10.20, "A place for ideas to begin. Card-sized thinking, modern browser."),
    (10.50, 18.80, "Write a thought. Add tags. Every edit saves locally. No account, no detour."),
    (19.50, 27.20, "Connect one card to another. Backlinks appear automatically, so every trail works in both directions."),
    (27.80, 32.60, "One shortcut searches titles, notes, and tags."),
    (33.00, 43.60, "Step back into the constellation. Focus a node, follow its neighbors, and reopen the thought."),
    (44.20, 49.80, "Your stack stays yours. Export the complete workspace as open JSON."),
    (50.45, 56.60, "RE:STACK. Keep the stack. Lose the silo."),
]


def probe_duration(path: Path) -> float:
    out = subprocess.check_output(
        [
            "ffprobe",
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "default=noprint_wrappers=1:nokey=1",
            str(path),
        ],
        text=True,
    )
    return float(out.strip())


async def synth_line(index: int, text: str) -> Path:
    target = SEGMENTS / f"{index:02d}.mp3"
    communicate = edge_tts.Communicate(text, VOICE, rate=RATE, pitch=PITCH)
    await communicate.save(str(target))
    return target


async def main() -> int:
    if shutil.which("ffmpeg") is None or shutil.which("ffprobe") is None:
        raise SystemExit("ffmpeg and ffprobe must be on PATH")
    SEGMENTS.mkdir(parents=True, exist_ok=True)

    records = []
    for index, (start, window_end, text) in enumerate(LINES, start=1):
        path = await synth_line(index, text)
        duration = probe_duration(path)
        records.append(
            {
                "index": index,
                "start": start,
                "window_end": window_end,
                "duration": round(duration, 3),
                "end": round(start + duration, 3),
                "fits": start + duration <= window_end,
                "text": text,
                "file": str(path.relative_to(ROOT)).replace("\\", "/"),
            }
        )

    manifest = ROOT / "assets" / "audio" / "narration-timing.json"
    manifest.write_text(json.dumps(records, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(records, indent=2))

    if not all(record["fits"] for record in records):
        print("Some lines overflow their caption windows; adjust text or rate.", file=sys.stderr)
        return 2

    inputs: list[str] = []
    filters: list[str] = []
    for index, record in enumerate(LINES, start=1):
        inputs += ["-i", str(SEGMENTS / f"{index:02d}.mp3")]
        delay_ms = round(record[0] * 1000)
        filters.append(
            f"[{index - 1}:a]aresample=48000,aformat=channel_layouts=stereo,"
            f"adelay={delay_ms}|{delay_ms}[a{index}]"
        )
    mix_inputs = "".join(f"[a{index}]" for index in range(1, len(LINES) + 1))
    filters.append(
        f"{mix_inputs}amix=inputs={len(LINES)}:normalize=0:dropout_transition=0,"
        "loudnorm=I=-16:TP=-1.5:LRA=11,"
        f"apad=whole_dur={DURATION},atrim=0:{DURATION},afade=t=out:st={DURATION - 0.35}:d=0.35[out]"
    )

    command = [
        "ffmpeg",
        "-y",
        *inputs,
        "-filter_complex",
        ";".join(filters),
        "-map",
        "[out]",
        "-ar",
        "48000",
        "-ac",
        "2",
        "-c:a",
        "pcm_s16le",
        str(OUT),
    ]
    subprocess.run(command, check=True)
    print(f"wrote {OUT} ({probe_duration(OUT):.3f}s)")
    return 0


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
