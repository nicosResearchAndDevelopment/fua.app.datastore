# @fua/app.datastore

## Web Access Control

- https://solid.github.io/web-access-control-spec/
- https://www.w3.org/wiki/WebAccessControl
- https://www.w3.org/ns/auth/acl

```
┌───────────────┐
│ Authorization │
└───────────────┘
   │    │    │  accessTo
   │    │    │  default    ┌─────────────────────┐
   │    │    └────────────>│ InformationResource │
   │    │                  └─────────────────────┘
   │    │  mode   ┌────────┐
   │    └────────>│ Access │────┬─ Read (GET)
   │              └────────┘    ├─ Write (PUT, POST, PATCH, DELETE)
   │  agent                     ├─ Append (POST, PATCH)
   │  agentClass   ┌────────┐   └─ Control (Read and Write on ACL)
   │  agentGroup   │ Agent  │
   │  origin       │ Class  │
   └──────────────>│ Group  │
                   │ Origin │
                   └────────┘
```

## Rest-API

### GET

Retrieve quads from a dataset at the endpoint or get the whole dataset.

#### GET "/example"

```http request
GET /example
Accept: text/turtle
```

- **BaseURI:** `<origin>/example`
- **FilePath:** `<root>/example.ttl`
- **ACL-Files:** `<root>/example.acl` `<root>/index.acl`

#### GET "/"

```http request
GET /
Accept: text/turtle
```

- **BaseURI:** `<origin>/`
- **FilePath:** `<root>/index.ttl`
- **ACL-Files:** `<root>/index.acl`

### PUT

Create a new dataset at the endpoint, optionally with the supplied quads.

#### PUT "/test"

```http request
PUT /test
Content-Type: text/turtle

@prefix rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix owl:  <http://www.w3.org/2002/07/owl#> .
@prefix xsd:  <http://www.w3.org/2001/XMLSchema#> .

<#test>
    a rdfs:Resource ;
    rdfs:label "Test"@en ;
.
```

### POST

Use the endpoint to query a dataset with custom syntax or to change the ACL.

### PATCH

Append quads to a dataset at the endpoint.

#### PATCH "/test"

```http request
PATCH /test
Content-Type: text/turtle

@prefix rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix owl:  <http://www.w3.org/2002/07/owl#> .
@prefix xsd:  <http://www.w3.org/2001/XMLSchema#> .

<#test>
    rdfs:label "Test"@de ;
.
```

### DELETE

Remove quads from a dataset at the endpoint or remove the whole dataset.

#### DELETE "/test"

```http request
DELETE /test
Content-Type: text/turtle

@prefix rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix owl:  <http://www.w3.org/2002/07/owl#> .
@prefix xsd:  <http://www.w3.org/2001/XMLSchema#> .

<#test>
    rdfs:label "Test"@en ;
.
```

#### DELETE "/test?subject=%3C%23test%3E"

> **TODO** define extended syntax for deleteMatches

```http request
DELETE /test
Content-Type: application/x-www-form-urlencoded

subject=%3C%23test%3E
```

```http request
DELETE /test?subject=%3C%23test%3E
```

```http request
DELETE /test
Content-Type: application/json

{
  "subject": {
    "termType": "NamedNode",
    "value": "<test#>"
  }
}
```

```http request
DELETE /test?subject=eyJ0ZXJtVHlwZSI6Ik5hbWVkTm9kZSIsInZhbHVlIjoiPHRlc3QjPiJ9
```

```http request
DELETE /test?match=eyJzdWJqZWN0Ijp7InRlcm1UeXBlIjoiTmFtZWROb2RlIiwidmFsdWUiOiI8dGVzdCM-In19
```
