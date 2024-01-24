import * as THREE from 'three';
import planet from './planets.js';
import satellite from './satellites.js';
import star from './star.js';
import descriptions from './descriptions.js';

const orbitScale = 50;
const satelliteOrbitScale = 10;
const planetScale = 1000;
const starScale = 5500;
const toKilometers = 2500;
const textureLoader = new THREE.TextureLoader();

const SUN_RADIUS = 696340 / starScale;
const SUN_PERIOD = (2 * Math.PI) / (27*24*60*60);

const MERCURY_RADIUS = 2440/planetScale;
const MERCURY_MAJOR_AXIS = 69820000/toKilometers / orbitScale;
const MERCURY_MINOR_AXIS = 49000000/toKilometers / orbitScale;
const MERCURY_PERIOD = 88;
const MERCURY_ROTATION = (2 * Math.PI) / (59*24*60*60);

const VENUS_RADIUS = 6052/planetScale;
const VENUS_MAJOR_AXIS = 108208000/toKilometers / orbitScale;
const VENUS_MINOR_AXIS = 107476000/toKilometers / orbitScale;
const VENUS_PERIOD = 225;
const VENUS_ROTATION = (2 * Math.PI) / (243*24*60*60);

const EARTH_RADIUS = 6371/planetScale;
const EARTH_MAJOR_AXIS = 149598000/toKilometers / orbitScale;
const EARTH_MINOR_AXIS = 147095000/toKilometers / orbitScale;
const EARTH_PERIOD = 365;
const EARTH_ROTATION = (2 * Math.PI) / (23.59*60*60);

const MARS_RADIUS = 3390/planetScale;
const MARS_MAJOR_AXIS = 227959000/toKilometers / orbitScale;
const MARS_MINOR_AXIS = 206650000/toKilometers / orbitScale;
const MARS_PERIOD = 687;
const MARS_ROTATION = (2 * Math.PI) / (24.6*60*60);

const JUPITER_RADIUS = 69911/planetScale;
const JUPITER_MAJOR_AXIS = 777847900/toKilometers / orbitScale;
const JUPITER_MINOR_AXIS = 740595000/toKilometers / orbitScale;
const JUPITER_PERIOD = 4333;
const JUPITER_ROTATION = (2 * Math.PI) / (10*60*60);

const SATURN_RADIUS = 58232/planetScale;
const SATURN_MAJOR_AXIS = 1432041000/toKilometers / orbitScale;
const SATURN_MINOR_AXIS = 1357554000/toKilometers / orbitScale;
const SATURN_PERIOD = 10756;
const SATURN_ROTATION = (2 * Math.PI) / (10.7*60*60);

const URANUS_RADIUS = 25362/planetScale;
const URANUS_MAJOR_AXIS = 2867043000/toKilometers / orbitScale;
const URANUS_MINOR_AXIS = 2732696000/toKilometers / orbitScale;
const URANUS_PERIOD = 30687;
const URANUS_ROTATION = (2 * Math.PI) / (17*60*60);

const NEPTUNE_RADIUS = 24622 / planetScale;
const NEPTUNE_MAJOR_AXIS = 4514953000/toKilometers / orbitScale;
const NEPTUNE_MINOR_AXIS = 4471050000/toKilometers / orbitScale;
const NEPTUNE_PERIOD = 60190;
const NEPTUNE_ROTATION = (2 * Math.PI) / (16*60*60);

const MOON_RADIUS = 1737.4 / planetScale;
const MOON_MAJOR_AXIS = EARTH_RADIUS * 2 * 30 / satelliteOrbitScale;
const MOON_MINOR_AXIS = EARTH_RADIUS * 2 * 30 / satelliteOrbitScale;
const MOON_PERIOD = 27.3;
const MOON_ROTATION = (2 * Math.PI) / (29.5*24*60*60);

const TITAN_RADIUS = 2574.7 / planetScale;
const TITAN_MAJOR_AXIS = 1221870 / toKilometers / satelliteOrbitScale * 4;
const TITAN_MINOR_AXIS = 1257060 / toKilometers / satelliteOrbitScale * 4;
const TITAN_PERIOD = 15.94;
const TITAN_ROTATION = (2 * Math.PI) / (TITAN_PERIOD*24*60*60);

