const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/'

const favoriteMovies = JSON.parse(localStorage.getItem('favoriteMovies')) || []
const dataPanel = document.querySelector('#data-panel')

let filteredMovies = []
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')

const MOVIES_PER_PAGE = 12
const paginator = document.querySelector('#paginator')

// function: render movie list
function renderMovieList(data) {
  let rawHTML = ''
  data.forEach((item) => {
    // title, image, id
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
            class="btn btn-warning btn-remove-favorite" data-id="${item.id}">
            &#x2716;
          </button>
        </div>
      </div>
    </div>
  </div>`
  })
  dataPanel.innerHTML = rawHTML
}
// movies per page
function getMoviesByPage(page) {
  const data = filteredMovies.length ? filteredMovies : favoriteMovies
  //calculate start index 
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  //return an array
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
  if (amount < 12) {
    paginator.innerHTML = ''
  } else {
    paginator.innerHTML = rawHTML
  }
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

// function: remove from favorite
function removeFromFavorite(id) {
  if (!favoriteMovies || !favoriteMovies.length) return
  // find the index of movie to remove
  const movieIndex = favoriteMovies.findIndex((movie) => movie.id === id)
  if (movieIndex === -1) {
    return
  } else {
    //remove from favorite movie
    favoriteMovies.splice(movieIndex, 1)
    localStorage.setItem('favoriteMovies', JSON.stringify(favoriteMovies))
    renderPaginator(favoriteMovies.length)
    renderMovieList(favoriteMovies)
  }
}

// listen to data panel
dataPanel.addEventListener('click', onPanelClicked)
function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(event.target.dataset.id)
  } else if (event.target.matches('.btn-remove-favorite') || event.target.matches('.bi-trash') || event.target.tagName === 'BUTTON') {
    removeFromFavorite(Number(event.target.dataset.id))
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

  filteredMovies = favoriteMovies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword))
  //if no match
  if (filteredMovies.length === 0) {
    alert(`no movie match with: ${keyword}`)
    searchInput.value = ''
  } else {
    //render page
    renderPaginator(filteredMovies.length)
    renderMovieList(filteredMovies)
    searchInput.value = ''
  }

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
  }


}

//render movies into movie list ui

renderPaginator(favoriteMovies.length)
renderMovieList(getMoviesByPage(1))


