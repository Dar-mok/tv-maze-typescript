import axios from "axios";
import * as $ from 'jquery';

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");

const DEFAULT_IMG: string = "https://t4.ftcdn.net/jpg/03/03/62/45/240_F_303624505_u0bFT1Rnoj8CMUSs8wMCwoKlnWlh5Jiq.jpg";

interface ShowInterface {
  id: number,
  name: string,
  summary: string,
  image: string;
}

interface EpisodeInterface {
  id: number,
  name: string,
  season: string,
  number: string;
}



/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term: string): Promise<ShowInterface[]> {
  // ADD: Remove placeholder & make request to TVMaze search shows API.
  let result = await axios.get(`https://api.tvmaze.com/search/shows?q=${term}`);
  let data: any[] = result.data;
  let filteredResult: ShowInterface[] = data.map(show => (
    {
      id: show.show.id,
      name: show.show.name,
      summary: show.show.summary,
      image: show.show?.image?.medium || DEFAULT_IMG
    }
  ));
  console.log("results are", filteredResult);
  return filteredResult;
}

//TODO: docstring
async function displayEpisodesOfShow(showId: number) {
  const episodes = await getEpisodesOfShow(showId);
  populateEpisodes(episodes);
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
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);

    $show.on("click", ".Show-getEpisodes", () => displayEpisodesOfShow(show.id));
    $showsList.append($show);
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term.toString());

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id: number): Promise<EpisodeInterface[]> {
  const result = await axios.get(`http://api.tvmaze.com/shows/${id}/episodes`);

  const data: any[] = result.data;
  const episodes = data.map(episode => ({
    id: episode.id,
    name: episode.name,
    season: episode.season,
    number: episode.number
  }));

  return episodes;
}


/**
 * populates episode info into the #episodesList part of the DOM
 * @param episodes array of episodes
 */
function populateEpisodes(episodes: EpisodeInterface[]): void {
  const episodesArea = document.getElementById("episodesArea");
  const episodesList = document.getElementById("episodesList");

  for (const ep of episodes) {
    const li = document.createElement("li");
    li.innerText = `${ep.name} (season ${ep.season}, number ${ep.number})`;
    episodesList.append(li);
  }

  episodesArea.setAttribute("style", "display: block");
}
