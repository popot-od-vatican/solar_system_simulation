const sideMenuDropDowns = document.getElementsByClassName("section-header");

const asteroidsScaleInput = document.getElementById('asteroids-scale');
const planetsScaleInput = document.getElementById('planets-scale');
const satellitesScaleInput = document.getElementById('satellites-scale');
const starsScaleInput = document.getElementById('stars-scale');

const asteroidsScaleDisplay = document.getElementById('asteroids-scale-display');
const planetsScaleDisplay = document.getElementById('planets-scale-display');
const satellitesScaleDisplay = document.getElementById('satellites-scale-display');
const starsScaleDisplay = document.getElementById('stars-scale-display');

let asteroidsScale = 1;
let planetsScale = 1;
let satellitesScale = 1;
let starsScale = 1;

function updateAsteroidsScale()
{
    asteroidsScale = asteroidsScaleInput.value;
    asteroidsScaleDisplay.innerHTML = asteroidsScaleInput.value;
}

function updatePlanetsScale()
{
    planetsScale = planetsScaleInput.value;
    planetsScaleDisplay.innerHTML = planetsScaleInput.value;
}

function updateSatellitesScale()
{
    satellitesScale = satellitesScaleInput.value;
    satellitesScaleDisplay.innerHTML = satellitesScaleInput.value;
}

function updateStarsScale()
{
    starsScale = starsScaleInput.value;
    starsScaleDisplay.innerHTML = starsScaleInput.value;
}

function setupSideMenuHandlers()
{
    for(let i = 0; i < sideMenuDropDowns.length; ++i)
    {
        sideMenuDropDowns[i].addEventListener("click", (event) => {

            const headerElement = event.target;
            const dropDown = headerElement.nextElementSibling;

            headerElement.classList.toggle("active");

            if(!dropDown.style.maxHeight) {
                dropDown.style.maxHeight = dropDown.scrollHeight + "px";
            }
            else {
                dropDown.style.maxHeight = null;
            }
        });
    }
}

setupSideMenuHandlers();