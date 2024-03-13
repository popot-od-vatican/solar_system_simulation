import * as THREE from 'three';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import orbitControls from './controls.js';
import solSystem from './solarSystem.js';
import celestialBody, { loadModelFromFile } from './celestialBody.js';
import spaceShip from './spaceShip.js';


const canvas = document.getElementById('viewport');
const selectedPlanetLabelDisplay = document.getElementById('selected-planet-label');
const previousPlanetButton = document.getElementById('previous-planet-button');
const nextPlanetButton = document.getElementById('next-planet-button');
const asteroidsVisibilityInput = document.getElementById('asteroidsVisibility');
const asteroidsOrbitInput = document.getElementById('asteroidsOrbit');
const orbitsVisibilityInput = document.getElementById('orbitsVisibility');
const orbitLinesInput = document.getElementById('orbitLines');
const orbitTracesInput = document.getElementById('orbitTraces');
const planetVisibilityLabel = document.getElementById('planetsVisibleLabelsInput');
const planetStaticInput = document.getElementById('planetsStaticInput');
const planetsScaleInput = document.getElementById('planets-scale');
const satellitesScaleInput = document.getElementById('satellites-scale');
const satelliteLabelVisibilityInput = document.getElementById('satellitesLabelVisibility');
const satellitesStaticInput = document.getElementById("satellitesStatic");
const starsVisibilityInput = document.getElementById("starsVisibility");
const starsLabelVisibilityInput = document.getElementById("starsLabelsVisibility");
const starsStaticInput = document.getElementById("starsStatic");
const starsScaleInput = document.getElementById('stars-scale');
const planetsScaleDisplay = document.getElementById('planets-scale-display');
const satellitesScaleDisplay = document.getElementById('satellites-scale-display');
const starsScaleDisplay = document.getElementById('stars-scale-display');

// ContextMenu
let contextMenuVisibility = false;
const contextMenu = document.getElementById('context-menu-container');
const contextMenuCloseElement = document.getElementById('context-menu-close-item');
const setStartingPlanetElement = document.getElementById('set-starting-planet');
const setDestinationPlanetElement = document.getElementById('set-destination-planet');
const startJourneyElement = document.getElementById('start-journey');


function toggleContextMenu(event) {
  event.preventDefault();
  contextMenuVisibility = !contextMenuVisibility;

  let x = event.offsetX, y = event.offsetY;
  let windowWidth = window.innerWidth;
  let windowHeight = window.innerHeight;
  const contextMenuWidth = contextMenu.offsetWidth;
  const contextMenuHeight = contextMenu.offsetHeight;

  if(!contextMenuVisibility) {
      contextMenu.style.visibility = "hidden";
  }
  else {

      if(x > windowWidth || x + contextMenuWidth > windowWidth) x = windowWidth - contextMenuWidth;
      if(y > windowHeight || y + contextMenuHeight > windowHeight) y = windowHeight - contextMenuHeight;

      contextMenu.style.visibility = "visible";
      contextMenu.style.left = `${x}px`;
      contextMenu.style.top = `${y}px`;
  }
}

function hideContextMenu() {
  contextMenu.style.visibility = 'hidden';
  contextMenuVisibility = false;
}

function showContextMenu() {
  contextMenu.style.visibility = 'visible';
  contextMenuVisibility = true;
}


class SolarSystemViewer {
  constructor(canvasElement)
  {
    this.mouse = new THREE.Vector2();
    this.elapsedTime = 0;
    this.isSimulating = false;
    this.system = null;
    this.index = 0;
    this.array = [];
    this.asteroids = [];
    this.staticAsteroids = false;
    this.ship = false;
    this.target = null;

    this.setScene();
    this.setCamera();
    this.setRenderer(canvasElement);
    this.setControls();
    this.setRaycaster();
    this.setClock();
    this.setTextureLoader();
    this.setLights();
    this.setEventListeners();
  }

