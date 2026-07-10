import { AuthModel } from "./AuthModel"
import { ConfigModel } from "./ConfigModel"
import { DevMenuModel } from "./DevMenuModel"

interface GlobalStoreStateModel {
  auth: AuthModel
  config: ConfigModel
  devMenu: DevMenuModel
}

export interface GlobalStoreModel extends GlobalStoreStateModel {}

export const GlobalStoreModel: GlobalStoreModel = {
  auth: AuthModel,
  config: ConfigModel,
  devMenu: DevMenuModel,
}
