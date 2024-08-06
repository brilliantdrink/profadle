import {Accessor, Setter} from 'solid-js'
import {toast} from 'solid-toast'
import cn from 'classnames'

import styles from './toast.module.scss'

import celebrate from './confetti-calls'
import {allWords, todayWord} from './word'

import soundType from './sounds/ui-type.mp3'
import soundAffirmation1 from './sounds/ui-affirmation-1.mp3'
import soundAffirmation2 from './sounds/ui-affirmation-2.mp3'
import soundAffirmation3 from './sounds/ui-affirmation-3.mp3'
import soundCorrect from './sounds/ui-correct.mp3'
import {Reaction} from './components/Grid/Grid'


// @ts-ignore
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();
const soundTypeAudio = new Audio(soundType)
soundTypeAudio.volume = .5
soundTypeAudio.load()

interface GenTypeKeyProps {
  guesses: Accessor<number>
  typedLetters: Accessor<(string | null)[][]>
  setTypedLetters: (newValue: (string | null)[][]) => void
  setPunchIn: Setter<null | [number, number]>
  setRevealAnimation: Setter<boolean>
  setPlayReaction: Setter<null | Reaction>
}

export function genTypeKey(
  {guesses, typedLetters, setTypedLetters, setPunchIn, setRevealAnimation, setPlayReaction}: GenTypeKeyProps
) {
  return function typeKey(key: string) {
    setPlayReaction(null)
    key = key.toUpperCase()
    let colIndex: number, rowIndex: number = guesses();
    const current = [...typedLetters()]
    const row = current[rowIndex]
    colIndex = row.indexOf(null)
    if (colIndex !== -1) {
      audioContext.resume() // removes delay (somehow)
      soundTypeAudio.currentTime = 0
      setTimeout(() => soundTypeAudio.play())
    }
    current[rowIndex][colIndex] = key
    setTypedLetters(current)
    setPunchIn([rowIndex, colIndex])
    setRevealAnimation(false)
  }
}

interface GenBackspaceProps {
  guesses: Accessor<number>
  typedLetters: Accessor<(string | null)[][]>
  setTypedLetters: (newValue: (string | null)[][]) => void
  setPunchIn: Setter<null | [number, number]>
  setRevealAnimation: Setter<boolean>
}

export function genBackspace(
  {guesses, typedLetters, setTypedLetters, setPunchIn, setRevealAnimation}: GenBackspaceProps
) {
  return function backspace() {
    let colIndex: number = 0, rowIndex: number = guesses();
    const current = [...typedLetters()]
    const row = current[rowIndex]
    for (let i = 0; i < row.length; i++) {
      if (row[i] !== null) colIndex++
    }
    colIndex--
    if (colIndex !== -1) {
      audioContext.resume() // removes delay (somehow)
      soundTypeAudio.currentTime = 0
      setTimeout(() => soundTypeAudio.play())
    }
    current[rowIndex][colIndex] = null
    setTypedLetters(current)
    setPunchIn(null)
    setRevealAnimation(false)
  }
}

export function getRevealedRowFromTyped(todayWord: string, row: (string | null)[]) {
  return row.map((letter: string, index) => {
    letter = letter.toLowerCase()
    if (letter === todayWord[index]) return 'correct'
    else if (todayWord.includes(letter)) return 'present'
    else return 'absent'
  })
}

interface GenSubmitProps {
  guesses: Accessor<number>
  typedLetters: Accessor<(string | null)[][]>
  setTypedLetters: (newValue: (string | null)[][]) => void
  setPunchIn: Setter<null | [number, number]>
  setRevealAnimation: Setter<boolean>
  setRevealed: Setter<('absent' | 'present' | 'correct')[][]>
  revealed: Accessor<('absent' | 'present' | 'correct')[][]>
  setGuesses: Setter<number>
  setPlayReaction: Setter<null | Reaction>
}

const points = {
  absent: 0,
  present: 1,
  correct: 2,
}

export function genSubmit(
  {guesses, typedLetters, setPunchIn, setRevealed, revealed, setGuesses, setRevealAnimation, setPlayReaction}:
    GenSubmitProps
) {
  return function genSubmit(force = false) {
    const row = typedLetters()[guesses()]
    if (row.includes(null)) return
    const word = row.join('').toLowerCase()
    if (!force && !allWords.includes(word)) {
      toast.custom((t) => (
        <div class={cn(styles.toast, t.visible ? styles.open : styles.close)}>
          <p>"{word.toUpperCase()}" not in word list</p>
        </div>
      ))
      // show not a word modal
      return
    }
    setGuesses(guesses() + 1)
    const revealedRow: ('absent' | 'present' | 'correct')[] = getRevealedRowFromTyped(todayWord, row)

    setPunchIn(null)
    setRevealed([...revealed(), revealedRow])
    setRevealAnimation(true)
    const correctness = revealedRow.reduce((acc, letter) => acc + points[letter], 0)
    let blockReaction = false
    if (word === 'times') {
      setPlayReaction('mad')
      blockReaction = true
    }
    if (correctness >= 2 && correctness < 5) {
      (new Audio(soundAffirmation1)).play()
      !blockReaction && setPlayReaction('flower')
    } else if (correctness >= 5 && correctness < 10) {
      (new Audio(soundAffirmation2)).play()
      !blockReaction && setPlayReaction(Math.random() < .5 ? 'heart' : 'bear')
    } else if (correctness === 10) {
      (new Audio(soundAffirmation3)).play()
    }
    const noGuessesLeft = typedLetters()
      .every((row, rowIndex) =>
        row.every((_, colIndex) =>
          !!revealed()[rowIndex]?.[colIndex]
        )
      );
    if (noGuessesLeft) {
      toast.custom((t) => (
        <div class={cn(styles.toast, t.visible ? styles.open : styles.close)}>
          <p>The word was "{todayWord.toUpperCase()}"</p>
        </div>
      ))
    }
    if (!revealedRow.every(cell => cell === 'correct')) return
    setTimeout(() => {
      (new Audio(soundCorrect)).play()
      celebrate()
    }, 500)
  }
}