  async load3DModels()
  {
    this.models = {
      "Rocket": await loadModelFromFile("./models/spaceShips/Rocket.glb"),
      "Asteroid_1": await loadModelFromFile("./models/asteroids/asteroid_1.glb"),
      "Asteroid_2": await loadModelFromFile("./models/asteroids/asteroid_2.glb")
    };

    this.ship = new spaceShip(this.models.Rocket.scene, 'Apollo 21');
    this.ship.addToScene(this.scene);
    this.ship.hide();
  }

  setLights()
  {
    const light = new THREE.PointLight(0xffffff, 4, 0, 0.01);
    const lightHelper = new THREE.PointLightHelper(light);
    this.scene.add(light);
    this.scene.add(lightHelper);
  }

  addObjectToScene(obj)
  {
    this.scene.add(obj);
  }

  setSolarSystem(solarSystemToRender)
  {
    this.system = solarSystemToRender;
    this.system.addToScene(this.scene);
    this.system.addOrbitLinesToScene(this.scene);
    this.system.addOrbitTracesToScene(this.scene);

    this.array.push(this.system.star);
    this.reachableBodies = new Map();

    for(let i = 0; i < this.system.planets.length; ++i) {
      this.array.push(this.system.planets[i]);
      this.reachableBodies.set(this.system.planets[i].name, this.system.planets[i]);
    }

    for(let i = 0; i < this.system.satellites.length; ++i) {
      this.reachableBodies.set(this.system.satellites[i].name, this.system.satellites[i]);
    }

    this.changePlanet(0);
  }

  setScene()
  {
    this.scene = new THREE.Scene();
  }

  setCamera()
  {
    this.camera = new THREE.PerspectiveCamera(50, window.innerWidth/ window.innerHeight, 1, 1900000);
    this.camera.position.set(0, 0, 10);
  }

