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
import {
  createApplication,
  IApplication,
  storeApplication
} from '@client/applications'
import { Event } from '@client/forms'
import { SELECT_DEATH_INFORMANT } from '@client/navigation/routes'

import { createTestApp, flushPromises, setPinCode } from '@client/tests/util'
import { ReactWrapper } from 'enzyme'
import { History } from 'history'
import { Store } from 'redux'
import { storage } from '@client/storage'

beforeEach(() => {
  ;(storage.getItem as jest.Mock).mockReset()
})

describe('when user is selecting the informant', () => {
  let app: ReactWrapper
  let history: History
  let store: Store
  let draft: IApplication

  beforeEach(async () => {
    const testApp = await createTestApp()
    app = testApp.app
    history = testApp.history
    store = testApp.store

    draft = createApplication(Event.DEATH)
    store.dispatch(storeApplication(draft))
    history.replace(SELECT_DEATH_INFORMANT.replace(':applicationId', draft.id))

    await setPinCode(app)
  })
  describe('when selects "Parent"', () => {
    it('takes user to the death registration contact view', () => {
      app.find('#select_informant_MOTHER').hostNodes().simulate('change')

      app.find('#continue').hostNodes().simulate('click')

      const expectation = `/drafts/${draft.id}/events/death`
      expect(window.location.pathname).toContain(expectation)
    })
  })
  describe('when click continue without select anything', () => {
    it('show the error message', () => {
      app.find('#continue').hostNodes().simulate('click')

      expect(app.find('#error_text').hostNodes().text()).toBe(
        'Please select the relationship to the deceased.'
      )
    })
  })

  describe('when traverse list then continue', () => {
    it('takes user to the death registration by parent informant view', () => {
      app.find('#select_informant_MOTHER').hostNodes().simulate('change')
      app.find('#select_informant_FATHER').hostNodes().simulate('change')

      app.find('#select_informant_SPOUSE').hostNodes().simulate('change')
      app.find('#select_informant_SON').hostNodes().simulate('change')
      app.find('#select_informant_DAUGHTER').hostNodes().simulate('change')
      app.find('#continue').hostNodes().simulate('click')

      const expectation = `/drafts/${draft.id}/events/death`
      expect(window.location.pathname).toContain(expectation)
    })
  })

  describe('when select other informant', () => {
    it('advances to additional relationship information if informant is other', async () => {
      app.find('#select_informant_OTHER').hostNodes().simulate('change')

      app.find('#continue').hostNodes().simulate('click')

      await flushPromises()
      app.update()

      expect(
        app.find('#relationship_HEAD_OF_THE_INSTITUTE').hostNodes()
      ).toHaveLength(1)
    })

    it('advances to contact point if informant is other', async () => {
      app.find('#select_informant_OTHER').hostNodes().simulate('change')

      app.find('#continue').hostNodes().simulate('click')

      app.find('#relationship_OFFICER_IN_CHARGE').hostNodes().simulate('change')

      app.find('#next_section').hostNodes().simulate('click')

      await flushPromises()
      app.update()

      expect(app.find('#contactPoint_APPLICANT').hostNodes()).toHaveLength(1)
    })
  })

  describe('when clicked on cross button', () => {
    it('go back to home page', async () => {
      app.find('#crcl-btn').hostNodes().simulate('click')

      expect(window.location.href).toContain('/')
    })
  })
})
describe('when select informant page loads with existing data', () => {
  it('loads data properly while initiating', async () => {
    const testApp = await createTestApp()
    const app = testApp.app
    const history = testApp.history
    const store = testApp.store

    const draft = createApplication(Event.DEATH, {
      informant: {
        applicantsRelationToDeceased: 'OTHER',
        applicantPhone: '01622688231',
        applicantOtherRelationship: 'Grand Mother'
      }
    })
    store.dispatch(storeApplication(draft))
    history.replace(SELECT_DEATH_INFORMANT.replace(':applicationId', draft.id))
    await setPinCode(app)

    expect(
      app.find('#select_informant_OTHER').hostNodes().props().checked
    ).toBe(true)
  })
})
