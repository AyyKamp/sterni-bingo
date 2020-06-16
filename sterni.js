const fs = require('fs')
const readln = require('readline')
const process = require('process')

/* const bingo = [
  [10, 81, 54, 29, 47, 64, 04, 76, 13, 92, 70, 95, 50, 44, 16, 28, 26, 33, 77, 40, 11, 53, 89, 56, 02,],
  [91, 70, 59, 65, 07, 25, 45, 82, 18, 54, 79, 68, 15, 22, 86, 02, 57, 55, 94, 40, 43, 01, 72, 26, 80,],
  [14, 77, 38, 02, 85, 61, 23, 96, 49, 54, 06, 88, 13, 31, 75, 42, 26, 65, 59, 97, 70, 08, 51, 12, 20,],
  [13, 55, 41, 69, 93, 09, 32, 74, 26, 87, 62, 02, 99, 17, 34, 46, 83, 54, 78, 21, 58, 15, 66, 37, 70,],
  [91, 70, 39, 63, 07, 25, 46, 82, 18, 54, 79, 68, 13, 22, 86, 02, 57, 35, 94, 40, 43, 01, 72, 26, 80,],
]

const hatteSchon = []

for (let i = 1; i <= 100; i++) {
  hatteSchon[i] = 0
}

for (let sheet of bingo) {
  sheet.forEach((e, i) => {
    sheet[i] = { number: e, crossed: false}
  })
} */

const bingo = JSON.parse(fs.readFileSync('./sterni.json'))
const hatteSchon = JSON.parse(fs.readFileSync('./hatteschon.json'))

let cl

function crossOut(number) {
	for (let sheet of bingo) {
		for (let kästchen of sheet) {
			if (kästchen.number === number && !kästchen.crossed) kästchen.crossed = true
		}
	}
}

function question (q) {
	return new Promise((res, rej) => {
		cl.question(q, (answer) => {
			res(answer)
		})
	})
}

function out(text) {
  process.stdout.write(text)
}

function red (text) {
  return '\x1b[31m' + text + '\x1b[0m'
}

function green (text) {
  return '\x1b[32m' + text + '\x1b[0m'
}

function printSheets() {
  for (let sheet of bingo) {
    let outSring = ''
    for (let index in sheet) {
      let numberString = `${sheet[index].number > 9 ? sheet[index].number: `0${sheet[index].number}` } `
      if (index % 5 === 0) outSring += '\n'
      if (sheet[index].crossed) outSring += green(numberString)
      else outSring += red(numberString)
    }
    console.log(outSring + '\n')
  }
}

function countKronkorken() {
  console.log(hatteSchon.reduce((acc, curr) => acc += curr))
}

function sync() {
  for (let sheet of bingo) {
    for (let index in sheet) {
      sheet[index].crossed = false;
    }
  }
  
  for (let number in hatteSchon) {
    let amount = hatteSchon[number]
    if (amount > 0) {
      for (let i = 0; i < amount; i++) {
        crossOut(parseInt(number))
      }
    }
  }

  fs.writeFileSync('./sterni.json', JSON.stringify(bingo, null, 2))
  fs.writeFileSync('./hatteschon.json', JSON.stringify(hatteSchon, null, 2))
}

async function addLoop () {
  while (true) {
    let bierdeckel = parseInt(await question('Enter Bierdeckel Number: '))
    if (isNaN(bierdeckel)) {
      let quit = await question('Exit?: ')
      if (quit === 'y' || quit === 'yes') {
        break
      }
    } else {
      addNew(bierdeckel)
    }
  }
}

function addNew (bierdeckel) {
  crossOut(bierdeckel)
  if (hatteSchon[bierdeckel] === 0) console.log('New!')
  hatteSchon[bierdeckel]++
  fs.writeFileSync('./sterni.json', JSON.stringify(bingo, null, 2))
  fs.writeFileSync('./hatteschon.json', JSON.stringify(hatteSchon, null, 2))
}

async function removeLoop () {
  while (true) {
    let bierdeckel = parseInt(await question('Enter Bierdeckel Number: '))
    if (isNaN(bierdeckel)) {
      let quit = await question('Exit?: ')
      if (quit === 'y' || quit === 'yes') {
        break
      }
    } else {
      removeThing(bierdeckel)
    }
  }
}

function removeThing (bierdeckel) {
  if (hatteSchon[bierdeckel] > 0) hatteSchon[bierdeckel]--
  else console.log('penis')
  fs.writeFileSync('./hatteschon.json', JSON.stringify(hatteSchon, null, 2))
}

function range(start, stop, step) {
  let result = []
  for (let i = start; step > 0 ? i < stop : i > stop; i += step) {
    result.push(i)
  }

  return result
}

function checkWinner () {
  bingo.forEach((sheet, sheetIndex) => {
    // check diagonal top left to bottom right
    let n = Math.sqrt(sheet.length)
    if (
      range(0, sheet.length, 6)
      .every(val => sheet[val].crossed)
      ) {
        console.log(`sheet ${sheetIndex + 1}, digonal ⤡`)
      }
    // check diagonal top right to bottom left
    if (
      range(n - 1, (sheet.length - n) + 1, 4)
      .every(val => sheet[val].crossed)
      ) {
        console.log(`sheet ${sheetIndex + 1}, digonal ⤢`)
      }
    // check rows
    for (let i = 0; i < sheet.length; i += n) {
      if (
        range(i, i + n, 1)
        .every(val => sheet[val].crossed)
        ) {
          console.log(`sheet ${sheetIndex + 1}, row ${(i / n) + 1}`)
        }
    }
    // check columns
    for (let i = 0; i < n; i++) {
      if (
        range(i, sheet.length, 5)
        .every(val => sheet[val].crossed)
        ) {
          console.log(`sheet ${sheetIndex + 1}, column ${i + 1}`)
        }
    }
  })
}

;(async function main () {
  cl = readln.createInterface(process.stdin, process.stdout)

  while (true) {
    let task = await question('What do?: ')
    if (task === 'add' || task === 'a') {
      await addLoop()
    } else if (task === 'print' || task === 'p') {
      printSheets()
    } else if (task === 'remove' || task === 'r') {
      await removeLoop()
    } else if (task === 'count' || task === 'c') {
      countKronkorken()
    } else if (task === 'sync' || task === 's') {
      sync()
    } else if (task === 'winner' || task === 'w') {
      checkWinner()
    } else if (task === 'quit' || task === 'q') {
      process.exit()
    } else if (task.startsWith('e ')) {
      console.log(eval(task.substring(1, task.length)))
    }
  }
})()