const GANYMEDE_RADIUS = 2631 / planetScale;
const GANYMEDE_MAJOR_AXIS = 1071600 / toKilometers / satelliteOrbitScale * 4;
const GANYMEDE_MINOR_AXIS = 1069200 / toKilometers / satelliteOrbitScale * 4;
const GANYMEDE_PERIOD = 7.2;
const GANYMEDE_ROTATION = (2 * Math.PI) / (7.2*24*60*60);

const EUROPA_RADIUS = 1561 / planetScale;
const EUROPA_MAJOR_AXIS = 676938 / toKilometers / satelliteOrbitScale * 4;
const EUROPA_MINOR_AXIS = 664862 / toKilometers / satelliteOrbitScale * 4;
const EUROPA_PERIOD = 3.6;
const EUROPA_ROTATION = (2 * Math.PI) / (3.6*24*60*60);


class solarSystem
{
    constructor()
    {
        this.star = null;
        this.planets = [];
        this.satellites = [];
    }

    hidePlanetsLabels()
    {
        for(let i = 0; i < this.planets.length; ++i) {
            this.planets[i].hideLabel();
        }
    }

    showPlanetsLabels()
    {
        for(let i = 0; i < this.planets.length; ++i) {
            this.planets[i].showLabel();
        }
    }

    hideSatellitesLabels()
    {
        for(let i = 0; i < this.satellites.length; ++i) {
            this.satellites[i].hideLabel();
        }
    }

    showSatellitesLabels()
    {
        for(let i = 0; i < this.satellites.length; ++i) {
            this.satellites[i].showLabel();
        }
    }

    hideStarLabel()
    {
        this.star.hideLabel();
    }

    showStarLabel()
    {
        this.star.showLabel();
    }

    addToScene(scene)
    {
        if(this.star != null) {
            this.star.addToScene(scene);
        }

        for(let i = 0; i < this.planets.length; ++i) {
            this.planets[i].addToScene(scene);
        }
    }

    setStarScale(value)
    {
        this.star.scale(value, value, value);
    }

    setPlanetsScale(value)
    {
        for(let i = 0; i < this.planets.length; ++i) {
            this.planets[i].scale(value, value, value);
        }
    }

    setSatellitesScale(value)
    {
        for(let i = 0; i < this.satellites.length; ++i) {
            this.satellites[i].scale(value, value, value);
        }
    }

    setStar(newStar)
    {
        this.star = newStar;
    }

    getStar()
    {
        return this.star;
    }

    setPlanets(planetArray)
    {
        this.planets = planetArray;
    }

    getPlanets()
    {
        return this.planets;
    }

    setSatellites(satelliteArray)
    {
        this.satellites = satelliteArray;
    }

    getSatellites()
    {
        return this.satellites;
    }

    hidePlanets()
    {
        for(let i = 0; i < this.planets.length; ++i) {
            this.planets[i].hide();
        }
    }

    showPlanets()
    {
        for(let i = 0; i < this.planets.length; ++i) {
            this.planets[i].show();
        }
    }

    hideSatellites()
    {
        for(let i = 0; i < this.planets.length; ++i) {
            this.planets[i].hideSatellites();
        }
    }

    showSatellites()
    {
        for(let i = 0; i < this.planets.length; ++i) {
            this.planets[i].showSatellites();
        }
    }

    hideStar()
    {
        this.star.hide();
    }

    showStar()
    {
        this.star.show();
    }

    freezeSatellites()
    {
        for(let i = 0; i < this.satellites.length; ++i) {
            this.satellites[i].freeze();
        }
    }

    unfreezeSatellites()
    {
        for(let i = 0; i < this.satellites.length; ++i) {
            this.satellites[i].unfreeze();
        }
    }

    freezePlanets()
    {
        for(let i = 0; i < this.planets.length; ++i) {
            this.planets[i].freeze();
        }
    }

    unfreezePlanets()
    {
        for(let i = 0; i < this.planets.length; ++i) {
            this.planets[i].unfreeze();
        }
    }

    freezeStar()
    {
        this.star.freeze();
    }

    unfreezeStar()
    {
        this.star.unfreeze();
    }

    hideOrbits()
    {
        for(let i = 0; i < this.planets.length; ++i) {
            this.planets[i].hideOrbit();
            this.planets[i].hideSatelliteOrbit();
        }
    }

