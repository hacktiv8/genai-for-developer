async function generate(prompt) {
  const res = await fetch("http://localhost:8188/prompt", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt }),
  });

  const data = await res.json();
  return data;
}

function createPromptString(prompt, seed = 156680208700286) {
  return JSON.parse(`{
  "3": {
    "inputs": {
      "seed": ${seed},
      "steps": 20,
      "cfg": 8,
      "sampler_name": "euler",
        "scheduler": "normal",
      "denoise": 1,
      "model": [
        "4",
        0
      ],
      "positive": [
        "6",
        0
      ],
      "negative": [
        "7",
        0
      ],
      "latent_image": [
        "5",
        0
      ]
    },
    "class_type": "KSampler",
    "_meta": {
      "title": "KSampler"
    }
  },
  "4": {
    "inputs": {
      "ckpt_name": "epicrealism_naturalSinRC1VAE.safetensors"
    },
    "class_type": "CheckpointLoaderSimple",
    "_meta": {
      "title": "Load Checkpoint"
    }
  },
  "5": {
    "inputs": {
      "width": 512,
      "height": 512,
      "batch_size": 1
    },
    "class_type": "EmptyLatentImage",
    "_meta": {
      "title": "Empty Latent Image"
    }
  },
  "6": {
    "inputs": {
      "text": "${prompt}",
      "clip": [
        "4",
        1
      ]
    },
    "class_type": "CLIPTextEncode",
    "_meta": {
      "title": "CLIP Text Encode (Prompt)"
    }
  },
  "7": {
    "inputs": {
      "text": "text, watermark",
      "clip": [
        "4",
        1
      ]
    },
    "class_type": "CLIPTextEncode",
    "_meta": {
      "title": "CLIP Text Encode (Prompt)"
    }
  },
  "8": {
    "inputs": {
      "samples": [
        "3",
        0
      ],
      "vae": [
        "4",
        2
      ]
    },
    "class_type": "VAEDecode",
    "_meta": {
      "title": "VAE Decode"
    }
  },
  "9": {
    "inputs": {
      "filename_prefix": "ComfyUI",
      "images": [
        "8",
        0
      ]
    },
    "class_type": "SaveImage",
    "_meta": {
      "title": "Save Image"
    }
  }
}`);
}

async function get_image(prompt_id) {
  const res = await fetch(`http://localhost:8188/history`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await res.json();
  return data[prompt_id];
}

const prompt = createPromptString(
  "Blue cafe with a cozy atmosphere, a place to relax and enjoy a cup of coffee.",
  23253,
);

const data = await generate(prompt);

let image = await get_image(data.prompt_id);
while (image?.status.completed !== true) {
  image = await get_image(data.prompt_id);
  console.log("Image not ready, waiting...");
  await new Promise((resolve) => setTimeout(resolve, 3000));
}
const lastImage = image.outputs["9"].images[0];
const filepath = `~/Documents/StabilityMatrix/Packages/ComfyUI/${lastImage.type}/${lastImage.filename}`;
console.log(filepath);
console.log(
  `http://localhost:8188/view?filename=${lastImage.filename}&type=${lastImage.type}&subfolder=${lastImage.subfolder}`,
);
