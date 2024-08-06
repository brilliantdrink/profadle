import {Accessor, createEffect, createMemo, onMount} from 'solid-js'
import confetti from 'canvas-confetti'
import {default as cn} from 'classnames'

import styles from './grid.module.scss'
import * as letters from '../../images/letters'

import bearIcon from '../../images/reactions/bear.svg'
import flowerIcon from '../../images/reactions/flower.svg'
import heartIcon from '../../images/reactions/heart.svg'
import madIcon from '../../images/reactions/mad.svg'

const matchPath = /d="([^"]+)/
const confettiShapes = {
  bear: {
    shape: confetti.shapeFromPath({path: (bearIcon.match(matchPath) as string[])[1]}),
    scalar: 3,
    color: '#0f0',
  },
  flower: {
    shape: confetti.shapeFromPath({path: (flowerIcon.match(matchPath) as string[])[1]}),
    scalar: 3,
    color: '#ff0',
  },
  heart: {
    shape: confetti.shapeFromPath({path: (heartIcon.match(matchPath) as string[])[1]}),
    scalar: 3,
    color: '#f00',
  },
  mad: {
    shape: confetti.shapeFromPath({path: (madIcon.match(matchPath) as string[])[1]}),
    scalar: 2,
    color: '#fff',
  },
}

export type Reaction = keyof typeof confettiShapes

interface GridProps {
  typedLetters: Accessor<(null | string)[][]>
  punchIn: Accessor<null | [number, number]>
  revealed: Accessor<('absent' | 'present' | 'correct')[][]>
  revealAnimation: Accessor<boolean>,
  guesses: Accessor<number>
  playReaction: Accessor<Reaction | null>
}

export default function Grid({typedLetters, punchIn, revealed, revealAnimation, playReaction, guesses}: GridProps) {
  let reactionsCanvas: HTMLCanvasElement & { confetti: confetti.CreateTypes } = null!

  onMount(() => {
    reactionsCanvas.confetti = reactionsCanvas.confetti || confetti.create(reactionsCanvas, {resize: true});
  });

  const hasOneCorrectGuess = createMemo(() =>
    revealed().some(row => row.every(letter => letter === 'correct'))
  )
  const guessesShownAbove = createMemo(() => Math.min(5, guesses() - Number(hasOneCorrectGuess())))

  createEffect(() => {
    const reaction = playReaction()
    if (!reaction) return
    reactionsCanvas.confetti({
      particleCount: 1,
      startVelocity: 0,
      gravity: -.3,
      drift: .4,
      scalar: confettiShapes[reaction].scalar,
      shapes: [confettiShapes[reaction].shape],
      colors: [confettiShapes[reaction].color],
      // @ts-ignore
      flat: true,
      ticks: 100,
      origin: {
        y: .9,
        x: .3,
      }
    })
  })

  return <>
    <div class={styles.grid}>
      <div class={styles.guesses}>
        {typedLetters().map((row, rowIndex) => {
          if (rowIndex >= guessesShownAbove()) return
          return <div class={styles.word}>
            {row.map((cell, colIndex) => {
              const revealedVal = revealed()
              const revealedValCell = revealedVal[rowIndex]?.[colIndex]
              // const shouldAnimateRow = revealedVal.length - 1 === rowIndex && revealAnimation()
              return <div class={cn(
                styles.letter,
                revealedValCell && styles[revealedValCell],
                // shouldAnimateRow && styles.reveal,
              )}>
                {cell}
              </div>
            })}
          </div>
        })}
      </div>
      <div class={styles.input}>
        {typedLetters()[guessesShownAbove()].map((letter, colIndex) => {
          const punchInVal = punchIn()
          return (
            <div class={cn(
              styles.letterWrapper,
              punchInVal && punchInVal[1] === colIndex && styles.punchIn,
              hasOneCorrectGuess() && styles.correct,
              guesses() === 6 && !hasOneCorrectGuess() && styles.wrong,
            )}>
              <div class={styles.letter} style={letter && letter in letters ? {
                'background-image': `url(${(letters as Record<string, string>)[letter?.toUpperCase()]})`
              } : undefined}>
                {letter}
              </div>
            </div>
          )
        })}
      </div>
      <canvas class={styles.reactionsCanvas} ref={reactionsCanvas} />
      <div class={styles.guessesIndicator}>
        {!hasOneCorrectGuess() && guesses() < 6 ? `${6 - guesses()} guesses left` : ' '}
      </div>
    </div>
  </>
}

