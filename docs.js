import { readPdfPages } from "pdf-text-reader";

const FEATURE_MODEL = "Xenova/paraphrase-MiniLM-L3-v2";

export function pdfObjectToPages(pdfObject) {
	const pages = pdfObject.map((page, number) => {
		return { number, content: page.lines.join(" ") };
	});
	return pages;
}

export function sequence(n) {
	return Array.from({ length: n }, (_, i) => i);
}

export function pagesToPagination(pages) {
	return sequence(pages.length).map((k) =>
		pages.slice(0, k + 1).reduce((loc, page) => loc + page.content.length, 0),
	);
}

export function split(text) {
	const isPunctuator = (ch) => ch === "." || ch === "!" || ch === "?";
	const isWhiteSpace = (ch) => ch === " " || ch === "\n" || ch === "\t";

	const chunks = [];
	let str = "";
	let offset = 0;
	for (let i = 0; i < text.length; ++i) {
		const ch1 = text[i];
		const ch2 = text[i + 1];
		if (isPunctuator(ch1) && isWhiteSpace(ch2)) {
			str += ch1;
			const text = str.trim();
			chunks.push({ offset, text });
			str = "";
			offset = i + 1;
			continue;
		}
		str += ch1;
	}
	if (str.length > 0) {
		chunks.push({ offset, text: str.trim() });
	}
	return chunks;
}

export async function vectorize(text) {
	const transformers = await import("@xenova/transformers");
	const { pipeline } = transformers;
	const extractor = await pipeline("feature-extraction", FEATURE_MODEL, {
		quantized: true,
	});

	const chunks = split(text);
	const result = [];
	for (let index = 0; index < chunks.length; index++) {
		const { offset } = chunks[index];
		const sentence = chunks
			.slice(index, index + 3)
			.map(({ text }) => text)
			.join(" ");
		const output = await extractor([sentence], {
			pooling: "mean",
			normalize: true,
		});
		result.push({ index, offset, sentence, vector: output[0].data });
	}
	return result;
}

export const paginate = (entries, pagination) =>
	entries.map((entry) => {
		const { offset } = entry;
		const page = pagination.findIndex((i) => i > offset);
		return { page, ...entry };
	});

export async function ingest(url) {
	console.log("INGEST:");
	const input = await readPdfPages({ url });
	console.log(" url:", url);
	const pages = pdfObjectToPages(input);
	console.log(" pages count:", pages.length);
	const pagination = pagesToPagination(pages);
	const text = pages.map((page) => page.content).join(" ");
	const start = Date.now();
	const document = paginate(await vectorize(text), pagination);
	const elapsed = Date.now() - start;
	console.log(" vectorization time:", elapsed, "ms");
	console.info(" Ingestion finish.");

	return document;
}