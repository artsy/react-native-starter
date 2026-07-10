/**
 * @generated SignedSource<<40eb3b8f72956e840f31a08a62bd0a58>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type HomeUserTestQuery$variables = Record<PropertyKey, never>;
export type HomeUserTestQuery$data = {
  readonly me: {
    readonly " $fragmentSpreads": FragmentRefs<"HomeUser_me">;
  } | null | undefined;
};
export type HomeUserTestQuery = {
  response: HomeUserTestQuery$data;
  variables: HomeUserTestQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "String"
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "HomeUserTestQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "Me",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "HomeUser_me"
          }
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
    "name": "HomeUserTestQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "Me",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "email",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "name",
            "storageKey": null
          },
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
    "cacheID": "20368938ba971276ecffb12236326ea1",
    "id": null,
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "me": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Me"
        },
        "me.email": (v0/*: any*/),
        "me.id": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "ID"
        },
        "me.name": (v0/*: any*/)
      }
    },
    "name": "HomeUserTestQuery",
    "operationKind": "query",
    "text": "query HomeUserTestQuery {\n  me {\n    ...HomeUser_me\n    id\n  }\n}\n\nfragment HomeUser_me on Me {\n  email\n  name\n}\n"
  }
};
})();

(node as any).hash = "d8e81df99a5f66cb2c17d15d568c5caa";

export default node;
