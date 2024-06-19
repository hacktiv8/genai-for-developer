import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

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

console.log(await pdfLoader("./document.pdf"));