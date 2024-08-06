export function lcg(a: number, c: number, m: number, seed: number) {
  const state = (a * seed + c) % m
  return state / m
}

let a = Number(localStorage.getItem('seed_m') ?? undefined) // Multiplier
let c = Number(localStorage.getItem('seed_i') ?? undefined) // Increment
const m = 2 ** 32 // Modulus

if (isNaN(a)) localStorage.setItem('seed_m', String(a = Math.floor(Math.random() * m)))
if (isNaN(c)) localStorage.setItem('seed_i', String(c = Math.floor(Math.random() * m)))

const currentDate = new Date()
currentDate.setDate(currentDate.getDate() + 5)
export const dateNumber = Number(String(currentDate.getDate()) + String(currentDate.getMonth()) + String(currentDate.getFullYear())) * 200

export const randomForDate = lcg(a, c, m, dateNumber)
export const isNaughtyToday = (lcg(a, c, m, dateNumber / 2)) < .2
