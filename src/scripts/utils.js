export function shouldNotIntercept(navigationEvent) {
  return (
    navigationEvent.canIntercept === false ||
    navigationEvent.hashChange || 
    navigationEvent.downloadRequest ||
    // If form submission let it go to the database
    navigationEvent.formData 
  )
}

export function updateTheDOMSomehow(data) {
  document.getElementById('content').innerHTML = data
}

export function findCardByPath(path, parent = document) {
  return parent.querySelector(`[href="${path}"]`)
}

export function getPersistentElement(parent = document) {
  return parent.querySelector('[data-persist="true"]')
}

export function getPeristentElementContainer(parent = document) {
  return parent.querySelector('[data-persist-container="true"]')
}