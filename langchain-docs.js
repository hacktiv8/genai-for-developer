import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { ChatOllama } from "@langchain/community/chat_models/ollama";
import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";
import { similarity } from "ml-distance";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { RunnableMap, RunnableSequence } from "@langchain/core/runnables";
import { Document } from "@langchain/core/documents";
import { StringOutputParser } from "@langchain/core/output_parsers";

const model = new ChatOllama({
	model: "mistral-openorca",
	temperature: 0,
	top_k: 20,
});

// Ingestion
const embeddings = new OllamaEmbeddings({
	model: "all-minilm:l6-v2",
});

const loader = new PDFLoader("./document.pdf", { splitPages: false });
const document = await loader.load();
const splitter = new RecursiveCharacterTextSplitter({
	chunkSize: 512,
	chunkOverlap: 0,
});
const pages = await splitter.splitDocuments(document);

const store = new MemoryVectorStore(embeddings);
await store.addDocuments(pages);

// Document Retrieval in a chain
const retriever = store.asRetriever();

function convertDocsToString(documents) {
	return documents
		.map(function (document) {
			return `<doc>\n${document.pageContent}\n</doc>`;
		})
		.join("\n");
}

const documentRetrievalChain = RunnableSequence.from([
	(input) => input.question,
	retriever,
	convertDocsToString,
]);

// Synthesize a response

const TEMPLATE_STRING = `You are an experienced researcher,
expert at interpreting and answering questions based on provided sources.
Using the provided context, answer the user's question
to the best of your ability using only the resources provided.
Be verbose!

<context>

{context}

</context>

Now, answer this question using the above context:

{question}`;

const answerPrompt = ChatPromptTemplate.fromTemplate(TEMPLATE_STRING);

const runnableMap = RunnableMap.from({
	context: documentRetrievalChain,
	question: (input) => input.question,
});

// Augmented generation
const retrievalChian = RunnableSequence.from([
	{ context: documentRetrievalChain, question: (input) => input.question },
	answerPrompt,
	model,
	new StringOutputParser(),
]);

const answer = await retrievalChian.invoke({
	question: "How much revenue did GoTo Group make in q3 2022?",
});
console.log(answer);
