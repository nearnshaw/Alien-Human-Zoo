import { setupGame } from './game'
import { setupUi } from './ui'

export function main() {
    setupGame()
    setupUi() // renders nothing on desktop; on mobile it carries the option buttons
}
