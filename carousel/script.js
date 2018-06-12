(function(){
  const userNames = ['ESL_SC2', 'OgamingSC2', 'cretetion', 'freecodecamp', 'storbeck', 'habathcx', 'RobotCaleb', 'noobs2ninjas']
  const thisDoc = document.currentScript.ownerDocument
  let radius, currentIndex = 0, theta, carousel;

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
        radio.addEventListener('change', onChange(this))
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

      if(!this._cells){
        this._cells = document.querySelectorAll('.carousel-cell')
      }
      
      switch(name){
        case 'filter':
          this._filter = newValue
          this.changeCarousel()
      }
    }

    changeCarousel() {
      const width = carousel.offsetWidth
      const cellsNumber = countCells(this._filter, this._cells)
      
      theta = 360 / cellsNumber
      radius = Math.round((width / 2) / Math.tan(Math.PI / cellsNumber)) || 1
      
      if(this._filter === 'All'){
        filterAll(this._cells, theta, radius)
      } else if(this._filter === 'Offline') {
        filterOffline(this._cells, theta, radius)
      } else {
        filterOnline(this._cells, theta, radius)
      }
      rotateCarousel(carousel)
    }

    connectedCallback(){
      init().then(fragment => {
        this.appendChild(fragment)
        this.setAttribute('filter', 'All')
      })
    }
  }

  function filterAll(cells, theta, radius){
    for(let i = 0, len = cells.length; i < len; i++){
      cells[i].style.opacity = 1
      cells[i].style.transform = `rotateY(${theta * i}deg) translateZ(${radius}px)` 
    }
  }

  function filterOffline(cells, theta, radius){
    let index = 0
    for(let i = 0, len = cells.length; i < len; i++){
      if(cells[i].querySelector('p').textContent !== 'Offline'){
        cells[i].style.opacity = 0
        cells[i].style.transform = 'none'
      } else {
        cells[i].style.opacity = 1
        cells[i].style.transform = `rotateY(${theta * index}deg) translateZ(${radius}px)`
        index++
      }
    }
  }

  function filterOnline(cells, theta, radius){
    let index = 0
    for(let i = 0, len = cells.length; i < len; i++){
      if(cells[i].querySelector('p').textContent === 'Offline'){
        cells[i].style.opacity = 0
        cells[i].style.transform = 'none'
      } else {
        cells[i].style.opacity = 1
        cells[i].style.transform = `rotateY(${theta * index}deg) translateZ(${radius}px)`
        index++
      }
    }
  }

  function countCells(filter, cells){
    let count = 0;
    switch(filter){
      case 'All':
        return cells.length
        break;
      case 'Offline':
        cells.forEach(cell => {
          if(offline(cell)){
            count++
          }
        })
        return count
      case 'Online':
        cells.forEach(cell => {
          if(!offline(cell)){
            count++
          }
        })
        return count
      default:
        return cells.length
    }
  }

  function offline(cell){
    return cell.querySelector('p').textContent === 'Offline'
  }

  function onChange(carousel){
    return function(e){
      carousel.setAttribute('filter', this.value)
    }
  }

  function onClick(carousel) {
    return function(e) {
      e.preventDefault()
    
      if(e.target.className === 'prev'){
        currentIndex--
      } else {
        currentIndex++
      } 
      rotateCarousel(carousel)
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
    const tmp = document.querySelector('#carousel-cell-template')
    const fragment = new DocumentFragment()
    const [users, streams] = await getData()
    let clone, stream, user
  
    for(let i = 0, len = userNames.length; i < len; i++){
      stream = streams[i].stream, user = users[i]
      
      clone = document.importNode(tmp.content, true)
      clone.querySelector('img').src = user.logo
      clone.querySelector('h2').textContent = user.display_name
      clone.querySelector('p').textContent = (stream) ? `${stream.game} ${stream.channel.status}` : 'Offline'
      fragment.appendChild(clone)
    }
    return fragment
  }

  function myFetch(url) {
    return fetch(url)
      .then(result => result.json())
  }

  customElements.define('carousel-box', CarouselBox)
})()