/**
 * @generated SignedSource<<fd6e0849d35031bd1213e9f2717d0f2b>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type useSystemQueryLoaderTestQuery$variables = Record<PropertyKey, never>;
export type useSystemQueryLoaderTestQuery$data = {
  readonly me: {
    readonly name: string | null | undefined;
  } | null | undefined;
};
export type useSystemQueryLoaderTestQuery = {
  response: useSystemQueryLoaderTestQuery$data;
  variables: useSystemQueryLoaderTestQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "useSystemQueryLoaderTestQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "Me",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          (v0/*: any*/)
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "useSystemQueryLoaderTestQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "Me",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          (v0/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "c5abcfd06b351319406bca5f2131b52d",
    "id": null,
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "me": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Me"
        },
        "me.id": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "ID"
        },
        "me.name": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "String"
        }
      }
    },
    "name": "useSystemQueryLoaderTestQuery",
    "operationKind": "query",
    "text": "query useSystemQueryLoaderTestQuery {\n  me {\n    name\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "3d57fe4f56d88eac0eac315c90bcbca9";

export default node;
