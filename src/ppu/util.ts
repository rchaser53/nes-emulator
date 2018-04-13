export const convertDecimalToBinary = (decimal: number): number => {
  const AllTrue8bit = 0b11111111
  return parseInt((decimal).toString(2), 2) & AllTrue8bit
}

export const isDegitTrue = (binary: number, degit: number): boolean => {
  const compare = 1 << (degit)
  return ((binary & compare) >> degit) === 1
}

export const convertDecimalToBoolArray = (decimal: number): boolean[] => {
  const binary = this.convertDecimalToBinary(decimal)
  let boolArray: boolean[] = []
  for (let i = 0; i < 8; i++) {
    boolArray.push(this.isDegitTrue(binary, i))
  }
  return boolArray
}
