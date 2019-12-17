/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import { loop, Cmd, Loop, liftState, getModel, getCmd } from 'redux-loop'
import * as actions from '@client/offline/actions'
import * as profileActions from '@client/profile/profileActions'
import { storage } from '@client/storage'
import { referenceApi } from '@client/utils/referenceApi'
import { ILanguage } from '@client/i18n/reducer'
import { filterLocations, getLocation } from '@client/utils/locationUtils'
import { tempData } from '@client/offline/temp/tempLocations'
import { ISerializedForm } from '@client/forms'
import { isOfflineDataLoaded } from './selectors'
import { IUserDetails } from '@client/utils/userUtils'
import { IPDFTemplate } from '@client/pdfRenderer/transformer/types'
import { ICertificateCollectorDefinition } from '@client/views/PrintCertificate/VerifyCollector'

export const OFFLINE_LOCATIONS_KEY = 'locations'
export const OFFLINE_FACILITIES_KEY = 'facilities'

export interface ILocation {
  id: string
  name: string
  alias: string
  physicalType: string
  jurisdictionType?: string
  type: string
  partOf: string
}

export interface IOfflineData {
  locations: { [key: string]: ILocation }
  facilities: { [key: string]: ILocation }
  languages: ILanguage[]
  forms: {
    // @todo this is also used in review, so it could be named just form
    registerForm: {
      birth: ISerializedForm
      death: ISerializedForm
    }
    certificateCollectorDefinition: {
      birth: ICertificateCollectorDefinition
      death: ICertificateCollectorDefinition
    }
  }
  templates: {
    receipt?: IPDFTemplate
    certificates: {
      birth: IPDFTemplate
      death: IPDFTemplate
    }
  }
  assets: {
    logo: string
  }
}

export type IOfflineDataState = {
  offlineData: Partial<IOfflineData>
  offlineDataLoaded: boolean
  loadingError: boolean
  userDetails?: IUserDetails
}

export const initialState: IOfflineDataState = {
  offlineData: {},
  offlineDataLoaded: false,
  loadingError: false
}

async function saveOfflineData(offlineData: IOfflineData) {
  return storage.setItem('offline', JSON.stringify(offlineData))
}

function checkIfDone(
  oldState: IOfflineDataState,
  loopOrState: IOfflineDataState | Loop<IOfflineDataState, actions.Action>
) {
  const loopWithState = liftState(loopOrState)
  const newState = getModel(loopWithState)
  const cmd = getCmd(loopWithState)

  if (
    isOfflineDataLoaded(newState.offlineData) &&
    !oldState.offlineDataLoaded
  ) {
    return loop(
      { ...newState, offlineDataLoaded: true },
      Cmd.list([
        ...(cmd ? [cmd] : []),
        Cmd.run(saveOfflineData, { args: [newState.offlineData] }),
        Cmd.action(actions.offlineDataReady(newState.offlineData))
      ])
    )
  }

  if (
    /*
     * Data was updated with a fresh version from resources
     */
    isOfflineDataLoaded(oldState.offlineData) &&
    isOfflineDataLoaded(newState.offlineData) &&
    oldState.offlineData !== newState.offlineData
  ) {
    return loop(
      newState,
      Cmd.list([
        ...(cmd ? [cmd] : []),
        Cmd.run(saveOfflineData, { args: [newState.offlineData] }),
        Cmd.action(actions.offlineDataUpdated(newState.offlineData))
      ])
    )
  }

  return loopWithState
}

function getDataLoadingCommands() {
  return Cmd.list<actions.Action>([
    Cmd.run(referenceApi.loadFacilities, {
      successActionCreator: actions.facilitiesLoaded,
      failActionCreator: actions.facilitiesFailed
    }),
    Cmd.run(referenceApi.loadLocations, {
      successActionCreator: actions.locationsLoaded,
      failActionCreator: actions.locationsFailed
    }),
    Cmd.run(referenceApi.loadDefinitions, {
      successActionCreator: actions.definitionsLoaded,
      failActionCreator: actions.definitionsFailed
    }),
    Cmd.run(referenceApi.loadAssets, {
      successActionCreator: actions.assetsLoaded,
      failActionCreator: actions.assetsFailed
    })
  ])
}

