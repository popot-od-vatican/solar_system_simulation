import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

const modelLoader = new GLTFLoader();

export function distance(x, y, a, b)
{
    return Math.sqrt(Math.pow(x-a, 2) + Math.pow(y-b, 2));
}

export async function loadModelFromFile(src)
{
    const p = new Promise((resolve, reject) => {
        modelLoader.load(src, (object) => {
            resolve(object);
        })
    });

    const obj = await p.then((object) => {return object;});
    
    return obj;
}

export default class celestialBody
{
    constructor(name, geometry = null, texture = null, semiMajorAxis = 0, semiMinorAxis = 0, period = 0)
    {
        this.name = name;
        this.semiMajorAxis = semiMajorAxis;
        this.semiMinorAxis = semiMinorAxis;
        this.isRotating = false;
        this.position = [0, 0, 0];
        this.rotationXSpeed = 0;
        this.rotationYSpeed = 0;
        this.rotationZSpeed = 0;
        this.timeElapsed = 0;
        this.orbitLine = null;
        this.orbitPointsCount = 1024;
        this.trace = null;
        this.tracePointsCount = 75;
        this.model = null;
        this.fixed = false;
        this.hidden = false;
        this.hiddenLabel = false;
        this.traceTransition = false;

        this.objectSystem = new THREE.Object3D();
        this.objectSystem.name = `${this.name}-Main`;

        this.shortDescription = '';
        this.longDescription = {};

        if(geometry == null)
        {
            geometry = new THREE.SphereGeometry(3.5, 30, 30);
        }

        if(texture == null)
        {
            this.objectMaterial = new THREE.MeshStandardMaterial({color: 0xffffff});
        }
        else
        {
            this.objectMaterial = texture;
        }

        this.axesHelper = new THREE.AxesHelper(40);
        this.axesHelper.setColors('red', 'green', 'blue');
        this.axesHelper.name = `${this.name}-AxesHelper`;

        this.objectDiv = document.createElement('div');
        this.objectDiv.textContent = this.name;

        this.objectLabel = new CSS2DObject(this.objectDiv);

        this.object = new THREE.Mesh(geometry, this.objectMaterial);
        this.object.name = this.name;
        this.objectSystem.name = `${this.name}-System`;

        this.object.add(this.axesHelper);
        
        this.objectSystem.add(this.objectLabel);
        this.objectSystem.add(this.object);

        this.setPosition(this.semiMajorAxis, 0, 0);
        this.setLabelColor('red');
        this.setPeriod(period);
        this.setLabelPosition(0, 3.5 * 2, 0);
        this.hideAxesHelper();
    }

