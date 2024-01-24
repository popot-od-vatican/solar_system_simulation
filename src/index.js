import * as THREE from 'three';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import orbitControls from './controls.js';
import solSystem from './solarSystem.js';

const canvasDomElement = document.getElementById("viewport");
const prevButton = document.getElementById('prev');
const nextButton = document.getElementById('next');
const shortDescription = document.getElementById('short-description');
const longDescription = document.getElementById('long-description');
const longDescriptionTitle = document.getElementById('description-title');
const longDescriptionFirstParagraph = document.getElementById('description-section-1');
const longDescriptionSecondParagraph = document.getElementById('description-section-2');
const toggleDescriptionButton = document.getElementById('toggle-description-button');
const title = document.getElementById('current-planet');

let isLongDescriptionVisible = false;

function setShortDescription(newDescription)
{
    shortDescription.innerHTML = newDescription;
}

function setLongDescription(newDescription)
{
    longDescriptionTitle.innerHTML = newDescription.title;
    longDescriptionFirstParagraph.innerHTML = newDescription.paragraph[0];
    longDescriptionSecondParagraph.innerHTML = newDescription.paragraph[1];
}

function setTitle(newTitle)
{
    title.innerHTML = newTitle;
}

function nextPlanet()
{
    w.changePlanet(+1);
}

function prevPlanet()
{
    w.changePlanet(-1);
}

function toggleLongDescription()
{
    isLongDescriptionVisible = !isLongDescriptionVisible;

    if(isLongDescriptionVisible) {
        longDescription.style.left = "0";
    }
    else {
        longDescription.style.left = "-100%";
    }
}

function setEventsListeners()
{
    prevButton.onclick = prevPlanet;
    nextButton.onclick = nextPlanet;
    toggleDescriptionButton.onclick = toggleLongDescription;
}


class planetViewer
{
    constructor()
    {
        this.mouse = {
            x: 0,
            y: 0
        };

        this.setRenderer();
        this.setScene();
        this.setCamera();
        this.setOrbitControls();
        this.setLights();
        this.setClock();
        this.setRaycaster();

        this.setEventsListeners();

        this.addStarsToBackground();

        this.planets = [];
        this.index = 0;
    }

    setRenderer()
    {
        this.renderer = new THREE.WebGLRenderer({canvas: canvasDomElement, antialias: true});
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        this.labelRenderer = new CSS2DRenderer();
        this.labelRenderer.setSize(window.innerWidth, window.innerHeight);
        this.labelRenderer.domElement.style.position = 'absolute';
        this.labelRenderer.domElement.style.top = "0px";
        this.labelRenderer.domElement.style.pointerEvents = "none";
        this.labelRenderer.domElement.style.zIndex = "0";

        document.body.appendChild(this.labelRenderer.domElement);
    }

    setScene()
    {
        this.scene = new THREE.Scene();
    }

