# GenAI for Developer Course

## Introduction

This is a material for GenAI for Developer Course. This course is designed to help developers to learn about AI and how to build AI applications. This course is designed for developers who have no experience in AI.

## Customize model

### Create Modelfile

```
FROM mistral-openorca
PARAMETER temperature 0.8
SYSTEM You are a financial assistant, you help classify expenses and income from bank transactions.
```

### Create a new model

``` bash
$ ollama create expense_analyzer_openorca -f ./expense_analyzer
transferring model data
using existing layer sha256:6504ba23a37160de70db611212815c9aab171864d206b8c013b72fd0b16e19eb
using existing layer sha256:ecf1d3ca1fb53d793cbaac0d1928dfa4cfea479cb9c746a09823ec5875cee90c
creating new layer sha256:a97cc050526f54523f68a8d722153f9d06d47372ce2d27856ad86a5877cf92ea
creating new layer sha256:b64f7d9afcadc8a54368eaffd0b7ec0de3e4dc1b15050bc037353c1fc407c88b
creating new layer sha256:ef8341da444f3b4becaeb5c3dc3450aabbb90f1b808e87137e23388d06af902e
writing manifest
success

```

```bash
$ ollama list
$ ollama run expense_analyzer_openorca
```

## Example question

- What is your name?
