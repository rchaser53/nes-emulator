export type boolTupple = [ boolean, boolean ]

export const convertDecimalToBinary = (decimal: number): number => {
  const AllTrue8bit = 0b11111111
  return parseInt((decimal).toString(2), 2) & AllTrue8bit
}

export const isDegitTrue = (binary: number, degit: number): boolean => {
  const compare = 1 << (degit)
  return ((binary & compare) >> degit) === 1
}

export const convertDecimalToBoolArray = (decimal: number): boolean[] => {
  const binary = convertDecimalToBinary(decimal)
  let boolArray: boolean[] = []
  for (let i = 0; i < 8; i++) {
    boolArray.push(isDegitTrue(binary, i))
  }
  return boolArray
}

export const createTwoBitTupple = (front: boolean[], back: boolean[]): boolTupple[] => {
  return front.reduce<boolTupple[]>((stack, _, index) => {
    return stack.concat([ [ front[index], back[index] ]]);
  }, [])
}

export const createSpliteInputs = (inputArray: number[]) => {
  const front = inputArray.slice(8, 16).map((num) => {
    return convertDecimalToBoolArray(num)
  })

  const back = inputArray.slice(0, 8).map((num) => {
    return convertDecimalToBoolArray(num)
  })

  return front.reduce<boolTupple[][]>((stack, _, index) => {
    return stack.concat([createTwoBitTupple(front[index], back[index])])
  }, [])
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
  return input == null ? [] as T[] : input
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
    baseArray[i] =  inputArray[arrayLength - i - 1]
  }
  return baseArray
}

export const convertBoolArrayToDecimal = (boolArray: boolean[]): number => {
  return boolArray.reduce((sum, next, index) => {
    sum += (next) ? Math.pow(2, boolArray.length - 1 - index) : 0
    return sum
  }, 0)
}



// export const createColorTopBitsTupples = (inputs) => {
//   // const base: boolTupple[][][] = []

//   const eightBitBooleansArray = inputs.map(convertDecimalToBoolArray)

//   const base: any = []

//   eightBitBooleansArray.forEach((eightBitBooleans, outerIndex) => {
//     // const isAfterArea = (index % 2) === 0


//     const rowBase = []
//     eightBitBooleans.forEach((bool, innerIndex) => {
//       rowBase[]
//     })
//   })

//   // for (let row = 0; row < 16; row++) {
//   //   base[row] = (base[row] == null)
//   //                   ? []
//   //                   : base[row];
//   //   for (let column = 0; column < 16; column++) {
//   //     base[row][column] = (base[row][column] == null)
//   //                       ? []
//   //                       : base[row][column];
      

//   //   }
//   // }
// }