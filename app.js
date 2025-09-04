// ====== GLOBAL VARIABLES ===========

// API Enpoint (All Heroes) - where we grab all superhero data
const API_URL = "https://akabab.github.io/superhero-api/api/all.json";

// DOM Elements
const listWrapper = document.querySelector(".list-wrapper"); //Container of All Cards
const searchInput = document.getElementById("search-input"); //Search Bar
const notFoundMessage = document.getElementById("not-found-message"); //"Character Not Found" Message
const allTab = document.getElementById("all-tab"); //Click To Show All Characters
const favoritesTab = document.getElementById("favorites-tab"); //Click To Show Only Favorites
const allHeroesWrapper = document.getElementById("all-heroes");
const favoritesWrapper = document.getElementById("favorites");

// Store Heroes In Memory
let allHeroes = []; //All Heroes From The API
let marvelHeroes = []; //Filtered Version Of Only Marvel Character

// ===== FETCH DATA ======
async function fetchHeroes()
{
    try
    {
        const response = await fetch(API_URL); //Calls API
        const data = await response.json(); //Converts Responses To JavaScript Objects/Arrays

        allHeroes = data; //Save All Heroes

        //Only Keep Marvel Characters
        marvelHeroes = allHeroes.filter(
            (hero) => hero.biography.publisher === "Marvel Comics"
        );

        //Display Characters On Page
        renderHeroes(marvelHeroes); //Show Initial List
    }
    catch(error)
    {
        console.error("Error Fetching Heroes: ", error);
        listWrapper.innerHTML = "<p>Failed To Load Heroes </p>";
    }
}

// ======= RENDER HEROES ===========
function renderHeroes(heroes)
{
    allHeroesWrapper.innerHTML = ""; //Clear Old List

    //If No Characters Are Found -> Show "Character Not Found"
    if(heroes.length === 0)
    {
        notFoundMessage.style.display = "block";
        return;
    }
    else{
        notFoundMessage.style.display = "none";
    }

    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];

    //Loop Through Heroes
    //Create A <div> For Each Hero
    //Add A Class "characer-card" For Styling
    //Set Card's HTML content: image + name
    //Add It To The .list-wrapper contianer
    heroes.forEach((hero) => {
        const card = document.createElement("div");
        card.classList.add("character-card");

        const isFavorite = favorites.some(fav => fav.id === hero.id);

        card.innerHTML = `
          <div class = "card-header">
            <h3>${hero.name}</h3>
            ${isFavorite ? '<span class = "fav-indicator">⭐️</span>' : ""}
          </div>
          <img src = "${hero.images.sm}" alt = "${hero.name}" />
        `;

        //Click Event To Each Card
        card.addEventListener("click", () => openModal(hero));

        listWrapper.appendChild(card);
    });
}

//
const modal = document.getElementById("character-modal");
const modalBody = document.getElementById("modal-body");
const modalClose = document.getElementById("modal-close");

function openModal(hero)
{
    modal.style.display = "block";

    // check if already favorited
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    const isFavorite = favorites.some(fav => fav.id === hero.id);

    modalBody.innerHTML = `
        <div class = "modal-header">
            <h2>${hero.name}</h2>
            <p>${hero.biography.fullName || "Unknown"}</p>
            <button id = "favorite-btn" class = "favorite-btn">
                ${isFavorite ? "⭐ Remove from Favorites" : "☆ Add to Favorites"}
            </button>
        </div>
    
        <div class = "modal-image">
            <img src = "${hero.images.lg}" alt = "${hero.name}" />
        </div>

        <div class = "modal-info">
            <p><strong>Publisher:</strong> ${hero.biography.publisher}</p>
            <p><strong>First Appearance: </strong> ${hero.biography.firstAppearance}</p>
        </div>

        <h3>Stats</h3>
        <div class="stats">
            ${renderStat("Intelligence", hero.powerstats.intelligence)}
            ${renderStat("Strength", hero.powerstats.strength)}
            ${renderStat("Speed", hero.powerstats.speed)}
            ${renderStat("Durability", hero.powerstats.durability)}
            ${renderStat("Power", hero.powerstats.power)}
            ${renderStat("Combat", hero.powerstats.combat)}
        </div>
    `;

    // attach favorite button logic
    document.getElementById("favorite-btn").addEventListener("click", () => {
      toggleFavorite(hero);
      openModal(hero); // re-render modal so button updates
    });
}

function renderStat(label, value) {
    const percent = value > 100 ? 100 : value; // clamp max at 100
    return `
      <div class="stat">
        <span class="stat-label">${label}</span>
        <div class="stat-bar">
          <div class="stat-fill" style="width: ${percent}%;"></div>
        </div>
        <span class="stat-value">${value}</span>
      </div>
    `;
  }
  

//Close When X Is Clicked
modalClose.addEventListener("click", () => {
    modal.style.display = "none";
});

//Close When Clicking Outside Modal
window.addEventListener("click", (event) => {
    if(event.target === modal)
    {
        modal.style.display = "none";
    }
});

// ====== SEARCH ======
function handleSearch(event) {
    //Get The Typed Text
    const searchTerm = event.target.value.toLowerCase();
  
    //Makes Everything Lowercase
    const filtered = marvelHeroes.filter((hero) =>
      hero.name.toLowerCase().includes(searchTerm)
    );
    //Update Display
    renderHeroes(filtered);
  }
// ==== Favorites ========
  function toggleFavorite(hero) {
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  
    const exists = favorites.some(fav => fav.id === hero.id);
  
    if (exists) {
      favorites = favorites.filter(fav => fav.id !== hero.id);
    } else {
      favorites.push(hero);
    }
  
    localStorage.setItem("favorites", JSON.stringify(favorites));

    renderHeroes(marvelHeroes); //Refresh Main List
    renderFavorites();
  }

  function renderFavorites()
  {
    favoritesWrapper.innerHTML = ""; //Clear Old List

    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];

    if(favorites.length === 0)
      {
        favoritesWrapper.innerHTML = "<p>No Favorites Yet</p>";
        return;
      }

    favorites.forEach((hero) => {
      const card = document.createElement("div");
      card.classList.add("character-card");

      card.innerHTML = `
        <div class = "card-header">
          <h3>${hero.name}</h3>
          <span class = "fav-indicator">⭐️</span>
        </div>
        <img src = "${hero.images.sm}" alt = "${hero.name}" />
      `;

      card.addEventListener("click", () => openModal(hero));

      favoritesWrapper.appendChild(card);
    });
  }
  
  
  // ====== EVENT LISTENERS ======
  //Listens For Typing In Search Bar
  //Call "handleSearch" Each Time You Type
  searchInput.addEventListener("input", handleSearch);

  //When All Heroes Tab Is Clicked
  allTab.addEventListener("click", () => {
    allTab.classList.add("active");
    favoritesTab.classList.remove("active");
    allHeroesWrapper.style.display = "grid";
    favoritesWrapper.style.display = "none";
  });

  //When Favorites Tab Is Clicked
  favoritesTab.addEventListener("click", () => {
    favoritesTab.classList.add("active");
    allTab.classList.remove("active");
    allHeroesWrapper.style.display = "none";
    favoritesWrapper.style.display = "grid";
    renderFavorites(); //Load Favorites List
  });
  
  // ====== INITIALIZE ======
  //Runs Fetch When Page Loads
  //Populates The App With Characters Right Away
  fetchHeroes();