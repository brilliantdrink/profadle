import Dialog from '@corvu/dialog'
import {IoHelp} from 'solid-icons/io'

import styles from './intro-dialog.module.scss'

export default function IntroDialog({initialOpen}: { initialOpen: boolean }) {
  return <>
    <Dialog initialOpen={initialOpen} onOpenChange={open => {
      if (open) return
      localStorage.setItem('seen_help', '1')
    }}>
      <Dialog.Trigger class={styles.trigger}>
        <IoHelp aria-label={'Help'} />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay class={styles.overlay} />
        <Dialog.Content class={styles.modal}>
          <Dialog.Close class={styles.close} />
          <h2>How What Do?</h2>
          <p>Type a word. Press / click ENTER.</p>
          <p><span class={styles.green}>Green</span> means letter is in correct position.</p>
          <p><span class={styles.yellow}>Yellow</span> means letter is word and in wrong position.</p>
          <p>White means letter is not in word.</p>
          <p>You have 6 guesses.</p>
          <p>The random word is personalised, i.e. it cannot be spoiled.</p>
          <hr />
          <p>Every day you have a <em>¹⁄₃</em> chance to guess a profanity / naughty word.</p>
          <p>You want to guess many profanities.</p>
          <p>The New York Times can suck my ass.</p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  </>
}
