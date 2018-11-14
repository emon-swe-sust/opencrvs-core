import * as React from 'react'
import { connect } from 'react-redux'
import { InjectedIntlProps, injectIntl } from 'react-intl'
import { Header, Box } from '@opencrvs/components/lib/interface'
import styled from 'src/styled-components'
import Logo from 'src/components/Logo'
import { Page } from 'src/components/Page'
import { Legend } from '@opencrvs/components/lib/charts'

const data = [
  {
    value: 500,
    label: 'Live births registered within 45 days of actual birth',
    description: '500 out of 3000 total'
  },
  {
    value: 1000,
    label: 'Live births registered within 1 year of actual birth',
    description: '1000 out of 3000 total'
  },
  {
    value: 3000,
    label: 'Total Live Births registered',
    description: '3000 out of estimated 4000',
    total: true
  },
  {
    value: 4000,
    label: 'Estimated Births in [time period]',
    estimate: true,
    description: 'Provided from 2018 population census'
  }
]

const StyledHeader = styled(Header)`
  padding: 0 26px;
  box-shadow: none;
`

const BoxTitle = styled.div`
  height: 25px;
  font-weight: 300;
  font-size: 24px;
  line-height: 25px;
  color: ${({ theme }) => theme.colors.primary};
  font-family: ${({ theme }) => theme.fonts.lightFont};
`

const FooterText = styled.div`
  height: 17px;
  font-weight: 300;
  font-size: 12px;
  line-height: 17px;
  margin-top: 30px;
  margin-bottom: 25px;
  color: ${({ theme }) => theme.colors.copy};
  font-family: ${({ theme }) => theme.fonts.lightFont};
`

const ChartContainer = styled(Box)`
  max-width: ${({ theme }) => theme.grid.breakpoints.lg}px;
  margin: auto;
`

const Container = styled.div`
  padding: 20px 10px;
`
const boxTitle = 'Birth Registration Key Figures'
const footerText = 'Estimates provided using National Population Census data'
class HomeView extends React.Component<InjectedIntlProps> {
  render() {
    return (
      <Page>
        <StyledHeader>
          <Logo />
        </StyledHeader>
        <Container>
          <ChartContainer>
            <BoxTitle>{boxTitle}</BoxTitle>
            <Legend data={data} />
            <FooterText>{footerText}</FooterText>
          </ChartContainer>
        </Container>
      </Page>
    )
  }
}

export const Home = connect(null, null)(injectIntl(HomeView))
