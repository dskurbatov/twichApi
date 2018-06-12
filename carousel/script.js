(function(){
  const userNames = ['ESL_SC2', 'OgamingSC2', 'cretetion', 'freecodecamp', 'storbeck', 'habathcx', 'RobotCaleb', 'noobs2ninjas']
  const thisDoc = document.currentScript.ownerDocument
  const tmp = document.querySelector('#carousel-cell-template')
  let radius, theta, carousel, currentIndex = 0;
  

  const createStore = (reducer) => {
    let state, listeners = []
    const getState = () => state
    const dispatch = (action) => {
      state = reducer(state, action)
      listeners.forEach(l => l(state))
    }

    const subscribe = (listener) => {
      listeners.push(listener)
      return () => {
        listeners.filter(l => l != listener)
      }
    }

    dispatch({})

    return {
      getState,
      dispatch,
      subscribe
    }
  }

  const users = (state = [], action) => {
    switch(action.type){
      case 'INITIAL_DATA':
        return [...action.data]
      default: 
        return state;
    }
  }

  const filter = (state = 'All', action) => {
    switch(action.type){
      case 'SET_VISIBILITY_FILTER':
        return action.filter
      default:
        return state;
    }
  }

  const combineReducers = (reducers) => {
    return (state = {}, action) => {
      return Object.keys(reducers).reduce((nextState, key) => {
        nextState[key] = reducers[key](state[key], action)
        console.log(nextState)
        return nextState
      }, {})
    }
  }

  const visibleUsers = (state) => {
    const { users, filter } = state
    switch(filter) {
      case 'All':
        return users
      case 'Offline':
        return users.filter(({ stream }) => stream === null)
      case 'Online':
        return users.filter(({ stream }) => stream !== null)
      default: 
        return users
    }
  }

  const componentReducer = combineReducers({
    users, 
    filter
  })

  const store = createStore(componentReducer)

  class CarouselBox extends HTMLElement {
    static get observedAttributes(){
      return ['filter']
    }

    constructor(){
      super()
      this._cells = null
      this._filter = null
      this.shadow = this.attachShadow({mode: 'open'})
      const tmp = document.importNode(thisDoc.querySelector('template').content, true)
      this.shadow.appendChild(tmp)
      
      const buttons = this.shadow.querySelectorAll('button')
      buttons.forEach(button => {
        button.addEventListener('click', onClick(this.shadow.querySelector('.carousel')))
      })

      const radioButtons = this.shadow.querySelectorAll('input[name="all-online-offline"]')
      radioButtons.forEach(radio => {
        radio.addEventListener('change', onChange)
      })

      store.subscribe(({ filter }) => {
        this.setAttribute('filter', filter)
      })
    }

    get filter(){
      return this._filter
    }

    set filter(value){
      this.setAttribute('filter', value)
    }

    attributeChangedCallback(name, oldValue, newValue){
      if(!carousel){
        carousel = this.shadow.querySelector('.carousel')
      }
      
      switch(name){
        case 'filter':
          this._filter = newValue
          this.changeCarousel()
      }
    }

    changeCarousel() {
      const width = carousel.offsetWidth
      const currentUsers = visibleUsers(store.getState())
      const len = currentUsers.length
      const fragment = new DocumentFragment()
      let clone, cell
      
      removeChildren(this)

      theta = 360 / len
      radius = Math.round((width / 2) / Math.tan(Math.PI / len)) || 1

      for(let i = 0; i < len; i++){
        clone = document.importNode(tmp.content, true)
        cell = clone.querySelector('.carousel-cell')
        cell.querySelector('img').src = currentUsers[i].user.logo
        cell.style.opacity = 1
        cell.style.transform = `rotateY(${theta * i}deg) translateZ(${radius}px)`
        fragment.appendChild(clone)
      }

      this.appendChild(fragment)
      rotateCarousel(carousel)
    }

    connectedCallback(){
      init().then(users => {
        store.dispatch({
          type: 'INITIAL_DATA',
          data: users
        })
      })
    }
  }

  function removeChildren(parent){
    while(parent.firstChild){
      parent.removeChild(parent.firstChild)
    }
  }

  function onChange(e){
    store.dispatch({
      type: 'SET_VISIBILITY_FILTER',
      filter: this.value
    })
  }

  function onClick(carousel) {
    return function(e) {
      e.preventDefault()

      if(e.target.className === 'prev'){
        currentIndex--
        // currentIndex = currentIndex % cellsNumber
        rotateCarousel(carousel)
      } else {
        currentIndex++
        // currentIndex = currentIndex % cellsNumber
        rotateCarousel(carousel)
      }
    }
  }

  function rotateCarousel(carousel){
    let angel = theta * currentIndex * -1 
    carousel.style.transform = `translateZ(-${radius}px) rotateY(${angel}deg)`
  }

  function getPromises(){
    const userPromises = [], streamPromises = []
    const url = 'https://wind-bow.glitch.me/twitch-api/'

    for(let i = 0, len = userNames.length; i < len; i++){
      userPromises.push(myFetch(url + 'users/' + userNames[i]))
      streamPromises.push(myFetch(url + 'streams/' + userNames[i]))
    }

    return [userPromises, streamPromises]
  }

  function getData(){
    const [ userPromises, streamPromises ] = getPromises()
    return Promise.all([Promise.all(userPromises), Promise.all(streamPromises)])
  }

  async function init(){
    const [users, streams] = await getData()
    const usersArray = []
    
    for(let i = 0, len = userNames.length; i < len; i++){
      usersArray.push({
        user: users[i],
        stream: streams[i].stream
      })
    }
    return usersArray
  }

  function myFetch(url) {
    return fetch(url)
      .then(result => result.json())
  }

  customElements.define('carousel-box', CarouselBox)
})()

// function filterAll(cells, theta, radius){
  //   for(let i = 0, len = cells.length; i < len; i++){
  //     cells[i].style.opacity = 1
  //     cells[i].style.transform = `rotateY(${theta * i}deg) translateZ(${radius}px)` 
  //   }
  // }

  // function filterOffline(cells, theta, radius){
  //   for(let i = 0, len = cells.length; i < len; i++){
  //     if(cells[i].querySelector('p').textContent !== 'Offline'){
  //       cells[i].style.opacity = 0
  //       cells[i].style.transform = 'none'
  //     } else {
  //       cells[i].style.opacity = 1
  //       cells[i].style.transform = `rotateY(${theta * i}deg) translateZ(${radius}px)`
  //     }
  //   }
  // }

  // function filterOnline(cells, theta, radius){
  //   for(let i = 0, len = cells.length; i < len; i++){
  //     if(cells[i].querySelector('p').textContent === 'Offline'){
  //       cells[i].style.opacity = 0
  //       cells[i].style.transform = 'none'
  //     } else {
  //       cells[i].style.opacity = 1
  //       cells[i].style.transform = `rotateY(${theta * i}deg) translateZ(${radius}px)`
  //     }
  //   }
  // }

  // function countCells(filter, cells){
  //   let count = 0;
  //   switch(filter){
  //     case 'All':
  //       return cells.length
  //       break;
  //     case 'Offline':
  //       cells.forEach(cell => {
  //         if(offline(cell)){
  //           count++
  //         }
  //       })
  //       return count
  //     case 'Online':
  //       cells.forEach(cell => {
  //         if(!offline(cell)){
  //           count++
  //         }
  //       })
  //       return count
  //     default:
  //       return cells.length
  //   }
  // }

  // function offline(cell){
  //   return cell.querySelector('p').textContent === 'Offline'
  // }