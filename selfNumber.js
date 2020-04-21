const sumSelfNumber = n => {
  let selfNumbers = []
  let sumSelfNumbers = 0
  let sumBox = []
  for (let i = 0; i < n; i++) {
    let sum = [...(i + '')].map(v => parseInt(v)).reduce((p, c) => p + c) + i
    sumBox.push(sum)
    if (!sumBox.includes(i)) {
      selfNumbers.push(i)
      sumSelfNumbers += i
    }
  }
  return sumSelfNumbers
}

const result = sumSelfNumber(5000)
console.log(result)
