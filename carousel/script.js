(function(){
  const thisDoc = document.currentScript.ownerDocument
  let radius, currentIndex = 0, theta, carousel;

  class CarouselBox extends HTMLElement {
    static get observedAttributes(){
      return ['cells']
    }

    constructor(){
      super()

      this._cells = null
      this.shadow = this.attachShadow({mode: 'open'})
      const tmp = document.importNode(thisDoc.querySelector('template').content, true)
      this.shadow.appendChild(tmp)
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
      const buttons = this.shadow.querySelectorAll('button')
      buttons.forEach(button => {
        button.addEventListener('click', onClick(carousel))
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

  customElements.define('carousel-box', CarouselBox)
})()