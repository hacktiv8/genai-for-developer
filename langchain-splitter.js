import {
	CharacterTextSplitter,
	RecursiveCharacterTextSplitter,
} from "langchain/text_splitter";
import { Document } from "langchain/document";

async function splitText(text) {
	const splitter = new RecursiveCharacterTextSplitter({
		chunkSize: 32,
		chunkOverlap: 0,
		separators: ["|", "##", ">", "-", "\n"],
	});

	const output = await splitter.splitDocuments([
		new Document({ pageContent: text }),
	]);

	return output;
}

const text = `# GenAI for Developer Course

## Introduction

This is a material for GenAI for Developer Course. This course is designed to help developers to learn about AI and how to build AI applications. This course is designed for developers who have no experience in AI.

## Example prompt

- Tell me programming joke.
`;

console.log(await splitText(text));

async function splitCode(code) {
	const splitter = new CharacterTextSplitter({
		chunkSize: 32,
		chunkOverlap: 0,
		separator: " ",
	});

	return await splitter.splitText(code);
}

async function splitJSCode(code) {
	const splitter = RecursiveCharacterTextSplitter.fromLanguage("js", {
		chunkSize: 64,
		chunkOverlap: 32,
	});

	return await splitter.splitText(code);
}

const code = `function hello(text) {
  return text.toUpperCase();
}

console.log(hello("Hi LangChain!"));  
`;
console.log(await splitCode(code));
console.log(await splitJSCode(code));