    hideOrbitTraces()
    {
        for(let i = 0; i < this.planets.length; ++i) {
            this.planets[i].hideOrbitTrace();
            this.planets[i].hideSatelliteOrbitTrace();
        }
    }

    showOrbits()
    {
        for(let i = 0; i < this.planets.length; ++i) {
            this.planets[i].showOrbit();
            this.planets[i].showSatelliteOrbit();
        }
    }

    showOrbitTraces()
    {
        for(let i = 0; i < this.planets.length; ++i) {
            this.planets[i].showOrbitTrace();
            this.planets[i].showSatelliteOrbitTrace();
        }
    }

    hideAllOrbits()
    {
        for(let i = 0; i < this.planets.length; ++i) {
            this.planets[i].hideAllOrbits();
            this.planets[i].hideSatelliteOrbit();
            this.planets[i].hideSatelliteOrbitTrace();
        }
    }

    updateLocationLabelVisibility(scene, camera, raycaster)
    {
        for(let i = 0; i < this.planets.length; ++i) {
            this.planets[i].updateLocationLabelsVisibility(scene, camera, raycaster);
        }
    }

    updateLabelsVisibility(scene, camera, raycaster)
    {
        this.star.updateLabelVisibility(scene, camera, raycaster);

        for(let i = 0; i < this.planets.length; ++i) {
            this.planets[i].updateLabelVisibility(scene, camera, raycaster);
        }
        for(let i = 0; i < this.satellites.length; ++i) {
            this.satellites[i].updateLabelVisibility(scene, camera, raycaster);
        }
    }

    updateLabels(camera)
    {
        for(let i = 0; i < this.planets.length; ++i) {
            this.planets[i].updateLabel(camera);
        }
        for(let i = 0; i < this.satellites.length; ++i) {
            this.satellites[i].updateLabel(camera);
        }
    }

    update(delta, simulationSpeed)
    {
        this.star.update(delta, simulationSpeed);

        for(let i = 0; i < this.planets.length; ++i) {
            this.planets[i].update(delta, simulationSpeed);
        }
    }
}

const solSystem = new solarSystem();

