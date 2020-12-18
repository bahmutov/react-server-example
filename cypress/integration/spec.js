// enables intelligent code completion for Cypress commands
// https://on.cypress.io/intelligent-code-completion
/// <reference types="Cypress" />

/**
 * clears the application's document
 * before pasting new HTML there
 */
const resetDocument = () => {
  const doc = cy.state('document')
  doc.body.innerHTML = ''
}

describe('E2E for SSR', () => {
  beforeEach(resetDocument)

  it('renders 5 items on the server (cy.state)', () => {
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

  it('renders 5 items on the server', () => {
    cy.request('/')
      .its('body')
      .then(html => {
        const $li = Cypress.$(html).find('li')
        expect($li)
          .to.have.property('length')
          .equal(4)
        cy.document().invoke({ log: false }, 'write', html)
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

  it('disables component methods from createReactClass', () => {
    cy.window().then(win => {
      let createReactClass
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

  it('how to know if componentDidMount was called', () => {
    let componentDidMountSet
    cy.window().then(win => {
      let createReactClass
      Object.defineProperty(win, 'createReactClass', {
        get () {
          return definition => {
            definition.componentDidMount = cy.stub().as('componentDidMount')
            componentDidMountSet = true
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

    // wait until custom assertion passes
    cy.wrap(null).should(() => expect(componentDidMountSet).to.be.true)
    // now the alias should exist
    cy.get('@componentDidMount').should('have.been.calledOnce')
  })

  it('calls componentDidMount no-op', () => {
    let componentDidMountSet

    cy.window().then(win => {
      let createReactClass
      Object.defineProperty(win, 'createReactClass', {
        get () {
          return definition => {
            definition.componentDidMount = cy.stub().as('componentDidMount')
            componentDidMountSet = true
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

    cy.waitUntil(() => cy.wrap(componentDidMountSet))
    cy.get('@componentDidMount').should('have.been.calledOnce')
  })

  it('renders same application after hydration', () => {
    // technical detail - removes any stubs from previous tests
    // since our application iframe does not get reset
    // (there is no "cy.visit" call to reset it)
    const win = cy.state('window')
    delete win.createReactClass

    let pageHtml
    cy.request('/')
      .its('body')
      .then(html => {
        pageHtml = html
        // remove bundle script to only have static HTML
        cy.state('document').write(
          html.replace('<script src="/bundle.js"></script>', '')
        )
      })

    cy.get('li').should('have.length', 4)
    cy.get('button').should('be.disabled')

    let staticHTML
    cy.get('#content')
      .invoke('html')
      // static HTML before hydration has the "disabled" button attribute
      // we should remove it before comparing to hydrated HTML
      .then(html => (staticHTML = html.replace(' disabled=""', '')))

      // now mount the full page and let it hydrate
      .then(resetDocument)
      .then(() => {
        cy.state('document').write(pageHtml)
      })

    // now the page should be live client-side
    cy.get('button').should('be.enabled')

    cy.get('#content')
      .invoke('html')
      .then(html => {
        expect(html).to.equal(staticHTML)
      })
  })
})
