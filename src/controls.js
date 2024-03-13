import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import * as THREE from 'three';

export default class orbitControls
{
    constructor(camera, renderDomElement)
    {
        this.camera = camera;
        this.renderDomElement = renderDomElement;
        this.controls = new OrbitControls(this.camera, this.renderDomElement);
        this.controls.enablePan = false;
        this.position = new THREE.Vector3(0, 0, 0);
        this.target = new THREE.Vector3(0, 0, 0);
        this.isFollowingObject = false;
        this.followingObject = null;
    }

    lookAt(newTarget)
    {
        const oldTarget = this.controls.target.clone();
        this.target.copy(newTarget);
        this.controls.target = this.target;
        this.camera.lookAt(this.target);
        this.camera.position.sub(oldTarget.sub(this.controls.target));
    }

    getAutoRotateSpeed()
    {
        return this.controls.autoRotateSpeed;
    }

    setAutoRotateSpeed(newSpeed)
    {
        this.controls.autoRotateSpeed = newSpeed;
    }

    isAutoRotating()
    {
        return this.controls.autoRotate;
    }

    setAutoRotate(shouldRotate)
    {
        this.controls.autoRotate = shouldRotate;
    }

    setMaxZoomOut(value)
    {
        this.controls.maxDistance = value;
    }

    setMinZoomIn(value)
    {
        this.controls.minDistance = value;
    }

    setPosition(newPosition)
    {
        this.position.copy(newPosition);
        this.camera.position.copy(this.position);
    }

    followObject(objectToFollow)
    {
        this.isFollowingObject = true;
        this.followingObject = objectToFollow;
    }

    stopFollowingObject()
    {
        this.isFollowingObject = false;
    }

    update(delta)
    {
        this.camera.updateMatrixWorld();

        if(this.isFollowingObject)
        {
            const objectNewPosition = new THREE.Vector3();
            this.followingObject.getWorldPosition(objectNewPosition);
            this.lookAt(objectNewPosition);
        }

        this.controls.update(delta);
    }
}