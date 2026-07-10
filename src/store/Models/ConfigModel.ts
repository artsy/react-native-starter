import { EnvironmentModel } from "./EnvironmentModel"

interface ConfigModelState {
  environment: EnvironmentModel
}

export type ConfigModel = ConfigModelState

export const ConfigModel: ConfigModel = {
  environment: EnvironmentModel,
}
