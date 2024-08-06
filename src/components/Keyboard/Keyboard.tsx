import {Accessor, createEffect, JSX, JSXElement, onCleanup} from 'solid-js'
import {default as cn} from 'classnames'

import styles from './keyboard.module.scss'

const keys: Array<Array<string | { value: string | JSXElement, long: true, action: 'backspace' | 'submit' }>> = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  [
    {value: 'enter', long: true, action: 'submit'},
    'z', 'x', 'c', 'v', 'b', 'n', 'm',
    {value: <Delete />, long: true, action: 'backspace'},
  ],
]

export default function Keyboard({typeKey, backspace, submit, disable, keyboardMarkings}: {
  typeKey: (key: string) => void,
  backspace: () => void,
  submit: () => void,
  disable: Accessor<boolean>
  keyboardMarkings: Accessor<Record<string, 'absent' | 'present' | 'correct'>>
}) {
  createEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.altKey || event.ctrlKey || event.metaKey) return
      if (keys.flat().includes(event.key)) typeKey(event.key)
      else if (event.key === 'Backspace') backspace()
      else if (event.key === 'Enter') submit()
    }

    if (!disable())
      document.addEventListener('keydown', handleKeyDown)
    onCleanup(() => document.removeEventListener('keydown', handleKeyDown));
  })

  return <>
    <div class={styles.keyboard}>
      {keys.map((row, i) => {
        return <div class={styles.row}>
          {row.map((key, i) => {
            let inner: string | JSXElement
            if (typeof key === 'string') inner = key.toUpperCase()
            else if (typeof key.value == 'string') inner = key.value.toUpperCase()
            else inner = key.value
            let action
            if (disable()) action = () => 0
            else if (typeof key === 'string') action = () => typeKey(key)
            else if (key.action === 'backspace') action = backspace
            else if (key.action === 'submit') action = submit
            let markingClass = null
            if (typeof key === 'string' && key in keyboardMarkings()) {
              markingClass = styles[keyboardMarkings()[key]]
            }
            return <button onClick={action} class={cn(
              styles.key,
              typeof key !== 'string' && key.long && styles.long,
              disable() && styles.disable,
              markingClass
            )}>{inner}</button>
          })}
        </div>
      })}
    </div>
  </>
}

// https://feathericons.dev/?search=delete&iconset=feather&format=tsx
export function Delete(props: JSX.IntrinsicElements["svg"]) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor"
         stroke-linecap="round" stroke-linejoin="round" stroke-width="2" {...props}>
      <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
      <line x1="18" x2="12" y1="9" y2="15" />
      <line x1="12" x2="18" y1="9" y2="15" />
    </svg>
  );
}

