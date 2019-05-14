// enables intelligent code completion for Cypress commands
// https://on.cypress.io/intelligent-code-completion
/// <reference types="Cypress" />

it('renders 5 items on the server', () => {
  cy.request('/')
    .its('body')
    .then(html => {
      const $li = Cypress.$(html).find('li')
      expect($li)
        .to.have.property('length')
        .equal(4)
      cy.state('document').write(html)
    })
})

it('skips client-side bundle', () => {
  cy.request('/')
    .its('body')
    .then(html => {
      // remove the application code bundle
      html = html.replace('<script src="/bundle.js"></script>', '')
      cy.state('document').write(html)
    })
  // now we can use "normal" Cypress api to confirm
  // number of list element
  cy.get('li').should('have.length', 4)
})

it.only('disables component methods from createReactClass', () => {
  let createReactClass
  cy.window().then(win => {
    Object.defineProperty(win, 'createReactClass', {
      get () {
        return definition => {
          definition.componentDidMount = () => null
          return createReactClass(definition)
        }
      },
      set (fn) {
        createReactClass = fn
      }
    })
  })
  cy.request('/')
    .its('body')
    .then(html => {
      cy.state('document').write(html)
    })
  cy.get('li').should('have.length', 4)
  // since we disabled componentDidMount the button should
  // never become enabled
  cy.get('button').should('be.disabled')
})