    makeOrbit(centerx = 0, centery = 0, centerz = 0)
    {
        const points = [];

        for(let i = 0; i <= this.orbitPointsCount; ++i)
        {
            const theta = (i / this.orbitPointsCount) * Math.PI * 2;
            const x = this.semiMajorAxis * Math.cos(theta) + centerx;
            const z = this.semiMinorAxis * Math.sin(theta) + centerz;
            points.push(x, centery, z);
        }

        const ellipseGeometry = new THREE.BufferGeometry();
        ellipseGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(points), 3));
        
        const material = new THREE.LineBasicMaterial({color: 0xffffff});

        this.orbitLine = new THREE.Line(ellipseGeometry, material);
        this.orbitLine.name = `${this.name}-Orbit`;
    }

    makeTrace()
    {
        const points = [];

        for(let i = 0; i <= this.tracePointsCount; ++i) {
            points.push(this.position[0], this.position[1], this.position[2]);
        }

        const lineGeo = new THREE.BufferGeometry();
        lineGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(points), 3));
        const lineMat = new THREE.LineBasicMaterial({color: 0xffffff});

        this.trace = new THREE.Line(lineGeo, lineMat);
        this.trace.name = `${this.name}-Trace`;
    }

    addTraceToScene(scene)
    {
        if(this.trace != null) {
            scene.add(this.trace);
        }
    }

    addOrbitToScene(scene)
    {
        if(this.orbitLine != null) {
            scene.add(this.orbitLine);
        }
    }

    setPosition(x, y, z)
    {
        this.position = [x, y, z];
        this.objectSystem.position.set(this.position[0], this.position[1], this.position[2]);
    }

    getPosition()
    {
        return this.position;
    }

    hideAllOrbits()
    {
        this.hideOrbit();
        this.hideOrbitTrace();
    }

    show()
    {
        this.objectSystem.visible = true;
        this.showLabel();
        this.hiddenLabel = false;
        this.hidden = false;
    }

    hide()
    {
        this.objectSystem.visible = false;
        this.hideLabel();
        this.hideOrbit();
        this.hideOrbitTrace();
        this.hiddenLabel = true;
        this.hidden = true;
    }

    isVisible()
    {
        return this.object.visible;
    }

    showLabel()
    {
        this.objectLabel.visible = true;
        this.hiddenLabel = false;
    }

    hideLabel()
    {
        this.objectLabel.visible = false;
        this.hiddenLabel = true;
    }

    setLabelColor(newColor)
    {
        this.objectDiv.style.color = newColor;
    }

    setLabelFontSize(newSize)
    {
        this.objectDiv.style.fontSize = `${newSize}px`;
    }

    setLabelClass(newClass)
    {
        this.objectDiv.className = newClass;
    }

    setLabelPosition(x, y, z)
    {
        this.objectLabel.position.set(x, y, z);
    }

    setLabelCenter(newCenter)
    {
        this.objectLabel.center.set(newCenter[0], newCenter[1]);
    }

    async loadModel(src, scene)
    {
        this.model = await loadModelFromFile(src);
        this.addModelToScene(scene);
    }

    addModelToScene(scene)
    {
        this.objectSystem.remove(this.object);

        this.object = this.model.scene;

        this.object.add(this.axesHelper);

        this.objectSystem.add(this.object);
    }

    translateX(units)
    {
        this.objectSystem.translateX(units);
    }

    translateY(units)
    {
        this.objectSystem.translateY(units);
    }

    translateZ(units)
    {
        this.objectSystem.translateZ(units);
    }

    rotate(newRotation)
    {
        this.object.rotation.set(newRotation[0], newRotation[1], newRotation[2]);
    }

    rotateBy(x, y, z)
    {
        this.object.rotateX(x);
        this.object.rotateY(y);
        this.object.rotateZ(z);
    }

    setShouldRotate(shouldRotate)
    {
        this.isRotating = shouldRotate;
    }

    setRotationXSpeed(newSpeed)
    {
        this.rotationXSpeed = newSpeed;
    }

    setRotationYSpeed(newSpeed)
    {
        this.rotationYSpeed = newSpeed;
    }

    setRotationZSpeed(newSpeed)
    {
        this.rotationZSpeed = newSpeed;
    }

    lookAt(positionToLookAt)
    {
        this.object.lookAt(positionToLookAt);
    }

    setOrbitColor(newColor)
    {
        if(this.orbitLine != null)
        {
            const newMat = new THREE.LineBasicMaterial({color: newColor});
            this.orbitLine.material = newMat;
        }
    }

    setOrbitTraceColor(newColor)
    {
        if(this.trace != null)
        {
            const newMat = new THREE.LineBasicMaterial({color: newColor});
            this.trace.material = newMat;
        }
    }

    showOrbit()
    {
        if(this.orbitLine != null)
        {
            this.orbitLine.visible = true;
        }
    }

    showOrbitTrace()
    {
        if(this.trace != null)
        {
            this.trace.visible = true;
        }
    }

    hideOrbit()
    {
        if(this.orbitLine != null)
        {
            this.orbitLine.visible = false;
        }
    }

    hideOrbitTrace()
    {
        if(this.trace != null)
        {
            this.trace.visible = false;
        }
    }

    addToScene(scene)
    {
        scene.add(this.objectSystem);
    }

    hideAxesHelper()
    {
        this.axesHelper.visible = false;
    }

    showAxesHelper()
    {
        this.axesHelper.visible = true;
    }

    setMajorAxis(newSemiMajorAxis)
    {
        this.semiMajorAxis = newSemiMajorAxis;
    }

    setMinorAxis(newSemiMinorAxis)
    {
        this.semiMinorAxis = newSemiMinorAxis;
    }

    setPeriod(newPeriod)
    {
        if(newPeriod == 0)
            newPeriod = 1;
        this.period = newPeriod;
        this.speed = ((Math.PI * 2) / this.period)/24/60/60;
    }

    setOrbitPointsCount(newOrbitPointsCount)
    {
        this.orbitPointsCount = newOrbitPointsCount;
    }

    setTracePointsCount(newTracePointsCount)
    {
        this.tracePointsCount = newTracePointsCount;
    }

    getOrbitPointsCount()
    {
        return this.orbitPointsCount;
    }

    getTracePointsCount()
    {
        return this.tracePointsCount;
    }

    freeze()
    {
        this.fixed = true;
    }

    unfreeze()
    {
        this.fixed = false;
    }

    setShortDescription(text)
    {
        this.shortDescription = text;
    }

    setLongDescription(text)
    {
        this.longDescription = text;
    }

    scale(x, y, z)
    {
        this.objectSystem.scale.set(x, y, z);
    }

    updateLabelVisibility(scene, camera, raycaster)
    {
        if(!this.hiddenLabel)
        {
            this.objectSystem.getWorldPosition(raycaster.ray.origin);
            const rd = camera.position.clone().sub(raycaster.ray.origin).normalize();
            raycaster.ray.direction.set(rd.x, rd.y, rd.z);

            const hits = raycaster.intersectObjects(scene.children, true);
            let count = hits.length;


            for(let j = 0; j < hits.length; ++j) {
                if(hits[j] != null && hits[j].hasOwnProperty('object')) {
                    if(hits[j].object.name.includes('Clouds') || hits[j].object.name.includes('Helper') || hits[j].object.type == 'Line' || 
                        hits[j].object.name == "Apollo 21") {
                        --count;
                    }
                }
                
            }

            if(count >= 1) {
                if(this.name == 'Sun') {
                    if(count >= 4) {
                        this.hideLabel();
                        this.hiddenLabel = false;
                    }
                    else {
                        this.showLabel();
                    }
                }
                else {
                    this.hideLabel();
                    this.hiddenLabel = false;
                }
            }
            else {
                this.showLabel();
            }
        }
    }

    updateLabel(camera, maxDistance = 50000.0, minDistance = 20.0)
    {
        const vec3 = new THREE.Vector3();
        this.objectSystem.getWorldPosition(vec3);
        const distance = camera.position.distanceTo(vec3);
        if(distance >= maxDistance || distance <= minDistance) {
            this.objectLabel.element.style.opacity = "0";
        }
        else {
            this.objectLabel.element.style.opacity = "1";
        }
    }

    update(delta, simulationSpeed)
    {
        if(!this.fixed)
        {
            this.timeElapsed = this.timeElapsed + (delta * simulationSpeed);

            if(this.isRotating)
            {
                this.object.rotateX(this.rotationXSpeed * delta * simulationSpeed);
                this.object.rotateY(this.rotationYSpeed * delta * simulationSpeed);
                this.object.rotateZ(this.rotationZSpeed * delta * simulationSpeed);
            }

            const x = this.semiMajorAxis * Math.cos(-(this.timeElapsed*this.speed));
            const z = this.semiMinorAxis * Math.sin(-(this.timeElapsed*this.speed));

            if(this.trace != null)
            {
                const traceVertices = this.trace.geometry.attributes.position.array;

                if(simulationSpeed * 2 >= this.period*24*60*60)
                {
                    this.traceTransition = true;

                    for(let i = 0; i <= this.tracePointsCount; ++i) {
                        const theta = (i / this.tracePointsCount) * Math.PI * 2;
                        traceVertices[i * 3] = this.semiMajorAxis * Math.cos(theta);
                        traceVertices[(i*3)+2] = this.semiMinorAxis * Math.sin(theta);
                    }

                    this.trace.geometry.attributes.position.needsUpdate = true;
                    this.trace.geometry.computeBoundingBox();
                    this.trace.geometry.computeBoundingSphere();
                }
                else if(distance(x, z, traceVertices[traceVertices.length-3], traceVertices[traceVertices.length-1]) >= 0.21)
                {
                    traceVertices[traceVertices.length-3] = x;
                    traceVertices[traceVertices.length-1] = z;

                    if(this.traceTransition) {

                        for(let i = 0; i < (traceVertices.length / 3) - 1; ++i) {
                            traceVertices[i * 3] = x;
                            traceVertices[(i*3)+2] = z;
                        }

                        this.trace.geometry.computeBoundingBox();
                        this.trace.geometry.computeBoundingSphere();
                        this.traceTransition = false;
                    }
                    else {
                        for(let i = 0; i < (traceVertices.length / 3) - 1; ++i) {
                            traceVertices[i*3] = traceVertices[(i+1)*3];
                            traceVertices[i * 3 + 2] = traceVertices[(i+1)*3 + 2];
                        }

                        this.trace.geometry.attributes.position.needsUpdate = true;
                        this.trace.geometry.computeBoundingBox();
                        this.trace.geometry.computeBoundingSphere();
                    }
                }
            }
            this.setPosition(x, this.position[1], z);
        }
    }
}