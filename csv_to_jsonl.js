import fs from "fs";

let formatted_data = "";

// Read csv file
const csv = fs.readFileSync("data/train.csv", "utf8");
const rows = csv.split("\n");
for (const row of rows) {
  // Take 2 columns
  const columns = row.split(",");
  // Format the data
  const data = {
    text: `<s>[INST] <<SYS>>\nYou are a customer service representative from Bank of America. Please reply customer requests using polite and respectful language.\n<<SYS>>\n\n${columns[0]}[/INST] ${columns[1]}</s>`,
  };
  formatted_data += JSON.stringify(data) + "\n";
}
console.log(formatted_data);
// Write to jsonl file
fs.writeFileSync("data/train-format-node.jsonl", formatted_data);
