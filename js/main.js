(function(){
  const users = ['ESL_SC2', 'OgamingSC2', 'cretetion', 'freecodecamp', 'storbeck', 'habathcx', 'RobotCaleb', 'noobs2ninjas']
  const carousel = document.querySelector('carousel-box')
  const tmp = document.querySelector('template')
  

  function getPromises(){
    const usersUrl = 'https://wind-bow.glitch.me/twitch-api/users/'
    const streamsUrl ='https://wind-bow.glitch.me/twitch-api/streams/'
    const usersPromises = [], streamsPromises = []
    
    for(let i = 0, len = users.length; i < len; i++){
      usersPromises.push(fetch(usersUrl + users[i])
        .then(result => result.json()))
      streamsPromises.push(fetch(streamsUrl + users[i])
        .then(result => result.json()))
    }
    return [usersPromises, streamsPromises]
  }

  function getData(){
    const [usersPromises, streamsPromises] = getPromises()
    return Promise.all([Promise.all(usersPromises), Promise.all(streamsPromises)])
  }

  async function start(){
    const [userData, streams] = await getData()
    const fragment = new DocumentFragment()
    let clone, image
  
    for(let i = 0, len = users.length; i < len; i++){
      clone = document.importNode(tmp.content, true)
      image = clone.querySelector('img')
      image.src = userData[i].logo
      fragment.appendChild(clone)
    }
    
    carousel.appendChild(fragment)
    carousel.setAttribute('cells', users.length) 
  }
  
  start()

  // Promise.all()
  //   .then(([userData, streams]) => {
  //     const fragment = new DocumentFragment()
  //     let clone
    
  //     for(let i = 0, len = users.length; i < len; i++){
  //       clone = document.importNode(tmp.content, true)
  //       clone.querySelector('img').src = userData[i].logo
  //       fragment.appendChild(clone)
  //     }

  //     carousel.appendChild(fragment)
  //     carousel.setAttribute('cells', users.length)
  // })

})()