const fs = require('fs');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const argv = yargs(hideBin(process.argv)).options({
  file_path: { type: 'string', demandOption: true, alias: 'f' },
  keyword: { type: 'string', demandOption: true, alias: 'k' }
}).argv;

function findKeysWithKeyword(data, keyword, path = []) {
  let matches = [];

  if (Array.isArray(data)) {
    data.forEach((item, index) => {
      matches = matches.concat(findKeysWithKeyword(item, keyword, path.concat(`[${index}]`)));
    });
  } else if (typeof data === 'object' && data !== null) {
    Object.entries(data).forEach(([key, value]) => {
      if (typeof value === 'string') {
        if (value.toLowerCase().includes(keyword.toLowerCase())) {
          matches.push({ path: path.concat(key).join(' -> '), value });
        }
      } else {
        matches = matches.concat(findKeysWithKeyword(value, keyword, path.concat(key)));
      }
    });
  }
  return matches;
}


function processItems(items, keyword) {
  return items.map(item => {
    const keysWithKeyword = findKeysWithKeyword(item, keyword);
    return { item, keysWithKeyword };
  }).filter(result => result.keysWithKeyword.length > 0);
}

function generateHTML(filteredItems, keyword, fileName) {
  let htmlContent = `<html>
<head>
  <title>Search Results for '${keyword}'</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .item { margin-bottom: 20px; }
    .title, .doi, .publisher, .source, .type, .matches, .urls { margin-bottom: 5px; }
    .keys, .urls { font-style: italic; }
  </style>
</head>
<body>
  <h1>Search Results for '${keyword}'</h1>
  <h2>from '${fileName}'</h2>`;

  filteredItems.forEach(({ item, keysWithKeyword }, index) => {
    const urls = keysWithKeyword.filter(({value}) => value.includes('zenodo')).map(({value}) => value);
    
    htmlContent += `
  <div class="item">
    <div>Item Number: ${index + 1}</div>
    ${item.DOI ? `<div class="doi">DOI: ${item.DOI}</div>` : ''}
    ${item.title ? `<div class="title">Title: ${item.title}</div>` : ''}
    ${item.publisher ? `<div class="publisher">Publisher: ${item.publisher}</div>` : ''}
    ${item.source ? `<div class="source">Source: ${item.source}</div>` : ''}
    ${item.type ? `<div class="type">Type: ${item.type}</div>` : ''}
    <div class="keys">Keys containing '${keyword}': ${keysWithKeyword.map(k => k.path).join(', ')}</div>
    ${urls.length > 0 ? `<div class="urls">URLs: ${urls.join(', ')}</div>` : ''}
  </div>`;
  });

  htmlContent += `</body></html>`;
  return htmlContent;
}

function main() {
  const { file_path, keyword } = argv;
  
  fs.readFile(file_path, { encoding: 'utf-8' }, (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      return;
    }

    const jsonData = JSON.parse(data);
    if (!jsonData.message || !Array.isArray(jsonData.message.items)) {
      console.error('Invalid JSON structure: "message -> items" not found');
      return;
    }

    const filteredResults = processItems(jsonData.message.items, keyword);
    if (filteredResults.length > 0) {
      const outputPath = file_path.replace('.json', `.${keyword}.json`);
      const outputData = { message: { items: filteredResults.map(result => result.item) } };
      
      // Write JSON file
      fs.writeFile(outputPath, JSON.stringify(outputData, null, 2), err => {
        if (err) {
          console.error('Error writing JSON file:', err);
          return;
        }
        console.log(`Filtered data written to ${outputPath}`);
      });

      // Generate and write HTML file
      const htmlOutputPath = outputPath.replace('.json', '.html');
      const htmlContent = generateHTML(filteredResults, keyword, file_path);
      fs.writeFile(htmlOutputPath, htmlContent, err => {
        if (err) {
          console.error('Error writing HTML file:', err);
          return;
        }
        console.log(`HTML report written to ${htmlOutputPath}`);
      });
    } else {
      console.log(`No items found with the keyword '${keyword}'.`);
    }
  });
}

main();
