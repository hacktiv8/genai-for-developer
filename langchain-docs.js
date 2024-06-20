import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

async function repoLoader(url) {
	const repo = new GithubRepoLoader(url, {
		recursive: false,
		ignorePaths: ["*.md", "yarn.lock"],
	});
	return await repo.load();
}

console.log(await repoLoader("https://github.com/langchain-ai/langchainjs"));

async function pdfLoader(path) {
	const pdf = new PDFLoader(path);
	return await pdf.load();
}

async function pdfSplitter(doc) {
	const splitter = new RecursiveCharacterTextSplitter({
		chunkSize: 512,
		chunkOverlap: 64,
	});

	return await splitter.splitDocuments(doc);
}

const doc = await pdfLoader("./document.pdf");
console.log(doc.slice(0, 3));
console.log("-------------- SPLITTER ----------------");

console.log((await pdfSplitter(doc)).slice(0, 3));