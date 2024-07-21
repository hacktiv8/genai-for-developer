import { exec } from "child_process";
import fs from "fs";

import { generate } from "./llm.js";

const filename = "video-yt";

exec(
  `pipx run openai-whisper ${filename}.mp4 --language id --model medium --output_format srt --task transcribe`,
  async function (error, stdout, stderr) {
    if (error) {
      console.error(`exec error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
    }
    const subtitle = fs.readFileSync(`${filename}.srt`, "utf8");
    const prompt = `Summarize the video transcription delimited by triple dash below

---
${subtitle}
---`;
    const result = await generate(prompt);
    console.log(result);
  },
);
