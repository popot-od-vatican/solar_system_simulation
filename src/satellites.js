import * as THREE from 'three';
import celestialBody from './celestialBody.js';


export default class satellite extends celestialBody{
    constructor(name, radius, texture, semiMajorAxis = 0, semiMinorAxis = 0, period = 0)
    {
        super(name, new THREE.SphereGeometry(radius, 30, 30), texture, semiMajorAxis, semiMinorAxis, period);

        this.radius = radius;
        this.setLabelPosition(0, this.radius * 2.25, 0);
        this.setLabelFontSize(20);
        this.setShouldRotate(true);
    }

    updateLabel(camera)
    {
        super.updateLabel(camera, 800, 11.0);
    }
}