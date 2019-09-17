import * as React from 'react'
import { WrappedComponentProps as IntlShapeProps, injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { IStoreState } from '@register/store'
import { getLanguage } from '@register/i18n/selectors'
import {
  ResponsiveModal,
  SearchInputWithIcon,
  RadioButton
} from '@opencrvs/components/lib/interface'
import styled, { withTheme } from 'styled-components'
import {
  PrimaryButton,
  TertiaryButton,
  LinkButton
} from '@opencrvs/components/lib/buttons'
import { ITheme } from '@opencrvs/components/lib/theme'
import { TextInput, InputLabel } from '@opencrvs/components/lib/forms'
import {
  buttonMessages,
  formMessages,
  errorMessages,
  constantsMessages
} from '@register/i18n/messages'
import { IOfflineData, ILocation } from '@register/offline/reducer'
import { getOfflineData } from '@register/offline/selectors'
import { ErrorText } from '@opencrvs/components/lib/forms/ErrorText'

const SelectButton = styled(PrimaryButton)`
  height: 40px;
  & div {
    padding: 0 8px;
  }
`
const CancelButton = styled(TertiaryButton)`
  height: 40px;
  & div {
    padding: 0;
  }
`
const ChildContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
`
const ListContainer = styled.div`
  padding-top: 15px;

  & > div {
    padding-top: 10px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.greySmoky};
  }
  & > div:first-child {
    border-top: 1px solid ${({ theme }) => theme.colors.greySmoky};
  }
`
const ItemContainer = styled.div.attrs<{ selected?: boolean }>({})`
  width: 870px;
  min-height: 96px;
  display: flex;
  justify-content: space-between;
  background: ${({ selected, theme }) =>
    selected
      ? theme.colors.chartAreaGradientEnd
      : theme.colors.white} !important;
`
interface IItemProps {
  width?: number
  isRight?: boolean
  color?: string
}

const Item = styled.div.attrs<IItemProps>({})`
  display: flex;
  width: ${({ width }) => (width ? width : 280)}px;
  padding: 5px 10px;
  justify-content: ${({ isRight }) => (isRight ? 'flex-end' : 'flex-start')};
  align-items: flex-start;
  ${({ color }) => color && `color: ${color};`}
`
const InputSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  .item + .item {
    margin-top: 12px;
  }
`
interface IProps {
  theme: ITheme
  language: string
  fieldName: string
  fieldValue: { [key: string]: string }
  fieldLabel: string
  isFieldRequired: boolean
  onModalComplete: (label: string, value: string) => void
  offlineResources: IOfflineData
  searchableResource: Extract<keyof IOfflineData, 'locations'>
}
interface IState {
  searchText: string
  selectedValue: string
  showModal: boolean
  showSearch: boolean
  fieldValue: string
}

type IFullProps = IProps & IntlShapeProps
class SearchFieldClass extends React.Component<IFullProps, IState> {
  constructor(props: IFullProps) {
    super(props)
    this.state = {
      searchText: '',
      selectedValue: '',
      showModal: false,
      showSearch: this.props.fieldValue ? false : true,
      fieldValue: this.props.fieldValue.label || ''
    }
  }

  handleSearch = (param: string) => {
    this.setState({
      searchText: param,
      showModal: true
    })
  }

  handleChange = (value: string | number | boolean) => {
    this.setState({
      selectedValue: value as string
    })
  }

  onModalClose = () => {
    this.setState({
      showModal: false,
      searchText: '',
      showSearch: this.state.fieldValue.length === 0
    })
  }

  onSelect = (value: ILocation) => {
    this.props.onModalComplete(value.name, value.id)
    this.setState({
      searchText: '',
      showModal: false,
      showSearch: false,
      fieldValue: value.name
    })
  }

  changeSelection = () => {
    this.setState({
      showSearch: true,
      searchText: this.state.fieldValue,
      showModal: true
    })
  }

  render() {
    const { intl, fieldLabel, fieldName, isFieldRequired } = this.props
    const placeHolderText = intl.formatMessage(
      formMessages.searchFieldPlaceHolderText
    )

    const offlineLocations = this.props.offlineResources[
      this.props.searchableResource
    ]

    let locations = Object.values(offlineLocations) as ILocation[]
    if (this.state.searchText.length > 0) {
      const rgxp = new RegExp(this.state.searchText, 'i')
      locations = locations.filter(location => location.name.match(rgxp))
    }
    const selectedValue =
      this.state.selectedValue ||
      (locations && locations.length > 0 && locations[0].name) ||
      ''

    const selectedLocation =
      locations.find(location => location.name === selectedValue) ||
      ({} as ILocation)

    const listItems = locations.map((location, index) => {
      return (
        <ItemContainer
          key={'item-container-' + index}
          selected={location.name === selectedValue}
        >
          <Item>
            <RadioButton
              id={'location-' + index}
              name="location"
              label={location.name}
              value={location.name}
              selected={selectedValue}
              onChange={this.handleChange}
            />
          </Item>
          <Item isRight={true} color={this.props.theme.colors.black}>
            {location.name === selectedValue &&
              intl.formatMessage(formMessages.officeLocationId, {
                locationId: location.id
              })}
          </Item>
        </ItemContainer>
      )
    })

    return (
      <>
        {!this.state.showModal && (
          <InputLabel required={isFieldRequired}>{fieldLabel}</InputLabel>
        )}
        {!this.state.showModal && !this.state.showSearch && (
          <InputSection>
            <TextInput
              id={this.props.fieldName + '-id'}
              value={this.state.fieldValue}
              disabled
              className="item"
            />
            <LinkButton
              id="edit-button"
              className="item"
              onClick={this.changeSelection}
            >
              {intl.formatMessage(formMessages.changeButtonLabel, {
                fieldName
              })}
            </LinkButton>
          </InputSection>
        )}
        {!this.state.showModal && this.state.showSearch && (
          <SearchInputWithIcon
            placeHolderText={placeHolderText}
            searchText={this.state.searchText}
            searchHandler={this.handleSearch}
          />
        )}

        <ResponsiveModal
          id="office-search-modal"
          title={intl.formatMessage(formMessages.searchFieldModalTitle, {
            fieldName
          })}
          width={918}
          contentHeight={280}
          show={this.state.showModal}
          handleClose={this.onModalClose}
          actions={[
            <CancelButton
              type="button"
              key="modal_cancel"
              id="modal_cancel"
              onClick={this.onModalClose}
            >
              {intl.formatMessage(buttonMessages.cancel)}
            </CancelButton>,
            <SelectButton
              key="modal_select"
              id="modal_select"
              type="button"
              disabled={listItems.length <= 0}
              onClick={() => this.onSelect(selectedLocation)}
            >
              {intl.formatMessage(buttonMessages.select)}
            </SelectButton>
          ]}
        >
          <ChildContainer>
            <SearchInputWithIcon
              placeHolderText={placeHolderText}
              searchText={this.state.searchText}
              searchHandler={this.handleSearch}
            />
            {listItems.length > 0 && <ListContainer>{listItems}</ListContainer>}
            {listItems.length <= 0 && (
              <div>
                <ErrorText>
                  {intl.formatMessage(constantsMessages.noResults)}
                </ErrorText>
              </div>
            )}
          </ChildContainer>
        </ResponsiveModal>
      </>
    )
  }
}

const mapStateToProps = (store: IStoreState) => {
  return {
    language: getLanguage(store),
    offlineResources: getOfflineData(store)
  }
}

export const SearchField = connect(mapStateToProps)(
  withTheme(injectIntl(SearchFieldClass))
)
