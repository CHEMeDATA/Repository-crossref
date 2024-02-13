import json

def find_zenodo_and_extract_info(data, path=None, results=None):
    if results is None:
        results = []
    if path is None:
        path = []

    if isinstance(data, dict):
        for key, value in data.items():
            new_path = path + [key]
            find_zenodo_and_extract_info(value, new_path, results)
    elif isinstance(data, list):
        for index, item in enumerate(data):
            new_path = path + [index]
            find_zenodo_and_extract_info(item, new_path, results)
    elif isinstance(data, str) and 'zenodo' in data.lower():
        # For demonstration, we'll just show the path and value containing "zenodo"
        # You need to adjust how to capture and display DOI and URL based on your JSON structure
        results.append((path, "Zenodo Value: " + data))

    return results  # Ensure we always return the list of results

def main(file_path):
    with open(file_path, 'r') as file:
        data = json.load(file)
    results = find_zenodo_and_extract_info(data)
    return results

# Adjust the file path as needed
file_path = 'bodenhausen_all.json'
zenodo_items = main(file_path)
if zenodo_items:  # Check if the list is not empty
    for item in zenodo_items:
        path, zenodo_value = item
        print(f"Path: {' -> '.join(map(str, path))}, {zenodo_value}")
else:
    print("No occurrences of 'zenodo' found.")
