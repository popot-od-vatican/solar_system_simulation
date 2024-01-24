import * as THREE from 'three';
import celestialBody from './celestialBody.js';

export default class star extends celestialBody {
    constructor(name, radius, texture, period = 0)
    {
        super(name, new THREE.SphereGeometry(radius, 40, 40), texture, 0, 0, period);

        this.radius = radius;
        this.planets = [];

        this.setLabelPosition(0, this.radius * 1.8, 0);
        this.setLabelFontSize(26);
        this.setShouldRotate(true);
    }

    setPlanets(planetArray)
    {
        this.planets = planetArray;
    }

    getPlanets()
    {
        return this.planets;
    }

    updateLabel(camera)
    {
        super.updateLabel(camera, 9000, 1000.0);
    }

    updateOrbitingPlanets(delta, simulationSpeed)
    {
        for(let i = 0; i < this.planets.length; ++i) {
            this.planets[i].update(delta, simulationSpeed);
        }
    }
}