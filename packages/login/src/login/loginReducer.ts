import { loop, LoopReducer, Cmd, Loop } from 'redux-loop'
import { push } from 'react-router-redux'

import * as actions from './loginActions'
import { authApi } from '../utils/authApi'
import * as routes from '../navigation/routes'

export type LoginState = {
  stepOneSubmitting: boolean
  stepTwoDetails: { code: string; nonce: string }
  submissionError: boolean
}

export const initialState: LoginState = {
  stepOneSubmitting: false,
  stepTwoDetails: {
    nonce: '',
    code: ''
  },
  submissionError: false
}

export const loginReducer: LoopReducer<LoginState, actions.Action> = (
  state: LoginState = initialState,
  action: actions.Action
): LoginState | Loop<LoginState, actions.Action> => {
  switch (action.type) {
    case actions.START_STEP_ONE:
      return loop(
        {
          ...state,
          stepOneSubmitting: true,
          submissionError: false
        },
        Cmd.run(authApi.submitStepOne, {
          successActionCreator: actions.submitStepOneSuccess,
          failActionCreator: actions.submitStepOneFailed,
          args: [action.payload]
        })
      )
    case actions.STEP_ONE_FAILED:
      return { ...state, stepOneSubmitting: false, submissionError: true }
    case actions.STEP_ONE_SUCCESS:
      return loop(
        {
          ...state,
          stepOneSubmitting: false,
          submissionError: false,
          stepTwoDetails: {
            ...state.stepTwoDetails,
            nonce: action.payload.nonce
          }
        },
        Cmd.action(push(routes.STEP_TWO))
      )

    default:
      return state
  }
}