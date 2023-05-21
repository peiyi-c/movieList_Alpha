const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/'

const movies = []
const dataPanel = document.querySelector('#data-panel')
const favoriteMovies = JSON.parse(localStorage.getItem('favoriteMovies')) || []

let filteredMovies = []
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')

let currentPage = 1
const MOVIES_PER_PAGE = 12
const paginator = document.querySelector('#paginator')

// function: render movie list
function renderMovieList(data) {
  let rawHTML = ''

  data.forEach((item) => {
    // title, image, id
    if (favoriteMovies.some((movie) => movie.id === item.id)) {
      rawHTML += `<div class="col-sm-3">
    <div class="mb-2">
      <div class="card">
        <img src="${POSTER_URL + item.image}" 
            class="card-img-top" 
            alt="${item.title} Poster">
        <div class="card-body">
          <h5 class="card-title">${item.title}</h5>
        </div>
        <div class="card-footer d-flex justify-content-between">
          <button 
            class="btn btn-primary btn-show-movie" 
            data-bs-toggle="modal" 
            data-bs-target="#movie-modal" 
            data-id="${item.id}">More
          </button>
          <button 
            class="btn btn-danger btn-add-favorite" data-id="${item.id}" disabled>
            \&#9829;\	
          </button>
        </div>
      </div>
    </div>
  </div>`
    } else {
      rawHTML += `<div class="col-sm-3">
    <div class="mb-2">
      <div class="card">
        <img src="${POSTER_URL + item.image}" 
            class="card-img-top" 
            alt="${item.title} Poster">
        <div class="card-body">
          <h5 class="card-title">${item.title}</h5>
        </div>
        <div class="card-footer d-flex justify-content-between">
          <button 
            class="btn btn-primary btn-show-movie" 
            data-bs-toggle="modal" 
            data-bs-target="#movie-modal" 
            data-id="${item.id}">More
          </button>
          <button 
            class="btn btn-danger btn-add-favorite" data-id="${item.id}">
            \&#9829;\	
          </button>
        </div>
      </div>
    </div>
  </div>`
    }

  })
  dataPanel.innerHTML = rawHTML
}

// movies per page
function getMoviesByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies
  //calculate start index 
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  //return a new array
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

// function: render paginator
function renderPaginator(amount) {
  //calculate pages in total
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  //paginator template 
  let rawHTML = ''
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  //put into HTML
  paginator.innerHTML = rawHTML
}

// function: show movie modal 
function showMovieModal(id) {
  // get elements
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  // send request to show api
  axios
    .get(INDEX_URL + id)
    .then((response) => {
      const data = response.data.results

      // insert data into modal ui
      modalTitle.innerText = data.title
      modalDate.innerText = 'Release date: ' + data.release_date
      modalDescription.innerText = data.description
      modalImage.innerHTML = `<img src="${POSTER_URL + data.image
        }" alt="movie-poster" class="img-fluid">`
    })
}

// function: add to favorite
function addToFavorite(id) {
  const movie = movies.find((movie) => movie.id === id)
  if (favoriteMovies.some((movie) => movie.id === id)) {
    return alert('This movie has already been added!')
  }
  favoriteMovies.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(favoriteMovies))
}


// listen to data panel
dataPanel.addEventListener('click', onPanelClicked)
function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(event.target.dataset.id)
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
    //event.target.setAttribute('disabled', '');
    event.target.toggleAttribute("disabled")
  }
}

// listen to search bar 
searchForm.addEventListener('submit', onSearchFormSubmitted)
function onSearchFormSubmitted(event) {
  //prevent submit default event
  event.preventDefault()
  //get search keyword
  const keyword = searchInput.value.trim().toLowerCase()
  //filter movies 

  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword))
  //if no match
  if (filteredMovies.length === 0) {
    return alert(`no movie match with: ${keyword}`)
  }
  //render page
  renderPaginator(filteredMovies.length)
  renderMovieList(filteredMovies)
}

// listen to paginator
paginator.addEventListener('click', onPaginatorClicked)

function onPaginatorClicked(event) {
  // if not <a>, return
  if (event.target.tagName !== 'A') {
    return
  } else {
    //get page number through dataset 
    const page = Number(event.target.dataset.page)
    //render page
    renderMovieList(getMoviesByPage(page))
    currentPage = page
  }
}


// send request to show api
axios
  .get(INDEX_URL)
  .then((response) => {
    //push into movies
    movies.push(...response.data.results)
    //render movies and paginator into ui
    renderPaginator(movies.length)
    renderMovieList(getMoviesByPage(1))
  })
  .catch((err) => console.log(err))


