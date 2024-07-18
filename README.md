# GenAI for Developer Course

## Introduction

This is a material for GenAI for Developer Course. This course is designed to help developers to learn about AI and how to build AI applications. This course is designed for developers who have no experience in AI.

## Fine-tune model

### Prepare data

Get some csv file or any data file.

### Format data

Convert original data file into preffered data file. Commonly jsonl or parquet.

### Test Formatted data

Instal together CLI with python3, or using pipx. In order to run together cli, you need API key. Please register and get API key and put it in `.env` file.

``` bash
$ source .env # or simply run export TOGETHER_API_KEY=blablabla
$ pipx run together files check "data/train-format-node.jsonl"
{
    "is_check_passed": true,
    "message": "Checks passed",
    "found": true,
    "file_size": 215451,
    "utf8": true,
    "line_type": true,
    "text_field": true,
    "key_value": true,
    "min_samples": true,
    "num_samples": 649,
    "load_json": true,
    "filetype": "jsonl"
}
```

### Upload dataset

``` bash
pipx run together files upload "data/train-format-node.jsonl"
Uploading file train-format-node.jsonl: 100%|███████████████████████████| 215k/215k [00:02<00:00, 101kB/s]
{
    "id": "file-594b17e8-955c-4548-8303-5294ae60c933",
    "object": "file",
    "created_at": 1721299335,
    "type": null,
    "purpose": "fine-tune",
    "filename": "train-format-node.jsonl",
    "bytes": 0,
    "line_count": 0,
    "processed": false,
    "FileType": "jsonl"
}
```

### Fine tune

``` bash
pipx run together fine-tuning create --training-file "file-594b17e8-955c-4548-8303-5294ae60c933" --model
 "teknium/OpenHermes-2p5-Mistral-7B"
{
    "id": "ft-fe94af08-1c61-41d2-8494-6d7ff5386262",
    "training_file": "file-594b17e8-955c-4548-8303-5294ae60c933",
    "validation_file": "",
    "model": "teknium/OpenHermes-2p5-Mistral-7B",
    "output_name": "rizafahmi@gmail.com/OpenHermes-2p5-Mistral-7B-2024-07-18-11-05-06",
    "n_epochs": 1,
    "n_checkpoints": 1,
    "batch_size": 32,
    "learning_rate": 3e-05,
    "eval_steps": 0,
    "lora": null,
    "lora_r": null,
    "lora_alpha": null,
    "lora_dropout": null,
    "created_at": "2024-07-18T11:05:06.9Z",
    "updated_at": "2024-07-18T11:05:06.9Z",
    "status": "pending",
    ...
}
```

### Convert fine-tuned model

Download the file. Convert into gguf format using llama.cpp.

``` bash
git clone https://github.com/ggerganov/llama.cpp.git
cd llama.cpp
```

#### Create Python project env

In order to run conversion app, we need to install some python requirements.

``` bash
python -m venv venv
source venv/bin/activate
pip freeze # to check it's working

```

#### Run conversion

``` bash
python convert_hf_to_gguf.py csmodel/ --outfile csmodel.q8_0.gguf --outtype q8_0
```

### Create Model for Ollama
#### Create Modelfile

```
FROM ./csmodel.q8_0.gguf
```

#### Create the model

``` bash
ollama create mistral-csmodel -f Modelfile
ollama list
ollama run mistral-csmodel
```

## Example question

- What is your name?
