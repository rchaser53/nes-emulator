export type boolTupple = [boolean, boolean]

export interface RowColun {
  row: number
  column: number
}

export const convertDecimalToBinary = (decimal: number): number => {
  const AllTrue8bit = 0b11111111
  return parseInt(decimal.toString(2), 2) & AllTrue8bit
}

export const isDegitTrue = (binary: number, degit: number): boolean => {
  const compare = 1 << degit
  return (binary & compare) >> degit === 1
}

export const convertDecimalToBoolArray = (decimal: number): boolean[] => {
  const binary = convertDecimalToBinary(decimal)
  let boolArray: boolean[] = []
  for (let i = 0; i < 8; i++) {
    boolArray.push(isDegitTrue(binary, i))
  }
  return boolArray
}

export const createBaseArrays = () => [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0]
]

export const createSpriteInputs = (inputArray: number[]) => {
  const backOffset = 8
  const BaseArray = createBaseArrays()
  for (let i = 0; i < 8; i++) {
    for (let bit = 0; bit < 8; bit++) {
      const baseBit = Math.pow(2, bit)

      const back = (inputArray[i] & baseBit) === baseBit ? 1 : 0
      const front = (inputArray[i + backOffset] & baseBit) === baseBit ? 2 : 0
      BaseArray[i][bit] = front + back
    }
  }
  return BaseArray
}

export const createColorTileDef = (inputs: number[]): number[][] => {
  let baseIndex = 0
  return inputs.reduce<number[][]>((stack, next, index) => {
    if (index !== 0 && index % 4 === 0) {
      baseIndex++
    }
    stack[baseIndex] = tryInitializeArray(stack[baseIndex])
    stack[baseIndex] = stack[baseIndex].concat(convertDecimalToTwoBit(next))
    return stack
  }, [])
}

const tryInitializeArray = <T>(input: T[]): T[] => {
  return input == null ? ([] as T[]) : input
}

export const convertDecimalToTwoBit = (input: number): number[] => {
  let base = [0, 0, 0, 0]
  let arrayIndex = 0
  const eightBitArray = reverseArray(convertDecimalToBoolArray(input))
  for (let i = 0; i < 4; i++) {
    for (let k = 1; 0 <= k; k--) {
      if (eightBitArray[arrayIndex]) {
        base[i] += Math.pow(2, k)
      }
      arrayIndex++
    }
  }
  return base
}

export const reverseArray = (inputArray: any[]): any[] => {
  if (inputArray.length === 0) return []
  const baseArray: any[] = []
  const arrayLength = inputArray.length
  for (let i = 0; i < arrayLength; i++) {
    baseArray[i] = inputArray[arrayLength - i - 1]
  }
  return baseArray
}

export const convertIndexToRowColumn = (index: number): RowColun => {
  const row = Math.floor(index / 64)
  const column = Math.floor((index % 64) / 4)

  return { row, column }
}
