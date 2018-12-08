// Libraries
import _ from 'lodash'

// Apis
import {writeLineProtocol} from 'src/onboarding/apis/index'
import {telegrafsAPI} from 'src/utils/api'

// Utils
import {createNewPlugin} from 'src/onboarding/utils/pluginConfigs'

// Types
import {
  TelegrafPlugin,
  DataLoaderType,
  LineProtocolTab,
  Plugin,
} from 'src/types/v2/dataLoaders'
import {AppState} from 'src/types/v2'
import {RemoteDataState} from 'src/types'
import {TelegrafPluginOutputInfluxDBV2} from 'src/api'

type GetState = () => AppState

export type Action =
  | SetDataLoadersType
  | SetTelegrafConfigID
  | AddTelegrafPlugin
  | UpdateTelegrafPluginConfig
  | AddTelegrafPluginConfigFieldValue
  | RemoveTelegrafPluginConfigFieldValue
  | RemoveTelegrafPlugin
  | SetActiveTelegrafPlugin
  | SetLineProtocolText
  | SetActiveLPTab
  | SetLPStatus
  | UpdateTelegrafPlugin

interface SetDataLoadersType {
  type: 'SET_DATA_LOADERS_TYPE'
  payload: {type: DataLoaderType}
}

export const setDataLoadersType = (
  type: DataLoaderType
): SetDataLoadersType => ({
  type: 'SET_DATA_LOADERS_TYPE',
  payload: {type},
})

interface AddTelegrafPlugin {
  type: 'ADD_TELEGRAF_PLUGIN'
  payload: {telegrafPlugin: TelegrafPlugin}
}

export const addTelegrafPlugin = (
  telegrafPlugin: TelegrafPlugin
): AddTelegrafPlugin => ({
  type: 'ADD_TELEGRAF_PLUGIN',
  payload: {telegrafPlugin},
})

interface UpdateTelegrafPluginConfig {
  type: 'UPDATE_TELEGRAF_PLUGIN_CONFIG'
  payload: {name: string; field: string; value: string}
}

export const updateTelegrafPluginConfig = (
  name: string,
  field: string,
  value: string
): UpdateTelegrafPluginConfig => ({
  type: 'UPDATE_TELEGRAF_PLUGIN_CONFIG',
  payload: {name, field, value},
})

interface UpdateTelegrafPlugin {
  type: 'UPDATE_TELEGRAF_PLUGIN'
  payload: {plugin: Plugin}
}

export const updateTelegrafPlugin = (plugin: Plugin): UpdateTelegrafPlugin => ({
  type: 'UPDATE_TELEGRAF_PLUGIN',
  payload: {plugin},
})

interface AddTelegrafPluginConfigFieldValue {
  type: 'ADD_TELEGRAF_PLUGIN_CONFIG_FIELD_VALUE'
  payload: {
    pluginName: string
    fieldName: string
    value: string
  }
}

export const addTelegrafPluginConfigFieldValue = (
  pluginName: string,
  fieldName: string,
  value: string
) => ({
  type: 'ADD_TELEGRAF_PLUGIN_CONFIG_FIELD_VALUE',
  payload: {pluginName, fieldName, value},
})

interface RemoveTelegrafPluginConfigFieldValue {
  type: 'REMOVE_TELEGRAF_PLUGIN_CONFIG_FIELD_VALUE'
  payload: {
    pluginName: string
    fieldName: string
    value: string
    index: number
  }
}

export const removeTelegrafPluginConfigFieldValue = (
  pluginName: string,
  fieldName: string,
  value: string
) => ({
  type: 'REMOVE_TELEGRAF_PLUGIN_CONFIG_FIELD_VALUE',
  payload: {pluginName, fieldName, value},
})

interface SetTelegrafConfigID {
  type: 'SET_TELEGRAF_CONFIG_ID'
  payload: {id: string}
}

export const setTelegrafConfigID = (id: string): SetTelegrafConfigID => ({
  type: 'SET_TELEGRAF_CONFIG_ID',
  payload: {id},
})

export const createTelegrafConfigAsync = (authToken: string) => async (
  dispatch,
  getState: GetState
) => {
  const {
    onboarding: {
      dataLoaders: {telegrafPlugins},
      steps: {
        setupParams: {org, bucket},
      },
    },
  } = getState()

  const plugins = telegrafPlugins.map(
    tp => tp.plugin || createNewPlugin(tp.name)
  )

  const influxDB2Out = {
    name: TelegrafPluginOutputInfluxDBV2.NameEnum.InfluxdbV2,
    type: TelegrafPluginOutputInfluxDBV2.TypeEnum.Output,
    config: {
      urls: ['http://127.0.0.1:9999'],
      token: authToken,
      organization: org,
      bucket,
    },
  }

  plugins.push(influxDB2Out)

  const body = {
    name: 'new config',
    agent: {collectionInterval: 15},
    plugins,
  }
  const created = await telegrafsAPI.telegrafsPost(org, body)
  dispatch(setTelegrafConfigID(created.data.id))
}

interface RemoveTelegrafPlugin {
  type: 'REMOVE_TELEGRAF_PLUGIN'
  payload: {telegrafPlugin: string}
}

export const removeTelegrafPlugin = (
  telegrafPlugin: string
): RemoveTelegrafPlugin => ({
  type: 'REMOVE_TELEGRAF_PLUGIN',
  payload: {telegrafPlugin},
})

interface SetActiveTelegrafPlugin {
  type: 'SET_ACTIVE_TELEGRAF_PLUGIN'
  payload: {telegrafPlugin: string}
}

export const setActiveTelegrafPlugin = (
  telegrafPlugin: string
): SetActiveTelegrafPlugin => ({
  type: 'SET_ACTIVE_TELEGRAF_PLUGIN',
  payload: {telegrafPlugin},
})

interface SetLineProtocolText {
  type: 'SET_LINE_PROTOCOL_TEXT'
  payload: {lineProtocolText: string}
}

export const setLineProtocolText = (
  lineProtocolText: string
): SetLineProtocolText => ({
  type: 'SET_LINE_PROTOCOL_TEXT',
  payload: {lineProtocolText},
})

interface SetActiveLPTab {
  type: 'SET_ACTIVE_LP_TAB'
  payload: {activeLPTab: LineProtocolTab}
}

export const setActiveLPTab = (
  activeLPTab: LineProtocolTab
): SetActiveLPTab => ({
  type: 'SET_ACTIVE_LP_TAB',
  payload: {activeLPTab},
})

interface SetLPStatus {
  type: 'SET_LP_STATUS'
  payload: {lpStatus: RemoteDataState}
}

export const setLPStatus = (lpStatus: RemoteDataState): SetLPStatus => ({
  type: 'SET_LP_STATUS',
  payload: {lpStatus},
})

export const writeLineProtocolAction = (
  org: string,
  bucket: string,
  body: string
) => async dispatch => {
  try {
    dispatch(setLPStatus(RemoteDataState.Loading))
    await writeLineProtocol(org, bucket, body)
    dispatch(setLPStatus(RemoteDataState.Done))
  } catch (error) {
    dispatch(setLPStatus(RemoteDataState.Error))
  }
}
