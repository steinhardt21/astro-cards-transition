import {
  shouldNotIntercept,
  updateTheDOMSomehow,
  findCardByPath,
  getPeristentElementContainer,
  getPersistentElement
} from './utils.js'

let previousPageScroll = 0

navigation.addEventListener('navigate', (navigationEvent) => {
  if(shouldNotIntercept(navigationEvent)) return

  const toUrl = new URL(navigationEvent.destination.url)
  const toPath = toUrl.pathname
  const fromPath = location.pathname

  if(location.origin !== toUrl.origin) return // so if they have different domains

  if(toPath.indexOf('/playlist') === 0) {
    return handlePlaylistTransition(navigationEvent, toPath, fromPath)
  } else {
    return handleHomeTransition(navigationEvent, toPath, fromPath)
  }
})

function handlePlaylistTransition(navigationEvent, toPath, fromPath) {
  navigationEvent.intercept({
    scroll: 'manual',
    async handler() {
      const response = await fetch('/fragments' + toPath)
      const data = await response.text()

      if(!document.startViewTransition) {
        updateTheDOMSomehow(data)
        document.documentElement.scrollTop = 0
        return
      }

      document
        .querySelectorAll('.card')
        .forEach(card => card.classList.remove('with-transition'))

      const card = findCardByPath(toPath) // this search is performed thanks to the metadata saved on the html element

      let persistentElement

      if(card) {
        card.classList.add('with-transition')
        persistentElement = getPersistentElement(card) // save a reference to any persisted elements if they exist
      }

      previousPageScroll = document.documentElement.scrollTop // save the page scroll to restore it on the way back

      document.startViewTransition(() => {
        updateTheDOMSomehow(data)
        document.documentElement.scrollTop = 0

        const persitentElementContainer = getPeristentElementContainer()

        // plate the persistent element into its persistent container in the updated DOM
        if(persistentElement && persitentElementContainer) {
          persitentElementContainer.replaceChildren(persistentElement)
        }
      })
    }
  })
}

function handleHomeTransition(navigationEvent, toPath, fromPath) {
  navigationEvent.intercept({
    scroll: 'manual',
    async handler() {
      const response = await fetch('/fragments' + toPath)
      const data = await response.text()

      if(!document.startViewTransition) {
        updateTheDOMSomehow(data)
        return
      }

      const persistentElement = getPersistentElement()
      
      document.startViewTransition(() => {
        updateTheDOMSomehow(data) 

        const card = findCardByPath(fromPath) // find the card that matches the playlist that we're transitioning back from

        if(card) {
          card.classList.add('with-transition')
          const persistentElementContainer = getPeristentElementContainer(card)

          if(persistentElement && persistentElementContainer) {
            persistentElementContainer.replaceChildren(persistentElement)
          }
        }

        if(previousPageScroll) {
          document.documentElement.scrollTop = previousPageScroll
        }
      })
    }
  })
}