    setCamera()
    {
        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 2000);
        this.camera.position.set(0, 0, 50);
    }

    setLights()
    {
        this.front = new THREE.PointLight(0xffffff, 2.2, 0, 0.01);
        this.front.position.set(0, 0, 2000);
        this.back = new THREE.PointLight(0xffffff, 2.2, 0, 0.01);
        this.back.position.set(0, 0, -2000);

        this.left = new THREE.PointLight(0xffffff, 2.2, 0, 0.01);
        this.left.position.set(-2000, 0, 0);

        this.right = new THREE.PointLight(0xffffff, 2.2, 0, 0.01);
        this.right.position.set(2000, 0, 0);

        this.top = new THREE.PointLight(0xffffff, 2.2, 0, 0.01);
        this.top.position.set(0, 2000, 0);
        this.bottom = new THREE.PointLight(0xffffff, 2.2, 0, 0.01);
        this.bottom.position.set(0, -2000, 0);

        this.scene.add(this.front);
        this.scene.add(this.back);
        this.scene.add(this.left);
        this.scene.add(this.right);
        this.scene.add(this.top);
        this.scene.add(this.bottom);
    }

    setOrbitControls()
    {
        this.controls = new orbitControls(this.camera, this.renderer.domElement);
    }

    setClock()
    {
        this.clock = new THREE.Clock();
        this.elapsedTime = 0;
    }

    addStarsToBackground()
    {
        const starsGeometry = new THREE.BufferGeometry();
        const starsCount = 5000;

        const starsPoints = [];

        const Xmax = 1280;
        const Xmin = -1280;

        const Ymax = 1320;
        const Ymin = -1320;

        const Zmax = 1180;
        const Zmin = -1180;

        for(let i = 0; i < starsCount; i += 3)
        {
            starsPoints.push(Math.random() * (Xmax - Xmin) + Xmin);
            starsPoints.push(Math.random() * (Ymax - Ymin) + Ymin);
            starsPoints.push(Math.random() * (Zmax - Zmin) + Zmin);
        }

        starsGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(starsPoints), 3));

        const starsMaterial = new THREE.PointsMaterial({
            size: 0.05
        });

        this.stars = new THREE.Points(starsGeometry, starsMaterial);
        this.scene.add(this.stars);
    }

    onWindowResize()
    {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.labelRenderer.setSize( window.innerWidth, window.innerHeight);
        //renderer.setPixelRatio(window.devicePixelRatio);
        this.camera.aspect = this.renderer.domElement.width / this.renderer.domElement.height;
        this.camera.updateProjectionMatrix();
    }

    onMouseMove(event)
    {
        this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    }

    setEventsListeners()
    {
        window.addEventListener('resize', this.onWindowResize.bind(this));
        window.addEventListener('mousemove', this.onMouseMove.bind(this));
    }

    setPlanets(planetsArray)
    {
        this.planets = planetsArray;
    }

    setStartingPlanet(index)
    {
        this.index = index;

        if(this.index >= this.planets.length)
        {
            this.index = this.planets.length-1;
        }
        else if(this.index < 0)
        {
            this.index = 0;
        }

        this.changePlanet(0);
    }

    changePlanet(direction)
    {
        const prevPlanet = this.planets[this.index];

        this.scene.remove(prevPlanet.objectSystem);
        
        // Hide Label Locations
        for(let i = 0; i < prevPlanet.locations.length; ++i) {
            prevPlanet.object.remove(prevPlanet.locations[i].label);
        }

        this.index = this.index + direction;

        if(this.planets.length == 1)
        {
            this.index = 0;
            nextButton.style.visibility = 'hidden';
            prevButton.style.visibility = 'hidden';
        }
        else if(this.index >= this.planets.length-1)
        {
            this.index = this.planets.length-1;
            nextButton.style.visibility = 'hidden';
            prevButton.style.visibility = 'visible';
        }
        else if(this.index <= 0)
        {
            this.index = 0;
            nextButton.style.visibility = 'visible';
            prevButton.style.visibility = 'hidden';
        }
        else
        {
            nextButton.style.visibility = 'visible';
            prevButton.style.visibility = 'visible';
        }

        const currentPlanet = this.planets[this.index];

        for(let i = 0; i < currentPlanet.locations.length; ++i) {
            currentPlanet.object.add(currentPlanet.locations[i].label);
        }

        this.controls.setMaxZoomOut(this.planets[this.index].radius * 4.25);
        this.controls.setMinZoomIn(this.planets[this.index].radius * 2.20);

        this.planets[this.index].addToScene(this.scene);
        this.planets[this.index].setPosition(0, 0, 0);
        this.planets[this.index].hideLabel();
        this.planets[this.index].hideAxesHelper();
        this.planets[this.index].hideSatellites();

        setShortDescription(this.planets[this.index].shortDescription);
        setLongDescription(this.planets[this.index].longDescription);
        setTitle(this.planets[this.index].name);
    }

    setRaycaster()
    {
        this.raycaster = new THREE.Raycaster();
    }

    tick()
    {
        requestAnimationFrame(this.tick.bind(this));

        const delta = this.clock.getDelta();
        this.elapsedTime += delta;

        this.controls.update(delta);

        this.planets[this.index].updateLocationLabelsVisibility(this.scene, this.camera, this.raycaster);

        this.renderer.render(this.scene, this.camera);
        this.labelRenderer.render(this.scene, this.camera);
    }

    run()
    {
        this.tick();
    }
}

const w = new planetViewer();
w.setPlanets(solSystem.planets);
w.setStartingPlanet(0);
w.run();

setEventsListeners();
