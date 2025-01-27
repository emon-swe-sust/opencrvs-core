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
interface Window {
  config: {
    AUTH_API_URL: string
    COUNTRY: string
    LANGUAGES: string
    CLIENT_APP_URL: string
    PHONE_NUMBER_PATTERN: {
      pattern: RegExp
      example: string
      start?: string
      num: string
      mask: {
        startForm: number
        endBefore: number
      }
    }
    LOGROCKET: string
    SENTRY: string
  }
}
