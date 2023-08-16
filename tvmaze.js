"use strict";

const $showsList = $("#shows-list");
const $episodesArea = $("#episodes-area");
const $searchForm = $("#search-form");

async function getShowsByTerm(q) {
  let res = await axios.get(`http://api.tvmaze.com/search/shows`, {
    params: { q },
  });
  let showsArr = res.data;
  let shows = [];
  showsArr.forEach((show) => {
    const { id, name, summary, image } = show.show;
    shows.push({ id, name, summary, image });
    populateShows(shows);
  });
}

/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img 
              src=${
                show.image
                  ? show.image.medium
                  : " https://tinyurl.com/tv-missing"
              } 
              alt=${show.name}
              class="card-img-top w-25 mr-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-dark btn-sm Show-getEpisodes " id='episodes'>
               Episodes
             </button>
           </div>
         </div>  
       </div>
      `
    );

    $showsList.append($show);
  }
}

async function searchForShowAndDisplay() {
  let q = $("#search-query").val();
  const shows = await getShowsByTerm(q);

  $episodesArea.hide();
}

async function getEpisodes(id) {
  let url = `https://api.tvmaze.com/shows/${id}/episodes`;

  let res = await axios.get(url);

  let episodes = res.data.map((episode) => ({
    id: episode.id,
    name: episode.name,
    season: episode.season,
    number: episode.number,
  }));
  return episodes;
}

function populateEpisodes(episodes) {
  const $epList = $("#episodes-list");
  $epList.empty();
  for (let episode of episodes) {
    let $li = $(
      `<li>${episode.name}
      (season ${episode.season}, episode ${episode.number})</li>`
    );
    $epList.append($li);
  }
  $("#episodes-area").show();
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});

$("#shows-list").on("click", ".Show-getEpisodes", async function (e) {
  e.preventDefault();
  let id = $(e.target).closest(".Show").data("show-id");
  let episodes = await getEpisodes(id);
  populateEpisodes(episodes);
});
