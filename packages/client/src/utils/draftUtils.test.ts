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
import { Event } from '@client/forms'
import {
  getDraftApplicantFullName,
  transformSearchQueryDataToDraft,
  updateApplicationTaskHistory
} from '@client/utils/draftUtils'
import {
  GQLBirthEventSearchSet,
  GQLDeathEventSearchSet
} from '@opencrvs/gateway/src/graphql/schema'
import { SUBMISSION_STATUS, IApplication } from '@client/applications'
import { IUserDetails } from './userUtils'

describe('draftUtils tests', () => {
  describe('getDraftApplicantFullName()', () => {
    describe('Birth event', () => {
      it('Returns child english name properly', () => {
        expect(
          getDraftApplicantFullName({
            id: '7b57d8f9-4d2d-4f12-8d0a-b042fe14f3d4',
            data: {
              child: {
                firstNames: 'মুশ্রাফুল',
                familyName: 'হক',
                firstNamesEng: 'Mushraful',
                familyNameEng: 'Hoque'
              }
            },
            event: Event.BIRTH,
            savedOn: 1558037863335,
            modifiedOn: 1558037867987
          })
        ).toBe('Mushraful Hoque')
      })
      it('Returns child bangla name properly', () => {
        expect(
          getDraftApplicantFullName(
            {
              id: '7b57d8f9-4d2d-4f12-8d0a-b042fe14f3d4',
              data: {
                child: {
                  familyName: 'হক',
                  firstNamesEng: 'Mushraful',
                  familyNameEng: 'Hoque'
                }
              },
              event: Event.BIRTH,
              savedOn: 1558037863335,
              modifiedOn: 1558037867987
            },
            'bn'
          )
        ).toBe('হক')
      })
    })
    describe('Death event', () => {
      it('Returns deceased english name properly', () => {
        expect(
          getDraftApplicantFullName({
            id: '7b57d8f9-4d2d-4f12-8d0a-b042fe14f3d4',
            data: {
              deceased: {
                firstNames: 'মুশ্রাফুল',
                familyName: 'হক',
                familyNameEng: 'Hoque'
              }
            },
            event: Event.DEATH,
            savedOn: 1558037863335,
            modifiedOn: 1558037867987
          })
        ).toBe('Hoque')
      })
      it('Returns child bangla name properly', () => {
        expect(
          getDraftApplicantFullName(
            {
              id: '7b57d8f9-4d2d-4f12-8d0a-b042fe14f3d4',
              data: {
                deceased: {
                  firstNames: 'মুশ্রাফুল',
                  familyName: 'হক',
                  firstNamesEng: 'Mushraful',
                  familyNameEng: 'Hoque'
                }
              },
              event: Event.DEATH,
              savedOn: 1558037863335,
              modifiedOn: 1558037867987
            },
            'bn'
          )
        ).toBe('মুশ্রাফুল হক')
      })
    })
  })

  describe('Query data to draft transformation', () => {
    describe('birth event', () => {
      it('transfroms birth event query data to draft', () => {
        const queryData: GQLBirthEventSearchSet = {
          id: '1',
          type: 'birth',
          registration: {
            contactNumber: '+8801711111111',
            trackingId: 'BZX12Y',
            status: 'DECLARED'
          },
          operationHistories: [
            {
              operatedOn: '2020-01-21T08:41:08.551Z',
              operationType: 'DECLARED',
              operatorOfficeName: 'Baniajan Union Parishad',
              operatorRole: 'FIELD_AGENT',
              operatorName: [
                {
                  familyName: 'Al Hasan',
                  firstNames: 'Shakib',
                  use: 'en'
                },
                {
                  familyName: '',
                  firstNames: '',
                  use: 'bn'
                }
              ],
              operatorOfficeAlias: ['বানিয়াজান ইউনিয়ন পরিষদ']
            }
          ],
          childName: [
            {
              firstNames: 'Muhammad',
              familyName: 'Ashraful',
              use: 'en'
            },
            {
              firstNames: 'মুহাম্মাদ',
              familyName: 'আশরাফুল',
              use: 'bn'
            }
          ]
        }

        const transformedDraftApplication =
          transformSearchQueryDataToDraft(queryData)
        expect(transformedDraftApplication).toEqual({
          id: '1',
          data: {
            registration: {
              contactPoint: {
                nestedFields: {
                  registrationPhone: '+8801711111111'
                }
              }
            },
            child: {
              firstNamesEng: 'Muhammad',
              familyNameEng: 'Ashraful',
              firstNames: 'মুহাম্মাদ',
              familyName: 'আশরাফুল'
            }
          },
          event: 'birth',
          trackingId: 'BZX12Y',
          submissionStatus: 'DECLARED',
          compositionId: '1',
          operationHistories: [
            {
              operatedOn: '2020-01-21T08:41:08.551Z',
              operationType: 'DECLARED',
              operatorOfficeName: 'Baniajan Union Parishad',
              operatorRole: 'FIELD_AGENT',
              operatorName: [
                {
                  familyName: 'Al Hasan',
                  firstNames: 'Shakib',
                  use: 'en'
                },
                {
                  familyName: '',
                  firstNames: '',
                  use: 'bn'
                }
              ],
              operatorOfficeAlias: ['বানিয়াজান ইউনিয়ন পরিষদ']
            }
          ]
        })
      })
    })
    describe('death event', () => {
      it('transfroms death event query data to draft', () => {
        const queryData: GQLDeathEventSearchSet = {
          id: '1',
          type: 'death',
          registration: {
            contactNumber: '+8801711111111',
            trackingId: 'BZX12Y',
            status: 'DECLARED'
          },
          operationHistories: [
            {
              operatedOn: '2020-01-21T08:41:08.551Z',
              operationType: 'DECLARED',
              operatorOfficeName: 'Baniajan Union Parishad',
              operatorRole: 'FIELD_AGENT',
              operatorName: [
                {
                  familyName: 'Al Hasan',
                  firstNames: 'Shakib',
                  use: 'en'
                },
                {
                  familyName: '',
                  firstNames: '',
                  use: 'bn'
                }
              ],
              operatorOfficeAlias: ['বানিয়াজান ইউনিয়ন পরিষদ']
            }
          ],
          deceasedName: [
            {
              firstNames: 'Muhammad',
              familyName: 'Ashraful',
              use: 'en'
            },
            {
              firstNames: 'মুহাম্মাদ',
              familyName: 'আশরাফুল',
              use: 'bn'
            }
          ]
        }

        const transformedDraftApplication =
          transformSearchQueryDataToDraft(queryData)
        expect(transformedDraftApplication).toEqual({
          id: '1',
          data: {
            registration: {
              contactPoint: {
                nestedFields: {
                  registrationPhone: '+8801711111111'
                }
              }
            },
            deceased: {
              firstNamesEng: 'Muhammad',
              familyNameEng: 'Ashraful',
              firstNames: 'মুহাম্মাদ',
              familyName: 'আশরাফুল'
            }
          },
          event: 'death',
          trackingId: 'BZX12Y',
          submissionStatus: 'DECLARED',
          compositionId: '1',
          operationHistories: [
            {
              operatedOn: '2020-01-21T08:41:08.551Z',
              operationType: 'DECLARED',
              operatorOfficeName: 'Baniajan Union Parishad',
              operatorRole: 'FIELD_AGENT',
              operatorName: [
                {
                  familyName: 'Al Hasan',
                  firstNames: 'Shakib',
                  use: 'en'
                },
                {
                  familyName: '',
                  firstNames: '',
                  use: 'bn'
                }
              ],
              operatorOfficeAlias: ['বানিয়াজান ইউনিয়ন পরিষদ']
            }
          ]
        })
      })
    })
  })
  describe('Task history', () => {
    it('returns a structured operation history', () => {
      const sampleDate = Date.now()
      const application: IApplication = {
        id: '',
        data: {},
        event: Event.BIRTH,
        submissionStatus: SUBMISSION_STATUS.DECLARED,
        modifiedOn: sampleDate
      }
      const userDetails: IUserDetails = {
        role: 'FIELD_AGENT',
        name: [
          {
            familyName: 'Al Hasan',
            firstNames: 'Shakib',
            use: 'en'
          },
          {
            familyName: '',
            firstNames: '',
            use: 'bn'
          }
        ],
        primaryOffice: {
          id: '',
          name: 'Baniajan Union Parishad',
          alias: ['বানিয়াজান ইউনিয়ন পরিষদ']
        },
        language: 'en',
        localRegistrar: {
          name: []
        }
      }

      const operationHistory = updateApplicationTaskHistory(
        application,
        userDetails
      )

      expect(operationHistory).toEqual({
        operationType: application.submissionStatus,
        operatedOn: new Date(sampleDate).toString(),
        operatorRole: userDetails.role,
        operatorName: userDetails.name,
        operatorOfficeName: userDetails.primaryOffice!.name,
        operatorOfficeAlias: userDetails.primaryOffice!.alias
      })
    })
  })
})