function updateGlobalConfig() {
  return Cmd.run(() => {
    // Replaces the script tag in site head with a fresh one
    const currentConfigElement = Array.from(
      document.querySelectorAll('script')
    ).find(({ src }) => src.indexOf('config.js'))!
    const head = document.getElementsByTagName('head')[0]
    const newConfigElement = document.createElement('script')
    newConfigElement.src = currentConfigElement.src.replace(
      /\?.*/,
      '?cachebuster=' + Date.now()
    )
    head.appendChild(newConfigElement)
    head.removeChild(currentConfigElement)
  })
}

function reducer(
  state: IOfflineDataState,
  action: actions.Action | profileActions.Action
): IOfflineDataState | Loop<IOfflineDataState, actions.Action> {
  switch (action.type) {
    // ENTRYPOINT - called from profile reducer
    case profileActions.USER_DETAILS_AVAILABLE: {
      return loop(
        { ...state, userDetails: action.payload },
        Cmd.run(storage.getItem, {
          args: ['offline'],
          successActionCreator: actions.getOfflineDataSuccess,
          // @todo this action isn't handled
          failActionCreator: actions.getOfflineDataFailed
        })
      )
    }
    case actions.REFRESH_OFFLINE_DATA: {
      return loop(
        state,
        Cmd.list([getDataLoadingCommands(), updateGlobalConfig()])
      )
    }
    case actions.GET_OFFLINE_DATA_SUCCESS: {
      const offlineDataString = action.payload
      const offlineData: IOfflineData = JSON.parse(
        offlineDataString ? offlineDataString : '{}'
      )

      const dataLoadingCmds = getDataLoadingCommands()
      const offlineDataLoaded = isOfflineDataLoaded(offlineData)
      if (offlineDataLoaded) {
        return loop(
          {
            ...state,
            offlineData,
            offlineDataLoaded
          },
          Cmd.list([
            // Try loading data regardless as it might have been updated.
            navigator.onLine ? dataLoadingCmds : Cmd.none
          ])
        )
      }
      return loop(state, dataLoadingCmds)
    }

    /*
     * Definitions
     */

    case actions.DEFINITIONS_LOADED: {
      return {
        ...state,
        loadingError: false,
        offlineData: {
          ...state.offlineData,
          languages: action.payload.languages,
          forms: action.payload.forms,
          templates: action.payload.templates
        }
      }
    }
    case actions.DEFINITIONS_FAILED: {
      return {
        ...state,
        loadingError: true
      }
    }

    /*
     * Locations
     */

    case actions.LOCATIONS_LOADED: {
      return {
        ...state,
        offlineData: {
          ...state.offlineData,
          locations: action.payload
        }
      }
    }
    case actions.LOCATIONS_FAILED: {
      return {
        ...state,
        loadingError: true,
        offlineData: {
          ...state.offlineData,
          locations: tempData.locations
        }
      }
    }

    /*
     * Facilities
     */

    case actions.FACILITIES_LOADED: {
      const facilities = filterLocations(
        action.payload,
        getLocation(state.userDetails!, window.config.HEALTH_FACILITY_FILTER),
        state.userDetails!
      )

      return {
        ...state,
        offlineData: {
          ...state.offlineData,
          facilities
        }
      }
    }
    case actions.FACILITIES_FAILED: {
      return {
        ...state,
        loadingError: true,
        offlineData: {
          ...state.offlineData,
          facilities: tempData.facilities
        }
      }
    }

    /*
     * Assets
     */

    case actions.ASSETS_LOADED: {
      return {
        ...state,
        loadingError: false,
        offlineData: {
          ...state.offlineData,
          assets: {
            logo: action.payload.logo
          }
        }
      }
    }
    case actions.ASSETS_FAILED: {
      return {
        ...state,
        loadingError: true
      }
    }

    case actions.READY: {
      const offlineDataLoaded = isOfflineDataLoaded(action.payload)
      return {
        ...state,
        offlineData: action.payload,
        offlineDataLoaded
      }
    }

    default:
      return state
  }
}

export function offlineDataReducer(
  state: IOfflineDataState | undefined = initialState,
  action: actions.Action
): IOfflineDataState | Loop<IOfflineDataState, actions.Action> {
  const newState = reducer(state, action)
  if (action.type !== actions.READY) {
    return checkIfDone(state, newState)
  }
  return newState
}