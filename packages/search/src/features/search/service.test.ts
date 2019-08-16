import { searchComposition } from '@search/features/search/service'
import { client } from '@search/elasticsearch/client'

describe('elasticsearch db helper', () => {
  it('should index a composition with proper configuration', async () => {
    const searchSpy = jest.spyOn(client, 'search')
    const searchQuery = {
      query: 'some query',
      trackingId: 'dummy',
      contactNumber: 'dummy',
      registrationNumber: 'dummy',
      event: 'EMPTY_STRING',
      status: ['DECLARED'],
      applicationLocationId: 'EMPTY_STRING',
      from: 0,
      size: 10
    }
    searchComposition(searchQuery)
    expect(searchSpy).toBeCalled()
  })

  it('should index a composition with minimum configuration', async () => {
    const searchSpy = jest.spyOn(client, 'search')
    searchComposition({})
    expect(searchSpy).toBeCalled()
  })
})
