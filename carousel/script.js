(function(){
  const userNames = ['ESL_SC2', 'OgamingSC2', 'cretetion', 'freecodecamp', 'storbeck', 'habathcx', 'RobotCaleb', 'noobs2ninjas']
  const thisDoc = document.currentScript.ownerDocument
  let radius, currentIndex = 0, theta, carousel;

  class CarouselBox extends HTMLElement {
    static get observedAttributes(){
      return ['cells']
    }

    constructor(){
      super()
      this._users = []
      this._cells = null
      this.shadow = this.attachShadow({mode: 'open'})
      const tmp = document.importNode(thisDoc.querySelector('template').content, true)
      this.shadow.appendChild(tmp)
      
      const buttons = this.shadow.querySelectorAll('button')
      buttons.forEach(button => {
        button.addEventListener('click', onClick(this.shadow.querySelector('.carousel')))
      })
    }

    get cells(){
      return this._cells
    }

    set cells(value){
      this.setAttribute('cells', value)
    }

    attributeChangedCallback(name, oldValue, newValue){
      const value = parseInt(newValue)
      
      if(!carousel){
        carousel = this.shadow.querySelector('.carousel')
      }
      
      switch(name){
        case 'cells':
          this.changeCarousel(value)
          this._cells = value
          break;
      }
    }

    changeCarousel(newValue) {
      const width = carousel.offsetWidth
      const cells = document.querySelectorAll('.carousel-cell')
      
      theta = 360 / newValue
      radius = Math.round((width / 2) / Math.tan(Math.PI / newValue))

      for(let i = 0, len = cells.length; i < len; i++){
        cells[i].style.opacity = 1
        cells[i].style.transform = `rotateY(${theta * i}deg) translateZ(${radius}px)` 
      }
      rotateCarousel(carousel)
    }

    connectedCallback(){
      const tmp = document.querySelector('#carousel-cell-template')
      const fragment = new DocumentFragment()
      const button = document.createElement('button')
      button.textContent = 'Follow Me'
      let clone
      
      init().then(usersInfo => {
        this._users = usersInfo
        this._users.map(({ display_name, logo, stream }) => {
          clone = document.importNode(tmp.content, true)
          clone.querySelector('img').src = logo
          clone.querySelector('h2').textContent = display_name
          clone.querySelector('p').textContent = (stream) ? `${stream.game} ${stream.status}` : 'Offline'
          fragment.appendChild(clone)
        })
        this.appendChild(fragment)
        this.setAttribute('cells', usersInfo.length)
      })
    }
  }

  function onClick(carousel) {
    return function(e) {
      e.preventDefault()
    
      if(e.target.className === 'prev'){
        currentIndex--
        rotateCarousel(carousel)
      } else {
        currentIndex++
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
    const usersInfo = []
    const [users, streams] = await getData()
  
    for(let i = 0, len = userNames.length; i < len; i++){
      usersInfo.push({
        display_name: users[i].display_name,
        logo: users[i].logo,
        stream: getStreamInfo(streams[i].stream)
      })
    }
    return usersInfo
  }

  function getStreamInfo(stream) {
    if(stream){
      return {
        game: stream.game,
        status: stream.channel.status
      }
    } else {
      return null
    }
  }

  function myFetch(url) {
    return fetch(url)
      .then(result => result.json())
  }

  customElements.define('carousel-box', CarouselBox)
})()