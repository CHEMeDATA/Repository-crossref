import json
import argparse
import os

def find_and_extract_items_with_keyword(data, keyword, results=None):
    if results is None:
        results = []

    if isinstance(data, dict):
        for key, value in data.items():
            if key == 'items' and isinstance(value, list):
                for item in value:
                    if contains_keyword(item, keyword):
                        results.append(item)
            else:
                find_and_extract_items_with_keyword(value, keyword, results)
    elif isinstance(data, list):
        for item in data:
            find_and_extract_items_with_keyword(item, keyword, results)

    return results

def contains_keyword(data, keyword):
    if isinstance(data, dict):
        for value in data.values():
            if isinstance(value, (dict, list)):
                if contains_keyword(value, keyword):
                    return True
            elif isinstance(value, str) and keyword.lower() in value.lower():  # Case-insensitive search
                return True
    elif isinstance(data, list):
        for item in data:
            if contains_keyword(item, keyword):
                return True
    return False

def main(file_path, keyword):
    with open(file_path, 'r') as file:
        data = json.load(file)
    filtered_items = find_and_extract_items_with_keyword(data, keyword)

    if filtered_items:
        # If filtered items are found, proceed to generate the output file
        filtered_data = {
            "message": {
                "items": filtered_items
            }
        }

        # Generate output file name by appending the keyword before '.json'
        base, ext = os.path.splitext(file_path)
        output_file_path = f"{base}.{keyword}{ext}"

        with open(output_file_path, 'w') as outfile:
            json.dump(filtered_data, outfile, indent=4)
        print(f"Filtered data written to {output_file_path}. Number of records found: {len(filtered_items)}")
    else:
        # If no filtered items are found, skip generating the file and notify the user
        print(f"No records found with the keyword '{keyword}'. No file generated.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Filter items from a JSON file containing a specific keyword and automatically generate the output filename.')
    parser.add_argument('file_path', type=str, help='Path to the input JSON file')
    parser.add_argument('keyword', type=str, help='Keyword to search for in the JSON file')

    args = parser.parse_args()

    main(args.file_path, args.keyword)
