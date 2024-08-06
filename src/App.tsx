import {createMemo, createSignal} from 'solid-js'
import {Toaster} from 'solid-toast'

import './style.scss'
import Header from './components/Header'
import Grid from './components/Grid'
import Keyboard from './components/Keyboard'
import Signature from './components/Signature'

import {dateNumber} from './pseudo-random'
import {allWords, todayWord} from './word'
import createPersistedSignal from './persistedSignal'
import {genBackspace, genSubmit, genTypeKey, getRevealedRowFromTyped} from './input-handling'
import {Reaction} from './components/Grid/Grid'

// console.log(todayWord)

export default function App() {
  const [typedLetters, setTypedLetters] = createPersistedSignal<(string | null)[][]>(String(dateNumber) + '_typedLetters',
    Array(6).fill(0).map(() => Array(5).fill(null))
  )
  const [revealed, setRevealed] = createSignal<('absent' | 'present' | 'correct')[][]>(
    typedLetters()
      .filter(row => !row.includes(null))
      .filter(row => {
        const word = row.join('').toLowerCase()
        return allWords.includes(word)
      })
      .map((row) => getRevealedRowFromTyped(todayWord, row))
  )
  const [revealAnimation, setRevealAnimation] = createSignal<boolean>(false)
  const [guesses, setGuesses] = createSignal(
    typedLetters().every(row => row.every(letter => letter !== null)) ? 6
      : Math.max(0,
        typedLetters()
          .findIndex(row => {
            if (row.includes(null)) return true
            const word = row.join('').toLowerCase()
            return !allWords.includes(word)
          })
      )
  )
  const [punchIn, setPunchIn] = createSignal<null | [number, number]>(null)
  const [playReaction, setPlayReaction] = createSignal<Reaction | null>(null)

  const typeKey = genTypeKey({
    guesses, setPunchIn, setRevealAnimation, setTypedLetters, typedLetters, setPlayReaction
  })

  const backspace = genBackspace({
    guesses, setPunchIn, setRevealAnimation, setTypedLetters, typedLetters
  })

  const submit = genSubmit({
    guesses, typedLetters, setPunchIn, setRevealed, revealed, setGuesses, setRevealAnimation, setTypedLetters,
    setPlayReaction
  })

  const hasWon = createMemo(() => revealed().some(row => row.every(cell => cell === 'correct')));
  const gameOver = createMemo(() => hasWon() || typedLetters().every((row, rowIndex) => row.every((cell, colIndex) => !!revealed()[rowIndex]?.[colIndex])))
  const keyboardMarkings = createMemo(() => {
    const keyboardMarkings: Record<string, 'absent' | 'present' | 'correct'> = {}
    typedLetters().forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (!cell) return
        cell = cell.toLowerCase()
        const marking = revealed()[rowIndex]?.[colIndex]
        if (!(cell in keyboardMarkings) || (keyboardMarkings[cell] === 'present' && marking === 'correct'))
          keyboardMarkings[cell] = marking
      })
    })
    return keyboardMarkings
  })

  const helpDialogInitialOpen = createMemo(() => !localStorage.getItem('seen_help'))

  return <>
    <Toaster position="top-center" gutter={8} />
    <Header helpDialogInitialOpen={helpDialogInitialOpen()} />
    <Grid typedLetters={typedLetters} punchIn={punchIn} revealed={revealed} revealAnimation={revealAnimation}
          guesses={guesses} playReaction={playReaction} />
    <Keyboard typeKey={typeKey} backspace={backspace} submit={submit} disable={gameOver}
              keyboardMarkings={keyboardMarkings} />
    <Signature class={'signature'} />
  </>
}
