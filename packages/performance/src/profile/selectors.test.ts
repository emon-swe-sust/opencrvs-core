import { getAuthenticated, getUserDetails, getTokenPayload } from './selectors'
import { getInitialState } from '../tests/util'

describe('profileSelectors', () => {
  describe('selectors', () => {
    it('should return authenticated boolean', () => {
      const authenticated = false
      expect(getAuthenticated(getInitialState())).toEqual(authenticated)
    })
    it('should return userDetails', () => {
      const userDetails = null
      expect(getUserDetails(getInitialState())).toEqual(userDetails)
    })
    it('should return tokenPayload', () => {
      const tokenPayload = null
      expect(getTokenPayload(getInitialState())).toEqual(tokenPayload)
    })
  })
})
