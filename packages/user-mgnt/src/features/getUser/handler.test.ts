import User, { IUserModel } from '../../model/user'
import { createServer } from '../..'
import * as jwt from 'jsonwebtoken'
import { readFileSync } from 'fs'
import { DocumentQuery } from 'mongoose'

let server: any

beforeEach(async () => {
  server = await createServer()
})

const token = jwt.sign(
  { scope: ['declare'] },
  readFileSync('../auth/test/cert.key'),
  {
    algorithm: 'RS256',
    issuer: 'opencrvs:auth-service',
    audience: 'opencrvs:user-mgnt-user'
  }
)
const dummyUser = {
  _id: 'ba7022f0ff4822',
  name: [
    {
      use: 'en',
      given: ['Sakib Al'],
      family: ['Hasan']
    }
  ],
  username: 'sakibal.hasan',
  mobile: '+8801711111111',
  email: 'test@test.org',
  passwordHash:
    'b8be6cae5215c93784b1b9e2c06384910f754b1d66c077f1f8fdc98fbd92e6c17a0fdc790b30225986cadb9553e87a47b1d2eb7bd986f96f0da7873e1b2ddf9c',
  salt: '12345',
  role: 'Field Agent',
  active: true,
  practitionerId: 'dcba7022-f0ff-4822-b5d9-cb90d0e7b8de',
  primaryOfficeId: '79776844-b606-40e9-8358-7d82147f702a',
  catchmentAreaIds: [
    'b21ce04e-7ccd-4d65-929f-453bc193a736',
    '95754572-ab6f-407b-b51a-1636cb3d0683',
    '7719942b-16a7-474a-8af1-cd0c94c730d2',
    '43ac3486-7df1-4bd9-9b5e-728054ccd6ba'
  ],
  creationDate: 1559054406433
}
describe('getUser tests', () => {
  it('Successfully returns user with user id', async () => {
    const spy = jest.spyOn(User, 'findOne').mockResolvedValueOnce(dummyUser)

    const res = await server.server.inject({
      method: 'POST',
      url: '/getUser',
      payload: { userId: 'ba7022f0ff4822' },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(res.result).toEqual(dummyUser)
    expect(spy).toBeCalled()
  })
  it('Successfully returns user with practitioner id', async () => {
    const spy = jest.spyOn(User, 'findOne').mockResolvedValueOnce(dummyUser)

    const res = await server.server.inject({
      method: 'POST',
      url: '/getUser',
      payload: { practitionerId: 'dcba7022-f0ff-4822-b5d9-cb90d0e7b8de' },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(res.result).toEqual(dummyUser)
    expect(spy).toBeCalled()
  })
  it('returns 401 for an invalid userid', async () => {
    const spy = jest.spyOn(User, 'findOne').mockResolvedValueOnce(null)

    const res = await server.server.inject({
      method: 'POST',
      url: '/getUser',
      payload: { userId: 'ba7022f0ff4822' },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(res.result.statusCode).toEqual(401)
    expect(spy).toBeCalled()
  })
})