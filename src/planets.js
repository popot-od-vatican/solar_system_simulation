import * as THREE from 'three';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import celestialBody from './celestialBody.js';


function distance(x, y, a, b)
{
    return Math.sqrt(Math.pow(x-a, 2) + Math.pow(y-b, 2));
}

export default class planet extends celestialBody
{
    constructor(name, radius, texture, semiMajorAxis = null, semiMinorAxis = null, period = null)
    {
        super(name, new THREE.SphereGeometry(radius, 30, 30), texture, semiMajorAxis, semiMinorAxis, period);

        this.radius = radius;
        this.satellites = [];
        this.locations = [];

        this.setLabelPosition(0, this.radius * 6.0, 0);
        this.setLabelFontSize(24);
        this.setShouldRotate(true);
    }

    addRing(texture, innerRadius, outerRadius, rotationX = 0, rotationY = 0, rotationZ = 0)
    {
        const ringGeo = new THREE.RingGeometry(innerRadius, outerRadius, 30, 30);

        this.ring = new THREE.Mesh(ringGeo, texture);
        this.ring.name = `${this.name}-Ring`;
        this.ring.rotateX(rotationX);
        this.ring.rotateY(rotationY);
        this.ring.rotateZ(rotationZ);

        this.objectSystem.add(this.ring);
    }

    addClouds(texture, size = 1.01)
    {
        if(this.clouds == null) {
            const cloudsGeo = new THREE.SphereGeometry(this.radius*size, 30, 30);
            const cloudsMat = texture;
            this.clouds = new THREE.Mesh(cloudsGeo, cloudsMat);
            this.clouds.name = `${this.name}-Clouds`;
            this.objectSystem.add(this.clouds);
        }
    }

    addSatellite(satelliteObj, yOffset = 1)
    {
        this.objectSystem.add(satelliteObj.objectSystem);
        satelliteObj.setPosition(satelliteObj.semiMajorAxis, yOffset, 0);
        satelliteObj.orbitLine.position.set(0, yOffset, 0);
        satelliteObj.trace.position.set(0, yOffset, 0);

        this.objectSystem.add(satelliteObj.orbitLine);
        this.objectSystem.add(satelliteObj.trace);
        this.satellites.push(satelliteObj);

        satelliteObj.hideOrbitTrace();
    }

    hideSatellites()
    {
        for(let i = 0; i < this.satellites.length; ++i) {
            this.satellites[i].hide();
        }

        this.hideSatelliteOrbit();
        this.hideSatelliteOrbitTrace();
    }

    showSatellites()
    {
        for(let i = 0; i < this.satellites.length; ++i) {
            this.satellites[i].show();
        }
    }

    hideSatelliteOrbit()
    {
        for(let i = 0; i < this.satellites.length; ++i){
            this.satellites[i].hideOrbit();
        }
    }

    hideSatelliteOrbitTrace()
    {
        for(let i = 0; i < this.satellites.length; ++i) {
            this.satellites[i].hideOrbitTrace();
        }
    }

    showSatelliteOrbit()
    {
        for(let i = 0; i < this.satellites.length; ++i) {
            this.satellites[i].showOrbit();
        }
    }

    showSatelliteOrbitTrace()
    {
        for(let i = 0; i < this.satellites.length; ++i) {
            this.satellites[i].showOrbitTrace();
        }
    }

    showClouds()
    {
        this.clouds.visible = true;
    }

    hideClouds()
    {
        this.clouds.visible = false;
    }

    addLocation(latitude , longitude, name, locationSize = 0.035, labelColor = 'red', pointColor = 'red')
    {
        const pointGeo = new THREE.SphereGeometry(locationSize, 10, 10);
        const pointMat = new THREE.MeshBasicMaterial({color: pointColor});
        const pointMesh = new THREE.Mesh(pointGeo, pointMat);

        const latRad = (latitude) * Math.PI / 180;
        const lonRad = -(longitude) * Math.PI / 180;

        pointMesh.position.set(
            Math.cos(latRad) * Math.cos(lonRad) * this.radius,
            Math.sin(latRad) * this.radius,
            Math.cos(latRad) * Math.sin(lonRad) * this.radius,
        );

        const div = document.createElement('div');
        div.className = 'location-label';
        div.textContent = name;
        div.style.color = labelColor;

        const label = new CSS2DObject(div);
        label.position.set(Math.cos(latRad) * Math.cos(lonRad) * this.radius * 1.1, Math.sin(latRad) * this.radius * 1.1, 
            Math.cos(latRad) * Math.sin(lonRad) * this.radius * 1.1);

        pointMesh.name = 'location';

        this.object.add(pointMesh);
        this.object.add(label);

        this.locations.push({pointMesh, label});
    }

    hide()
    {
        super.hide();
        this.hideLocationLabels();

        for(let i = 0; i < this.satellites.length; ++i) {
            this.satellites[i].hide();
        }
    }

    show()
    {
        super.show();
        this.showLocationLabels();

        for(let i = 0; i < this.satellites.length; ++i) {
            this.satellites[i].show();
            this.satellites[i].hideOrbit();
            this.satellites[i].hideOrbitTrace();
        }
    }

    hideLocationLabels()
    {
        for(let i = 0; i < this.locations.length; ++i) {
            this.locations[i].label.visible = false;
        }
    }

    showLocationLabels()
    {
        for(let i = 0; i < this.locations.length; ++i) {
            this.locations[i].label.visible = true;
        }
    }

    updateLocationLabelsVisibility(scene, camera, raycaster)
    {
        for(let i = 0; i < this.locations.length; ++i)
        {
            this.locations[i].label.getWorldPosition(raycaster.ray.origin);
            const rd = camera.position.clone().sub(raycaster.ray.origin).normalize();
            raycaster.ray.direction.set(rd.x, rd.y, rd.z);

            let hits = raycaster.intersectObjects(this.objectSystem.children);
            let count = hits.length;

            for(let j = 0; j < hits.length; ++j) {
                if(hits[j] != null && hits[j].hasOwnProperty('object')) {
                    if(hits[j].object.name.includes('Clouds') || hits[j].object.name.includes('Helper') || hits[j].object.type == 'Line') {
                        --count;
                    }
                }
            }

            const vec3 = new THREE.Vector3();
            this.locations[i].pointMesh.getWorldPosition(vec3);

            if(count > 0 || camera.position.distanceTo(vec3) >= 20.0) {
                this.locations[i].label.element.style.opacity = "0";
            }
            else {
                this.locations[i].label.element.style.opacity = "1";
            }
        }
    }

    update(delta, simulationSpeed)
    {
        super.update(delta, simulationSpeed);

        for(let i = 0; i < this.satellites.length; ++i) {
            this.satellites[i].update(delta, simulationSpeed);
        }

        if(this.clouds != null) {
            this.clouds.rotateY(this.rotationYSpeed * 2.4 * delta * simulationSpeed);
        }
    }
}