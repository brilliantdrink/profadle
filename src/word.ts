import wordsRaw from './words.txt'
import wordsNaughtyRaw from './words_naughty.txt'
import wordsGuessableRaw from './words_guessable.txt'
import {isNaughtyToday, randomForDate} from './pseudo-random'

export const words = wordsRaw.split('\n').filter(v => !v.startsWith('#'))
export const wordsNaughty = wordsNaughtyRaw.split('\n').filter(v => !v.startsWith('#'))
export const wordsGuessable = wordsGuessableRaw.split('\n').filter(v => !v.startsWith('#'))
export const allWords = words.concat(wordsNaughty).concat(wordsGuessable)
export const todayWord = isNaughtyToday
  ? wordsNaughty[Math.floor(wordsNaughty.length * randomForDate)]
  : words[Math.floor(words.length * randomForDate)]
