"use strict";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");
// url and missing tv image const
const SHOWSEARCHURL="http://api.tvmaze.com/search/shows";
const MISSINGIMAGE="https://tinyurl.com/tv-missing";

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term) {
  
  let response= await axios.get(SHOWSEARCHURL, {params:{q:term}});
  //inline function 
  return response.data.map(showObj=> (
    {
      id: showObj.show.id,
      name : showObj.show.name,
      summary : showObj.show.summary,
      image : (showObj.show.image) ? (showObj.show.image.original) : MISSINGIMAGE
    }
  ) 
  );
}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img 
              src="${show.image}"
              alt="${show.name}" 
              class="w-25 mr-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>  
       </div>
      `
    );

    $showsList.append($show);
  }
  // add event listener so that when pressing episodes button
  // show the list of episode info below
  $(".Show-getEpisodes").on("click", async function(evt) {
    evt.preventDefault();
    await searchForEpisodesAndDisplay(evt);
  });
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 *      await the res for the episodes of :showId
 *      parse this data res / map to desired result above
 */

async function getEpisodesOfShow(id) {
  const episodesUrl = `http://api.tvmaze.com/shows/${id}/episodes`;
  let res = await axios.get(episodesUrl);

  return res.data.map( episodesObj => (
    {
      id: episodesObj.id,
      name: episodesObj.name,
      season: episodesObj.season,
      number: episodesObj.number
    }
  ));
 }

/** Given an array of episodes info, populate details into #episodesList of DOM
 * 
 */

function populateEpisodes(episodes) {
  const $episodesList = $("#episodesList");
  // empty the episodes list before adding new episodes of a show
  $episodesList.empty();

  // loop thru episodes, creating li's for each with the information provided
  for (let episode of episodes) {
    let $newEpItem = $(`<li data-episode-id="${episode.id}">${episode.name} (season ${episode.season}, number ${episode.number})</li>`);
    $episodesList.append($newEpItem);
  }

  // reveal #episodesData
  $("#episodesArea").show();
 }

 /** Handle searching of episodes by the current show id and displaying on DOM
  *   episode details
  */

  async function searchForEpisodesAndDisplay(evt) {
    // const showId = $(evt.target).parentElement.parentElement.parentElement.getAttribute("data-show-id");
    const showId = evt.target.closest(".Show").getAttribute("data-show-id");
    const episodes = await getEpisodesOfShow(showId);

    populateEpisodes(episodes);
  }


  