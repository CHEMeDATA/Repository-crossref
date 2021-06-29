# Repository-crossref

[Crossref on wikipedia](https://en.wikipedia.org/wiki/Crossref)

## Searches

[Information about the API](https://github.com/CrossRef/rest-api-doc#crossref-rest-api)

Only Crossref DOIs can be tested.
Example:
```
https://api.crossref.org/works/10.1037/0003-066X.59.1.29/agency
https://api.crossref.org/works/10.1021/acs.orglett.0c00788
```
To determine if member ID 98 exists:
```
curl --head "https://api.crossref.org/members/98"
```

To determine if a journal with ISSN 1549-7712 exists:
```
curl --head "https://api.crossref.org/journals/1549-7712"
```
To select a subset of elements 
```
curl --head "https://api.crossref.org/works?sample=10&select=DOI,title"
```

[Info on components](https://github.com/CrossRef/rest-api-doc#resource-components)

[Info on components](https://github.com/CrossRef/rest-api-doc#resource-components-and-identifiers)

More documentation on https://github.com/CrossRef/rest-api-doc#crossref-rest-api
