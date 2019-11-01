import { createStore } from '@register/store'
import { InboxController } from '@register/InboxController'
import { DOWNLOAD_STATUS } from '@register/applications'
import { Action } from './forms'
import { Event } from './components/DuplicateDetails'

describe('Inbox Controller', () => {
  it('should starts the interval', () => {
    window.setInterval = jest.fn()
    const { store } = createStore()
    new InboxController(store).start()
    expect(setInterval).toBeCalled()
  })

  it('should do nothing if sync is already running', () => {
    const store = {
      getState: () => ({
        applicationsState: {
          applications: [
            {
              id: '1',
              event: Event.BIRTH.toLowerCase(),
              action: Action.LOAD_REVIEW_APPLICATION,
              downloadStatus: DOWNLOAD_STATUS.READY_TO_DOWNLOAD
            }
          ]
        },
        registerForm: {
          registerForm: {}
        }
      }),
      dispatch: jest.fn()
    }

    // @ts-ignore
    const inboxController = new InboxController(store)
    inboxController.syncRunning = true
    inboxController.sync()

    expect(store.dispatch).not.toBeCalled()
  })

  it('should sync all ready to download applications in the queue', async () => {
    const store = {
      getState: () => ({
        applicationsState: {
          applications: [
            {
              id: '1',
              event: Event.BIRTH.toLowerCase(),
              action: Action.LOAD_REVIEW_APPLICATION,
              downloadStatus: DOWNLOAD_STATUS.READY_TO_DOWNLOAD
            },
            {
              id: '2',
              event: Event.BIRTH.toLowerCase(),
              action: Action.LOAD_REVIEW_APPLICATION,
              downoadStatus: DOWNLOAD_STATUS.FAILED_NETWORK
            },
            {
              id: '3',
              event: Event.BIRTH.toLowerCase(),
              action: Action.LOAD_REVIEW_APPLICATION,
              downloadStatus: DOWNLOAD_STATUS.FAILED
            },
            {
              id: '4',
              event: Event.BIRTH.toLowerCase(),
              action: Action.LOAD_REVIEW_APPLICATION,
              downloadStatus: DOWNLOAD_STATUS.DOWNLOADED
            }
          ]
        },
        registerForm: {
          registerForm: {
            birth: {
              sections: []
            },
            death: {
              sections: []
            }
          }
        }
      }),
      dispatch: jest.fn()
    }

    // @ts-ignore
    const inboxController = new InboxController(store)
    inboxController.client = {
      query: jest.fn().mockResolvedValueOnce({
        data: {
          fetchBirthRegistration: {}
        }
      })
    }

    await inboxController.sync()

    expect(inboxController.client.query).toHaveBeenCalledTimes(1)
    expect(store.dispatch).toHaveBeenCalledTimes(4)
    expect(
      store.dispatch.mock.calls[2][0].payload.application.downloadStatus
    ).toBe(DOWNLOAD_STATUS.DOWNLOADED)
  })

  it('should increase retry attempt for an application that has a network error or error', async () => {
    const store = {
      getState: () => ({
        applicationsState: {
          applications: [
            {
              id: '1',
              event: Event.BIRTH.toLowerCase(),
              action: Action.LOAD_REVIEW_APPLICATION,
              downloadRetryAttempt: 1,
              downloadStatus: DOWNLOAD_STATUS.READY_TO_DOWNLOAD
            }
          ]
        },
        registerForm: {
          registerForm: {}
        }
      }),
      dispatch: jest.fn()
    }

    // @ts-ignore
    const inboxController = new InboxController(store)

    const err = new Error('boom')
    // @ts-ignore
    err.networkError = new Error('network boom')
    inboxController.client = { query: jest.fn().mockRejectedValueOnce(err) }

    await inboxController.sync()

    expect(inboxController.client.query).toHaveBeenCalledTimes(1)
    expect(store.dispatch).toHaveBeenCalledTimes(4)
    expect(
      store.dispatch.mock.calls[3][0].payload.application.downloadStatus
    ).toBe(DOWNLOAD_STATUS.READY_TO_DOWNLOAD)
    expect(
      store.dispatch.mock.calls[3][0].payload.application.downloadRetryAttempt
    ).toBe(2)
  })

  it('should increate retry attempt for an application that has an progrmmatic error', async () => {
    const store = {
      getState: () => ({
        applicationsState: {
          applications: [
            {
              id: '1',
              event: Event.BIRTH.toLowerCase(),
              action: Action.LOAD_REVIEW_APPLICATION,
              downloadRetryAttempt: 1,
              downloadStatus: DOWNLOAD_STATUS.READY_TO_DOWNLOAD
            }
          ]
        },
        registerForm: {
          registerForm: {}
        }
      }),
      dispatch: jest.fn()
    }

    // @ts-ignore
    const inboxController = new InboxController(store)

    const err = new Error('boom')
    // @ts-ignore
    inboxController.client = { query: jest.fn().mockRejectedValueOnce(err) }

    await inboxController.sync()

    expect(inboxController.client.query).toHaveBeenCalledTimes(1)
    expect(store.dispatch).toHaveBeenCalledTimes(4)
    expect(
      store.dispatch.mock.calls[3][0].payload.application.downloadStatus
    ).toBe(DOWNLOAD_STATUS.READY_TO_DOWNLOAD)
    expect(
      store.dispatch.mock.calls[3][0].payload.application.downloadRetryAttempt
    ).toBe(2)
  })

  it('should change the status to failed network for network error when retry attempt reaches maximum limit', async () => {
    const store = {
      getState: () => ({
        applicationsState: {
          applications: [
            {
              id: '1',
              event: Event.BIRTH.toLowerCase(),
              action: Action.LOAD_REVIEW_APPLICATION,
              downloadRetryAttempt: 2,
              downloadStatus: DOWNLOAD_STATUS.READY_TO_DOWNLOAD
            }
          ]
        },
        registerForm: {
          registerForm: {}
        }
      }),
      dispatch: jest.fn()
    }

    // @ts-ignore
    const inboxController = new InboxController(store)

    const err = new Error('boom')
    // @ts-ignore
    err.networkError = new Error('network boom')
    inboxController.client = { query: jest.fn().mockRejectedValueOnce(err) }

    await inboxController.sync()

    expect(inboxController.client.query).toHaveBeenCalledTimes(1)
    expect(store.dispatch).toHaveBeenCalledTimes(4)
    expect(
      store.dispatch.mock.calls[3][0].payload.application.downloadRetryAttempt
    ).toBe(3)
    expect(
      store.dispatch.mock.calls[3][0].payload.application.downloadStatus
    ).toBe(DOWNLOAD_STATUS.FAILED_NETWORK)
  })

  it('should change the status to failed for programmatic error when retry attempt reaches maximum limit', async () => {
    const store = {
      getState: () => ({
        applicationsState: {
          applications: [
            {
              id: '1',
              event: Event.BIRTH.toLowerCase(),
              action: Action.LOAD_REVIEW_APPLICATION,
              downloadRetryAttempt: 2,
              downloadStatus: DOWNLOAD_STATUS.READY_TO_DOWNLOAD
            }
          ]
        },
        registerForm: {
          registerForm: {}
        }
      }),
      dispatch: jest.fn()
    }

    // @ts-ignore
    const inboxController = new InboxController(store)

    const err = new Error('boom')
    // @ts-ignore
    inboxController.client = { query: jest.fn().mockRejectedValueOnce(err) }

    await inboxController.sync()

    expect(inboxController.client.query).toHaveBeenCalledTimes(1)
    expect(store.dispatch).toHaveBeenCalledTimes(4)
    expect(
      store.dispatch.mock.calls[3][0].payload.application.downloadRetryAttempt
    ).toBe(3)
    expect(
      store.dispatch.mock.calls[3][0].payload.application.downloadStatus
    ).toBe(DOWNLOAD_STATUS.FAILED)
  })
})
