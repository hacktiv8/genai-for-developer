import { expect, test } from "vitest";
import { readPdfPages } from "pdf-text-reader";
import {
	ingest,
	split,
	sequence,
	pagesToPagination,
	paginate,
	pdfObjectToPages,
	vectorize,
} from "../docs.js";

test("Read pdf document and convert it to object", async function () {
	const input = await readPdfPages({ url: "./test/fixtures/document.pdf" });
	const pages = pdfObjectToPages(input);
	expect(pages).toBeTypeOf("object");
	expect(pages.length).toEqual(5);
});

test("Sequence function", function () {
	const seq = sequence(5);
	expect(seq.length).toEqual(5);
	expect(seq).toBeTypeOf("object");
	expect(seq[0]).toEqual(0);
});

test("Pagination function", async function () {
	const input = await readPdfPages({ url: "./test/fixtures/document.pdf" });
	const pages = pdfObjectToPages(input);
	const pagination = pagesToPagination(pages);
	expect(pagination.length).toEqual(5);
	expect(pagination[0]).toEqual(3694);
	expect(pagination[1]).toEqual(6815);
});

test("Split function", function () {
	const text = "Hello World!\nThis is a test.\tAnother test.\n2";
	const chunks = split(text);
	expect(chunks).toBeTypeOf("object");
	expect(chunks.length).toEqual(4);
	expect(chunks).toEqual([
		{ offset: 0, text: "Hello World!" },
		{ offset: 12, text: "This is a test." },
		{ offset: 28, text: "Another test." },
		{ offset: 42, text: "2" },
	]);
});

test("Vectorize function", { timeout: 10000 }, async function () {
	const text =
		"Hello World!\nThis is a test.\tAnother test.\n2\n\n\nThis is another long sentence that should be split into multiple chunks.";
	const result = await vectorize(text);
	expect(result).toBeTypeOf("object");
	expect(result.length).toEqual(4);
	expect(result).toHaveProperty("0.index");
	expect(result).toHaveProperty("0.offset");
	expect(result).toHaveProperty("0.sentence");
	expect(result).toHaveProperty("0.vector");
});

test("Paginate function", async function () {
	const input = await readPdfPages({ url: "./test/fixtures/document.pdf" });
	const pages = pdfObjectToPages(input);
	const pagination = pagesToPagination(pages);
	const text = pages.map((page) => page.content).join(" ");
	const document = paginate(await vectorize(text), pagination);
	expect(document).toBeTypeOf("object");
	expect(document.length).toEqual(88);
	expect(document).toHaveProperty("0.page");
	expect(document).toHaveProperty("0.index");
	expect(document).toHaveProperty("0.offset");
	expect(document).toHaveProperty("0.sentence");
	expect(document).toHaveProperty("0.vector");
});

test("Ingest function", async function () {
	const url = "./test/fixtures/document.pdf";
	const document = await ingest(url);
	expect(document).toBeTypeOf("object");
	expect(document.length).toEqual(88);
	expect(document).toHaveProperty("0.page");
	expect(document).toHaveProperty("0.index");
	expect(document).toHaveProperty("0.offset");
	expect(document).toHaveProperty("0.sentence");
	expect(document).toHaveProperty("0.vector");
});