  setRenderer(canvasElement)
  {
    this.renderer = new THREE.WebGLRenderer({
      canvas: canvasElement,
      antialias: true,
    });

    this.labelRenderer = new CSS2DRenderer();
    this.labelRenderer.domElement.style.position = 'absolute';
    this.labelRenderer.domElement.style.top = "0px";
    this.labelRenderer.domElement.style.pointerEvents = "none";
    this.labelRenderer.domElement.style.zIndex = "1";

    document.body.appendChild(this.labelRenderer.domElement);

    this.labelRenderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  setControls()
  {
    this.controls = new orbitControls(this.camera, this.renderer.domElement);
    this.controls.setMaxZoomOut(700000);
  }

  setRaycaster()
  {
    this.raycaster = new THREE.Raycaster();
  }

  setClock()
  {
    this.clock = new THREE.Clock();
  }

  setTextureLoader()
  {
    this.textureLoader = new THREE.TextureLoader();
  }

  setEventListeners()
  {
    window.addEventListener('resize', this.onWindowResize.bind(this));
    window.addEventListener('pointermove', this.onMouseMove.bind(this));
    canvas.addEventListener('mousedown', this.onMouseClick.bind(this));
    previousPlanetButton.addEventListener('mousedown', this.prevPlanet.bind(this));
    nextPlanetButton.addEventListener('mousedown', this.nextPlanet.bind(this));
    asteroidsVisibilityInput.addEventListener('click', this.setAsteroidsVisibility.bind(this));
    asteroidsOrbitInput.addEventListener('click', this.setShouldAsteroidsOrbit.bind(this));
    orbitsVisibilityInput.addEventListener('click', this.setTypeOfOrbit.bind(this));
    orbitLinesInput.addEventListener('click', this.setTypeOfOrbit.bind(this));
    orbitTracesInput.addEventListener('click', this.setTypeOfOrbit.bind(this));
    planetVisibilityLabel.addEventListener('click', this.setPlanetsLabelVisibility.bind(this));
    planetStaticInput.addEventListener('click', this.setPlanetsStatic.bind(this));
    planetsScaleInput.addEventListener('input', this.setPlanetsScale.bind(this));
    satellitesScaleInput.addEventListener('input', this.setSatellitesScale.bind(this));
    satellitesStaticInput.addEventListener('click', this.setSatellitesStatic.bind(this));
    satelliteLabelVisibilityInput.addEventListener('click', this.setSatellitesLabelsVisibility.bind(this));
    starsScaleInput.addEventListener('input', this.setStarScale.bind(this));
    starsVisibilityInput.addEventListener('click', this.setStarVisibility.bind(this));
    starsStaticInput.addEventListener('click', this.setStarStatic.bind(this));
    starsLabelVisibilityInput.addEventListener('click', this.setStarLabelVisibility.bind(this));

    // Context Menu
    contextMenuCloseElement.addEventListener('click', hideContextMenu);
    setStartingPlanetElement.addEventListener('click', this.setStartingPlanet.bind(this));
    setDestinationPlanetElement.addEventListener('click', this.setDestinationPlanet.bind(this));
    startJourneyElement.addEventListener('click', this.beginJourney.bind(this));
    document.addEventListener('contextmenu', function(event){event.preventDefault();});
  }

  setStartingPlanet()
  {
    this.ship.setStartingPlanet(this.target);
    hideContextMenu();
  }

  setDestinationPlanet()
  {
    this.ship.setDestinationPlanet(this.target);
    hideContextMenu();
  }

  beginJourney()
  {
    this.ship.travel();
    hideContextMenu();
  }

  setStarVisibility()
  {
    if(!starsVisibilityInput.checked) {
      this.system.hideStar();
    }
    else {
      this.system.showStar();
    }
  }

  setStarLabelVisibility()
  {
    if(!starsLabelVisibilityInput.checked) {
      this.system.hideStarLabel();
    }
    else {
      this.system.showStarLabel();
    }
  }

  setStarStatic()
  {
    if(starsStaticInput.checked) {
      this.system.freezeStar();
    }
    else {
      this.system.unfreezeStar();
    }
  }

  setSatellitesLabelsVisibility()
  {
    if(!satelliteLabelVisibilityInput.checked) {
      this.system.hideSatellitesLabels();
    }
    else {
      this.system.showSatellitesLabels();
    }
  }

  setSatellitesStatic()
  {
    if(satellitesStaticInput.checked) {
      this.system.freezeSatellites();
    }
    else {
      this.system.unfreezeSatellites();
    }
  }

  setAsteroidsVisibility()
  {
    if(asteroidsVisibilityInput.checked) {
      this.showAsteroids();
    }
    else {
      this.hideAsteroids();
    }
  }

  setShouldAsteroidsOrbit()
  {
    if(asteroidsOrbitInput.checked) {
      this.setAsteroidsStatic(false);
    }
    else {
      this.setAsteroidsStatic(true);
    }
  }

  setTypeOfOrbit()
  {
    if(orbitsVisibilityInput.checked) {
      if(orbitLinesInput.checked) {
        this.system.showOrbits();
        this.system.hideOrbitTraces();
      }
      else {
        this.system.showOrbitTraces();
        this.system.hideOrbits();
      }
    }
    else {
      this.system.hideAllOrbits();
    }
  }

  setPlanetsLabelVisibility()
  {
    if(!planetVisibilityLabel.checked) {
      this.system.hidePlanetsLabels();
    }
    else {
      this.system.showPlanetsLabels();
    }
  }

  setPlanetsStatic()
  {
    if(planetStaticInput.checked) {
      this.system.freezePlanets();
    }
    else {
      this.system.unfreezePlanets();
    }
  }

  onMouseMove(event)
  {
    this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    this.raycaster.setFromCamera(this.mouse, this.camera);
  }

  onMouseClick(event)
  {
    event.preventDefault();
    this.raycaster.setFromCamera(this.mouse, this.camera);

    if(event.button == 1) {
      //console.log('middle');
    }
    else if(event.button == 2) {
      //console.log('right click!');
      const intersects = this.raycaster.intersectObjects(this.scene.children, true);
      let shouldShowContextMenu = false;

      for(let i = 0; i < intersects.length; ++i) {
        if(intersects[i].hasOwnProperty("object") && intersects[i].object instanceof THREE.Mesh && this.reachableBodies.has(intersects[i].object.name)) {
          shouldShowContextMenu = true;
          this.target = intersects[i].object;
          break;
        }
      }

      if(!shouldShowContextMenu) hideContextMenu();
      else toggleContextMenu(event);
    }
    else
    {
      const intersects = this.raycaster.intersectObjects(this.scene.children, true);

      if(intersects.length == 0)
        return;

      for(let i = 0; i < intersects.length; ++i) {
        if(intersects[i].hasOwnProperty("object")) {
          if(intersects[i].object instanceof THREE.Mesh) {
            const cor = new THREE.Vector3();
            intersects[i].object.getWorldPosition(cor);
            this.controls.followObject(intersects[i].object);
            this.controls.setMinZoomIn(10);

            if(!intersects[i].object.name.includes("Clouds")){
              selectedPlanetLabelDisplay.innerHTML = intersects[i].object.name;
            }
            else {
              selectedPlanetLabelDisplay.innerHTML = intersects[i].object.name.substring(0, intersects[i].object.name.length - 7);
            }

            return;
          }
          else if(intersects[i].object instanceof THREE.Line && intersects[i].object.name.includes("Orbit")) {
            const newTargetName = intersects[i].object.name.substring(0, intersects[i].object.name.length-6);
            if(!this.gotoPlanet(newTargetName)) this.gotoSatellite(newTargetName);
            return;
          }
        }
      }
    }
  }

  gotoPlanet(name) {
    for(let i = 0; i < this.system.planets.length; ++i) {
      if(this.system.planets[i].name === name) {
        this.controls.followObject(this.system.planets[i].objectSystem);
        this.controls.setMinZoomIn(this.system.planets[i].radius * 3.25);
        selectedPlanetLabelDisplay.innerHTML = this.system.planets[i].name;
        return true;
      }
    }

    return false;
  }

  gotoSatellite(name) {
    for(let i = 0; i < this.system.satellites.length; ++i) {
      if(this.system.satellites[i].name === name) {
        this.controls.followObject(this.system.satellites[i].objectSystem);
        this.controls.setMinZoomIn(this.system.planets[i].radius * 3.25);
        selectedPlanetLabelDisplay.innerHTML = this.system.satellites[i].name;
        return true;
      }
    }

    return false;
  }

  onWindowResize(event)
  {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.labelRenderer.setSize( window.innerWidth, window.innerHeight );
    //this.renderer.setPixelRatio(window.devicePixelRatio);
    this.camera.aspect = this.renderer.domElement.width / this.renderer.domElement.height;
    this.camera.updateProjectionMatrix();
  }

  nextPlanet()
  {
    this.changePlanet(+1);
  }

  prevPlanet()
  {
    this.changePlanet(-1);
  }

  changePlanet(step)
  {
    this.index = this.index + step;

    if(this.index < 0) {
      this.index = 0;
    }
    else if(this.index >= this.array.length) {
      this.index = this.system.length-1;
    }

    if(this.array.length == 1) {
      previousPlanetButton.disabled = true;
      nextPlanetButton.disabled = true;
    }
    else if(this.index == 0) {
      previousPlanetButton.disabled = true;
      nextPlanetButton.disabled = false;
    }
    else if(this.index == this.array.length-1) {
      previousPlanetButton.disabled = false;
      nextPlanetButton.disabled = true;
    }
    else {
      previousPlanetButton.disabled = false;
      nextPlanetButton.disabled = false;
    }

    this.target = this.array[this.index].name;
    selectedPlanetLabelDisplay.innerHTML = this.array[this.index].name;
    this.controls.followObject(this.array[this.index].objectSystem);
    this.controls.setMinZoomIn(this.array[this.index].radius * 3.25);
  }

  stopSimulating()
  {
    this.isSimulating = false;
  }

  startSimulating()
  {
    this.isSimulating = true;
  }

  async addAsteroids(centerx = 0, centery = 0, centerz = 0, semiMajorAxis = 1000, semiMinorAxis = 1000, count = 100)
  {
    const group = new THREE.Group();

    for(let i = 0; i < count; ++i) {
      let angle = (i / count) * Math.PI * 2;
      const x_pos = centerx + (semiMajorAxis * Math.cos(angle));
      const z_pos = centerz + (semiMinorAxis * Math.sin(angle));

      const asteroidMesh = new celestialBody("asteroid");
      asteroidMesh.hideAxesHelper();
      asteroidMesh.hideLabel();
      asteroidMesh.setMajorAxis(semiMajorAxis);
      asteroidMesh.setMinorAxis(semiMinorAxis);

      if(Math.random() <= 0.5) {
        asteroidMesh.model = this.models.Asteroid_1.scene.children[0].clone();
      }
      else {
        asteroidMesh.model = this.models.Asteroid_2.scene.children[0].clone();
      }

      asteroidMesh.model.name = 'Asteroid';
      asteroidMesh.model.scale.set(5, 5, 5);
      asteroidMesh.model.position.set(x_pos, centery, z_pos);

      group.add(asteroidMesh.model);
    }

    this.scene.add(group);
    this.asteroids.push(group);
  }

  showAsteroids()
  {
    for(let i = 0; i < this.asteroids.length; ++i) {
      this.asteroids[i].visible = true;
    }
  }

  hideAsteroids()
  {
    for(let i = 0; i < this.asteroids.length; ++i) {
      this.asteroids[i].visible = false;
    }
  }

  asteroidsUpdate(delta, simulationSpeed)
  {
    for(let i = 0; i < this.asteroids.length; ++i) {
      this.asteroids[i].rotateY(0.000001 * simulationSpeed * delta);
    }
  }

  setAsteroidsStatic(boolean)
  {
    this.staticAsteroids = boolean;
  }

  setPlanetsScale()
  {
    planetsScaleDisplay.innerHTML = planetsScaleInput.value;
    this.system.setPlanetsScale(planetsScaleInput.value);
  }

  setSatellitesScale()
  {
    satellitesScaleDisplay.innerHTML = satellitesScaleInput.value;
    this.system.setSatellitesScale(satellitesScaleInput.value);
  }

  setStarScale()
  {
    starsScaleDisplay.innerHTML = starsScaleInput.value;
    this.system.setStarScale(starsScaleInput.value);
  }

  hidePlanets()
  {
    this.system.hidePlanets();
  }

  showPlanets()
  {
    this.system.showPlanets();
  }

  hideSatellites()
  {
    this.system.hideSatellites();
  }

  showSatellites()
  {
    this.system.showSatellites();
  }

  hideStar()
  {
    this.system.hideStar();
  }

  showStar()
  {
    this.system.showStar();
  }

  async setBackground(path)
  {
    const backgroundTexture = await new RGBELoader()
        .load(path, function(texture){
          texture.mapping = THREE.EquirectangularReflectionMapping;
          return texture;
    });

    this.scene.background = backgroundTexture;
    this.scene.environment = backgroundTexture;
  }

  tick()
  {
    requestAnimationFrame(this.tick.bind(this));

    const delta = this.clock.getDelta();
    this.controls.update(delta);
    this.raycaster.setFromCamera(this.mouse, this.camera);

    this.system.updateLabelsVisibility(this.scene, this.camera, this.raycaster);
    this.system.updateLocationLabelVisibility(this.scene, this.camera, this.raycaster);
    this.system.updateLabels(this.camera);
    this.system.star.updateLabel(this.camera);

    if(isSimulating)
    {
      this.system.update(delta, simulationSpeed);

      if(this.ship != null) {
        this.ship.update(delta, simulationSpeed);
      }

      if(!this.staticAsteroids) {
        this.asteroidsUpdate(delta, simulationSpeed);
      }
    }

    this.renderer.render(this.scene, this.camera);
    this.labelRenderer.render(this.scene, this.camera);
  }

  run()
  {
    this.tick(); 
  }
}

const world = new SolarSystemViewer(canvas);
world.setSolarSystem(solSystem);
await world.load3DModels();
world.ship.makeModelLit();
world.ship.setNameToChildren();
world.setTypeOfOrbit();
world.setBackground('./textures/background/stars.hdr');
world.addAsteroids(0, 0, 0, 370, 380, 40);
world.addAsteroids(0, 0, 0, 660, 690, 40);
world.addAsteroids(0, 0, 0, 1000, 970, 70);
world.addAsteroids(0, 0, 0, 1500, 1550, 50);
world.addAsteroids(0, 0, 0, 2100, 1900, 50);
world.startSimulating();
world.run();
