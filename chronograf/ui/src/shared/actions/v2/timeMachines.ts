import {TimeRange} from 'src/types/v2'

export type Action =
  | SetActiveTimeMachineIDAction
  | SetNameAction
  | SetTimeRangeAction

interface SetActiveTimeMachineIDAction {
  type: 'SET_ACTIVE_TIME_MACHINE_ID'
  payload: {activeTimeMachineID: string}
}

export const setActiveTimeMachineID = (
  activeTimeMachineID: string
): SetActiveTimeMachineIDAction => ({
  type: 'SET_ACTIVE_TIME_MACHINE_ID',
  payload: {activeTimeMachineID},
})

interface SetNameAction {
  type: 'SET_VIEW_NAME'
  payload: {name: string}
}

export const setName = (name: string): SetNameAction => ({
  type: 'SET_VIEW_NAME',
  payload: {name},
})

interface SetTimeRangeAction {
  type: 'SET_TIME_RANGE'
  payload: {timeRange: TimeRange}
}

export const setTimeRange = (timeRange: TimeRange): SetTimeRangeAction => ({
  type: 'SET_TIME_RANGE',
  payload: {timeRange},
})