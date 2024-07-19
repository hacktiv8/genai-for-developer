import fs from "fs";

function toBase64(filepath) {
  const image = fs.readFileSync(filepath);

  return Buffer.from(image).toString("base64");
}

const base64Image = toBase64("./bear-multimodal.png");

const res = await fetch("http://localhost:11434/api/generate", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "llava",
    prompt: "What is in the image?",
    images: [base64Image],
    stream: false,
  }),
});

const data = await res.json();
console.log(data);