function initSolarSystem()
{
    const sun = new star('Sun', SUN_RADIUS, new THREE.MeshBasicMaterial({map: textureLoader.load('../textures/stars/sun.jpg')}), SUN_PERIOD);
    const mercury = new planet('Mercury', MERCURY_RADIUS, 
            new THREE.MeshStandardMaterial({map: textureLoader.load('../textures/planets/mercury.jpg')}), MERCURY_MAJOR_AXIS, MERCURY_MINOR_AXIS, MERCURY_PERIOD);
    const venus = new planet('Venus', VENUS_RADIUS, 
            new THREE.MeshStandardMaterial({map: textureLoader.load('../textures/planets/venus.jpg')}), VENUS_MAJOR_AXIS, VENUS_MINOR_AXIS, VENUS_PERIOD);
    const earth = new planet('Earth', EARTH_RADIUS, 
            new THREE.MeshStandardMaterial({map: textureLoader.load('../textures/planets/earth.jpg'),
            emissiveMap: textureLoader.load('../textures/planets/earthNight.jpg'), emissive: new THREE.Color(0.3, 0.3, 0.3), emissiveIntensity: 0.25}),
            EARTH_MAJOR_AXIS, EARTH_MINOR_AXIS, EARTH_PERIOD);
    const mars = new planet('Mars', MARS_RADIUS, 
            new THREE.MeshStandardMaterial({map: textureLoader.load('../textures/planets/mars.jpg')}), MARS_MAJOR_AXIS, MARS_MINOR_AXIS, MARS_PERIOD);
    const jupiter = new planet('Jupiter', JUPITER_RADIUS, 
            new THREE.MeshStandardMaterial({map: textureLoader.load('../textures/planets/jupiter.jpg')}), JUPITER_MAJOR_AXIS, JUPITER_MINOR_AXIS, JUPITER_PERIOD);
    const saturn = new planet('Saturn', SATURN_RADIUS, 
            new THREE.MeshStandardMaterial({map: textureLoader.load('../textures/planets/saturn.jpg')}), SATURN_MAJOR_AXIS, SATURN_MINOR_AXIS, SATURN_PERIOD);
    const uranus = new planet('Uranus', URANUS_RADIUS, 
            new THREE.MeshStandardMaterial({map: textureLoader.load('../textures/planets/uranus.jpg')}), URANUS_MAJOR_AXIS, URANUS_MINOR_AXIS, URANUS_PERIOD);
    const neptune = new planet('Neptune', NEPTUNE_RADIUS, 
            new THREE.MeshStandardMaterial({map: textureLoader.load('../textures/planets/neptune.jpg')}), NEPTUNE_MAJOR_AXIS, NEPTUNE_MINOR_AXIS, NEPTUNE_PERIOD);
    
    const moon = new satellite("Moon", MOON_RADIUS, new THREE.MeshStandardMaterial({map: textureLoader.load('../textures/satellites/moon.jpg')}),
        MOON_MAJOR_AXIS, MOON_MINOR_AXIS, MOON_PERIOD);
    const titan = new satellite("Titan", TITAN_RADIUS, new THREE.MeshStandardMaterial({color: "#dc8407"}),
        TITAN_MAJOR_AXIS, TITAN_MINOR_AXIS, TITAN_PERIOD);
    const ganymede = new satellite("Ganymede", GANYMEDE_RADIUS, new THREE.MeshStandardMaterial({map: textureLoader.load('../textures/satellites/ganymede.jpg')}),
        GANYMEDE_MAJOR_AXIS, GANYMEDE_MINOR_AXIS, GANYMEDE_PERIOD);
    const europa = new satellite("Europa", EUROPA_RADIUS, new THREE.MeshStandardMaterial({map: textureLoader.load('../textures/satellites/europa.jpg')}),
        EUROPA_MAJOR_AXIS, EUROPA_MINOR_AXIS, EUROPA_PERIOD);

    const earthClouds = new THREE.MeshStandardMaterial({map: textureLoader.load('../textures/clouds/earthClouds.png'), transparent: true})
    earth.addClouds(earthClouds);
    
    earth.addLocation(41.9981, 21.4254, 'Skopje', 0.06, 'red', 'yellow');
    earth.addLocation(51.5072, 0.1276, 'London', 0.1, 'green', 'darkred');
    earth.addLocation(52.5200, 13.4050, 'Berlin', 0.08, 'white', 'grey');
    earth.addLocation(48.8566, 2.3522, 'Paris', 0.12, 'white', 'blue');
    earth.addLocation(40.4168, -3.7038, 'Madrid', 0.009, 'aqua', 'orange');
    earth.addLocation(38.8898, -77.0090, 'Washington D.C', 0.14, 'blue', 'white');
    earth.addLocation(34.0549, -118.2436, 'Los Angeles', 0.18, 'green', 'white');
    earth.addLocation(32.7767, -96.8088, 'Dallas', 0.14, 'purple', 'yellow');
    earth.addLocation(45.4215, -75.6972, 'Ottawa', 0.12, 'cyan', 'red');
    earth.addLocation(19.432608, -99.133209, 'Mexico City', 0.13, 'lightgreen', 'brown');
    earth.addLocation(-15.79388, -47.8827, 'Brasilia', 0.124, 'darkgreen', 'yellow');
    earth.addLocation(-34.603722, -58.381592, 'Buenos Aires', 0.148, 'white', 'blue');
    earth.addLocation(55.7558, 37.6173, 'Moscow', 0.18);
    earth.addLocation(-33.8688, 151.2093, 'Sydney', 0.1, 'brown', 'blue');
    earth.addLocation(28.6139, 77.2090, 'New Delhi', 0.182, 'blue', 'orange');
    earth.addLocation(39.9042, 116.4074, 'Beijing', 0.178, 'white', 'darkred');
    earth.addLocation(35.6764, 139.6500, 'Tokyo', 0.164, 'pink', 'red');
    earth.addLocation(30.0444, 31.2357, 'Cairo', 0.136, 'orange', 'yellow');
    earth.addLocation(-33.9249, 18.4241, 'Cape Town', 0.122, 'green', 'pink');
    earth.addLocation(9.0192, 38.7525, 'Addis Ababa', 0.146, '#ee00aa', '#5C4033');

    mars.addLocation(24.321, 52.1045, 'Colony Alpha', 0.04, 'red', 'blue');

    saturn.addRing(new THREE.MeshBasicMaterial({map: textureLoader.load('./textures/rings/saturnRing.png'), side: THREE.DoubleSide, transparent: true}),
        50, 160, 5, 0.0, 0.1);
    
    uranus.addRing(new THREE.MeshBasicMaterial({map: textureLoader.load('./textures/rings/uranusRing.png'), side: THREE.DoubleSide, transparent: true}),
        55, 60, 4.5, 0.5, 0.1);

    neptune.addRing(new THREE.MeshBasicMaterial({map: textureLoader.load('./textures/rings/uranusRing.png'), side: THREE.DoubleSide, transparent: true}),
        34, 65, 5.1, 0.3, 0.1);

    mercury.setShortDescription(descriptions.mercury.short);
    mercury.setLongDescription(descriptions.mercury.long);

    venus.setShortDescription(descriptions.venus.short);
    venus.setLongDescription(descriptions.venus.long);

    earth.setShortDescription(descriptions.earth.short);
    earth.setLongDescription(descriptions.earth.long);

    mars.setShortDescription(descriptions.mars.short);
    mars.setLongDescription(descriptions.mars.long);

    jupiter.setShortDescription(descriptions.jupiter.short);
    jupiter.setLongDescription(descriptions.jupiter.long);

    saturn.setShortDescription(descriptions.saturn.short);
    saturn.setLongDescription(descriptions.saturn.long);

    uranus.setShortDescription(descriptions.uranus.short);
    uranus.setLongDescription(descriptions.uranus.long);

    neptune.setShortDescription(descriptions.neptune.short);
    neptune.setLongDescription(descriptions.neptune.long);

    sun.setLabelColor('gold');

    mercury.setOrbitColor('cyan');
    mercury.setOrbitTraceColor('cyan');
    mercury.setLabelColor('Red');
    venus.setOrbitColor('orange');
    venus.setOrbitTraceColor('orange');
    venus.setLabelColor('purple')
    earth.setOrbitColor('green');
    earth.setOrbitTraceColor('green');
    earth.setLabelColor('white');
    mars.setOrbitColor('red');
    mars.setOrbitTraceColor('red');
    mars.setLabelColor('orange');
    jupiter.setOrbitColor('yellow');
    jupiter.setOrbitTraceColor('yellow');
    jupiter.setLabelColor('cyan');
    saturn.setOrbitColor('brown');
    saturn.setOrbitTraceColor('brown');
    saturn.setLabelColor('grey');
    uranus.setOrbitColor('lime');
    uranus.setOrbitTraceColor('lime');
    uranus.setLabelColor('aqua');
    neptune.setOrbitColor('gold');
    neptune.setOrbitTraceColor('gold');
    neptune.setLabelColor('crimson');

    moon.setOrbitColor('aqua');
    moon.setOrbitTraceColor('aqua');
    moon.setLabelColor('fuchsia');

    titan.setOrbitColor('brown');
    titan.setOrbitColor('brown');
    titan.setLabelColor('maroon');

    ganymede.setOrbitColor('aqua');
    ganymede.setOrbitTraceColor('aqua');
    ganymede.setLabelColor('teal');

    earth.addSatellite(moon, 1.1);
    saturn.addSatellite(titan, 1.2);
    jupiter.addSatellite(ganymede, 0.5);
    jupiter.addSatellite(europa);

    sun.setRotationYSpeed(SUN_PERIOD);

    mercury.setRotationYSpeed(MERCURY_ROTATION);
    venus.setRotationYSpeed(VENUS_ROTATION);
    earth.setRotationYSpeed(EARTH_ROTATION);
    mars.setRotationYSpeed(MARS_ROTATION);
    jupiter.setRotationYSpeed(JUPITER_ROTATION);
    saturn.setRotationYSpeed(SATURN_ROTATION);
    uranus.setRotationYSpeed(URANUS_ROTATION);
    neptune.setRotationYSpeed(NEPTUNE_ROTATION);

    moon.setRotationYSpeed(MOON_ROTATION);
    titan.setRotationYSpeed(TITAN_ROTATION);
    ganymede.setRotationYSpeed(GANYMEDE_ROTATION);
    europa.setRotationYSpeed(EUROPA_ROTATION);

    solSystem.setPlanets([mercury, venus, earth, mars, jupiter, saturn, uranus, neptune]);
    solSystem.setSatellites([moon, titan, ganymede, europa]);
    solSystem.setStar(sun);
}

initSolarSystem();

export default solSystem;