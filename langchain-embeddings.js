import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";
import { similarity } from "ml-distance";

async function vectorize(text) {
	const embeddings = new OllamaEmbeddings({
		model: "all-minilm:l6-v2",
	});
	return await embeddings.embedQuery(text);
}

async function compare(vector1, vector2) {
	return similarity.cosine(vector1, vector2);
}

const vector1 = await vectorize(
	"What are vectors useful for in machine learning?",
);

const vector2 = await vectorize("Vectors are representations of information.");

const vector3 = await vectorize("A group of parrots is called a pandemonium.");

console.log(await compare(vector1, vector2));
console.log(await compare(vector1, vector3));