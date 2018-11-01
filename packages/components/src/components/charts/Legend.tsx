import * as React from 'react'
import styled from 'styled-components'
import { IDataPoint, colours } from './datapoint'

export interface ILegendProps {
  data: IDataPoint[]
}

const Container = styled.div`
  display: flex;
`
const Column = styled.div`
  flex-grow: 1;
  flex-basis: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`

const LegendItemBase = styled.div`
  font-family: ${({ theme }) => theme.fonts.lightFont};
  color: ${({ theme }) => theme.colors.copy};
  &::after {
    content: ':';
  }
  &::before {
    width: 25px;
    height: 8px;
    display: block;
    margin-bottom: 6px;
    content: '';
  }
`
const LegendItem = styled(LegendItemBase).attrs<{ colour: string }>({})`
  &::before {
    background: ${({ colour }) => colour};
  }
`

const EstimateLegendItem = styled(LegendItemBase)`
  &::before {
    height: 4px;
    border: 2px dotted ${({ theme }) => theme.colors.accent};
    background: transparent;
  }
`

const DataLabel = styled.label`
  font-family: ${({ theme }) => theme.fonts.lightFont};
  color: ${({ theme }) => theme.colors.copy};
  height: 70px;
  margin-top: 1em;
`
const DataTitle = styled.h3`
  font-size: 20px;
  color: ${({ theme }) => theme.colors.accent};
`
const DataDescription = styled.span`
  font-size: 12px;
`

const calculateSum = (points: IDataPoint[]) =>
  points.reduce((sum, item) => sum + item.value, 0)

function LegendHeader({
  dataPoint,
  colour
}: {
  dataPoint: IDataPoint
  colour: string
}) {
  if (dataPoint.estimate) {
    return <EstimateLegendItem>{dataPoint.label}</EstimateLegendItem>
  }

  return <LegendItem colour={colour}>{dataPoint.label}</LegendItem>
}

function LegendBody({
  dataPoint,
  total,
  estimate
}: {
  dataPoint: IDataPoint
  total: number
  estimate: number
}) {
  let title = `${Math.round(dataPoint.value / total * 100)}%`

  if (dataPoint.total) {
    title = `${Math.round(dataPoint.value / estimate * 100)}%`
  }

  if (dataPoint.estimate) {
    title = dataPoint.value.toString()
  }

  return (
    <DataLabel>
      <DataTitle>{title}</DataTitle>
      <DataDescription>{dataPoint.description}</DataDescription>
    </DataLabel>
  )
}

export function Legend(props: ILegendProps) {
  const dataPointsWithoutEstimates = props.data.filter(
    dataPoint => !dataPoint.estimate
  )
  const fromSmallest = [...props.data].sort((a, b) => a.value - b.value)
  const allTotalPoints = fromSmallest.filter(({ total }) => total)
  const allEstimatePoints = fromSmallest.filter(({ estimate }) => estimate)

  return (
    <Container>
      {props.data.map((dataPoint, i) => {
        const colour = colours[dataPointsWithoutEstimates.indexOf(dataPoint)]
        return (
          <Column key={i}>
            <LegendHeader dataPoint={dataPoint} colour={colour} />
            <LegendBody
              dataPoint={dataPoint}
              total={calculateSum(allTotalPoints)}
              estimate={calculateSum(allEstimatePoints)}
            />
          </Column>
        )
      })}
    </Container>
  )
}
