import { defineMessages } from 'react-intl'

interface ISysAdminMessages {
  overviewTab: ReactIntl.FormattedMessage.MessageDescriptor
  officesTab: ReactIntl.FormattedMessage.MessageDescriptor
  usersTab: ReactIntl.FormattedMessage.MessageDescriptor
  devicesTab: ReactIntl.FormattedMessage.MessageDescriptor
  networkTab: ReactIntl.FormattedMessage.MessageDescriptor
  configTab: ReactIntl.FormattedMessage.MessageDescriptor
  systemTitle: ReactIntl.FormattedMessage.MessageDescriptor
}

const messagesToDefine: ISysAdminMessages = {
  overviewTab: {
    id: 'register.sysAdminHome.overview',
    defaultMessage: 'Overview',
    description: 'The title of overview tab'
  },
  officesTab: {
    id: 'register.sysAdminHome.offices',
    defaultMessage: 'Offices',
    description: 'The title of offices tab'
  },
  usersTab: {
    id: 'register.sysAdminHome.users',
    defaultMessage: 'Users',
    description: 'The title of users tab'
  },
  devicesTab: {
    id: 'register.sysAdminHome.devices',
    defaultMessage: 'Devices',
    description: 'The title of devices tab'
  },
  networkTab: {
    id: 'register.sysAdminHome.network',
    defaultMessage: 'Network',
    description: 'The title of network tab'
  },
  configTab: {
    id: 'register.sysAdminHome.config',
    defaultMessage: 'Config',
    description: 'The title of config tab'
  },
  systemTitle: {
    id: 'home.header.systemTitle',
    defaultMessage: 'System',
    description: 'System title'
  }
}

export const messages: ISysAdminMessages = defineMessages(messagesToDefine)