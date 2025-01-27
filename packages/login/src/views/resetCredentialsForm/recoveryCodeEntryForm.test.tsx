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
import { FORGOTTEN_ITEMS } from '@login/login/actions'
import * as routes from '@login/navigation/routes'
import { createTestApp } from '@login/tests/util'
import { client } from '@login/utils/authApi'
import { ReactWrapper } from 'enzyme'
import { History } from 'history'
import * as moxios from 'moxios'

describe('Test recvery code entry form', () => {
  let app: ReactWrapper
  let history: History

  beforeEach(async () => {
    moxios.install(client)

    const testApp = await createTestApp()
    app = testApp.app
    history = testApp.history

    history.replace('')
    app.update()
  })

  afterEach(() => {
    moxios.uninstall(client)
  })

  describe('Valid page header and subheader', () => {
    const nonce = '123456789'
    const mobile = '01712345678'
    beforeEach(() => {
      history.replace(routes.RECOVERY_CODE_ENTRY, {
        forgottenItem: FORGOTTEN_ITEMS.PASSWORD,
        nonce,
        mobile
      })
      app.update()
    })

    describe('When recovery code is not resent', () => {
      it('loads valid header', () => {
        expect(app.text()).toContain('৬-সংখ্যার পুনরুদ্ধার কোড লিখুন')
      })

      it('loads valid subheader', () => {
        expect(app.text()).toContain(
          'পুনরুদ্ধার কোডটি আপনার ফোন নম্বরটিতে প্রেরণ করা হয়েছে। কোডটি লিখুন। কোড পৌঁছায়নি?'
        )
      })
    })

    describe('When recovery code is resent', () => {
      it('loads valid header', (done) => {
        app.find('#retrieve-login-mobile-resend').hostNodes().simulate('click')
        moxios.wait(() => {
          const request = moxios.requests.mostRecent()
          request
            .respondWith({
              status: 200
            })
            .then(() => {
              expect(app.text()).toContain('যাচাই কোড পুনরায় পাঠানো হয়েছে')
              done()
            })
        })
      })

      it('loads valid subheader', (done) => {
        app.find('#retrieve-login-mobile-resend').hostNodes().simulate('click')
        moxios.wait(() => {
          const request = moxios.requests.mostRecent()
          request
            .respondWith({
              status: 200
            })
            .then(() => {
              expect(app.text()).toContain(
                `আপনাকে ${mobile} নম্বরে একটি কোড প্রেরণ করা হয়েছে।`
              )
              done()
            })
        })
      })
    })
  })

  describe('Error handling', () => {
    const nonce = '123456789'
    const mobile = '01712345678'
    beforeEach(() => {
      history.replace(routes.RECOVERY_CODE_ENTRY, {
        forgottenItem: FORGOTTEN_ITEMS.PASSWORD,
        nonce,
        mobile
      })
      app.update()
    })

    it('show field error when recovery code of invalid length is given', () => {
      app
        .find('#recovery-code-input')
        .hostNodes()
        .simulate('change', { target: { value: '1234567' } })
      expect(app.find('#recovery-code_error').hostNodes()).toHaveLength(1)
    })
  })

  describe('Form submission', () => {
    const nonce = '123456789'
    const mobile = '01712345678'
    beforeEach(() => {
      history.replace(routes.RECOVERY_CODE_ENTRY, {
        forgottenItem: FORGOTTEN_ITEMS.PASSWORD,
        nonce,
        mobile
      })
      app.update()
    })

    it('redirects to security question form when valid recovery code is given', (done) => {
      app
        .find('#recovery-code-input')
        .hostNodes()
        .simulate('change', { target: { value: '000000' } })
      app.find('#continue').hostNodes().simulate('submit')
      moxios.wait(() => {
        const request = moxios.requests.mostRecent()
        request
          .respondWith({
            status: 200,
            response: {
              nonce: 'KkcVYTRVC6usF7Vjdi3FSw==',
              securityQuestionKey: 'FAVORITE_SONG'
            }
          })
          .then(() => {
            expect(window.location.pathname).toContain(routes.SECURITY_QUESTION)
            done()
          })
      })
    })

    it('does not redirect to sucerity quetion form when invalid recovery code is given', (done) => {
      app
        .find('#recovery-code-input')
        .hostNodes()
        .simulate('change', { target: { value: '123456' } })
      app.find('#continue').hostNodes().simulate('submit')
      moxios.wait(() => {
        const request = moxios.requests.mostRecent()
        request
          .respondWith({
            status: 401
          })
          .then(() => {
            expect(window.location.pathname).toContain(
              routes.RECOVERY_CODE_ENTRY
            )
            done()
          })
      })
    })
  })
})
