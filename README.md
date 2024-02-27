# @nrd/fua.app.datastore

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

### POST

Use the endpoint to query a dataset with custom syntax or to change the ACL.

### PATCH

Append quads to a dataset at the endpoint.

### DELETE

Remove quads from a dataset at the endpoint or remove the whole dataset.
