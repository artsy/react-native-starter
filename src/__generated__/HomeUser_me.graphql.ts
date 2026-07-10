/**
 * @generated SignedSource<<0eeda5b3f354b69802340b9426f5c923>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type HomeUser_me$data = {
  readonly email: string | null | undefined;
  readonly name: string | null | undefined;
  readonly " $fragmentType": "HomeUser_me";
};
export type HomeUser_me$key = {
  readonly " $data"?: HomeUser_me$data;
  readonly " $fragmentSpreads": FragmentRefs<"HomeUser_me">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "HomeUser_me",
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
    }
  ],
  "type": "Me",
  "abstractKey": null
};

(node as any).hash = "b01dbd9dd968ca63f6994e732356582d";

export default node;
