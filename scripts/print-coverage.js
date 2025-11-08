const fs = require('fs')
const path = require('path')

const summaryPath = path.join(__dirname, '..', 'coverage', 'coverage-summary.json')

if (!fs.existsSync(summaryPath)) {
  console.error('No se encontró coverage-summary.json. Ejecuta `jest --coverage` primero.')
  process.exit(2)
}

const raw = fs.readFileSync(summaryPath, 'utf8')
const data = JSON.parse(raw)

const total = data.total
if (!total) {
  console.error('coverage-summary.json no contiene la sección total.')
  process.exit(2)
}


const statements = total.statements.pct
const branches = total.branches.pct
const functions = total.functions.pct
const lines = total.lines.pct


const overall = (statements + branches + functions + lines) / 4


const thresholdEnv = process.env.COVERAGE_THRESHOLD
if (thresholdEnv) {
  const threshold = Number(thresholdEnv)
  if (!Number.isFinite(threshold)) {
    console.warn('COVERAGE_THRESHOLD no es un número válido.')
    process.exit(0)
  }

  if (overall < threshold) {
    console.error(`Coverage ${pct}% es menor que el umbral requerido ${threshold}%`) 
    process.exit(1)
  } else {
    console.log(`Coverage cumple el umbral de ${threshold}%`) 
  }
}

process.exit(0)
