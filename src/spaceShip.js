import * as THREE from 'three';

function distance3D(a_pos, b_pos) {
    return Math.sqrt(Math.pow(b_pos.x-a_pos.x, 2) + Math.pow(b_pos.y-a_pos.y, 2) + Math.pow(b_pos.z-a_pos.z, 2));
}

function calculateMiddlePoint3D(a_pos, b_pos) {
    return [(a_pos.x + b_pos.x)/2, (a_pos.y + b_pos.y)/2, (a_pos.z + b_pos.z)/2];
}

export default class spaceShip
{
    constructor(mesh, name)
    {
        this.mesh = mesh;
        this.name = name;
        this.scene = null;
        this.startingPosition = [];
        this.endingPosition = []
        this.startingPlanet = null;
        this.destinationPlanet = null;
        this.isTravelling = false;
        this.trajectory = null;
        this.trajectoryLine = null;
        this.trajectoryLinePoints = 512;
        this.speed = 0.4;
        this.prevPosition = null;
        this.up = new THREE.Vector3(0, 1, 0);
        this.axis = new THREE.Vector3();
        this.setAxesHelpers();
        this.hideAxesHelpers();
    }

    showAxesHelpers()
    {
        this.axesHelpers.visible = true;
    }

    hideAxesHelpers()
    {
        this.axesHelpers.visible = false;
    }

    setAxesHelpers()
    {
        this.axesHelpers = new THREE.AxesHelper(10);
        this.mesh.add(this.axesHelpers);
    }

    makeModelLit()
    {
        for(let i = 0; i < this.mesh.children.length; ++i) {
            for(let j = 0; j < this.mesh.children[i].children.length; ++j) {
                const newMaterial = new THREE.MeshBasicMaterial({color: this.mesh.children[i].children[j].material.color});
                this.mesh.children[i].children[j].material = newMaterial;
            }
        }
    }

    setNameToChildren()
    {
        for(let i = 0; i < this.mesh.children.length; ++i) {
            for(let j = 0; j < this.mesh.children[i].children.length; ++j) {
                this.mesh.children[i].children[j].name = this.name;
            }
        }
    }

    addToScene(scene)
    {
        scene.add(this.mesh)
        this.scene = scene;
    }

    addTrajectoryLineToScene()
    {
        this.scene.add(this.trajectoryLine);
    }

    removeTrajectoryLineFromScene()
    {
        this.scene.remove(this.trajectoryLine);
    }

    setSpeed(newSpeed)
    {
        this.speed = newSpeed;
    }

    getSpeed()
    {
        return this.speed;
    }

    hide()
    {
        this.mesh.visible = false;
    }

    show()
    {
        this.mesh.visible = true;
    }

    setStartingPlanet(planetObj)
    {
        this.startingPlanet = planetObj;
    }

    setDestinationPlanet(planetObj)
    {
        this.destinationPlanet = planetObj;
    }

    setStartingPosition(x, y, z)
    {
        this.startingPosition = [x, y, z];
    }

    setEndingPosition(x, y, z)
    {
        this.endingPosition = [x, y, z];
    }

    makePath()
    {
        const startPosition = new THREE.Vector3();
        const destinationPosition = new THREE.Vector3();

        this.startingPlanet.getWorldPosition(startPosition);
        this.destinationPlanet.getWorldPosition(destinationPosition);

        let distanceBetween = distance3D(startPosition, destinationPosition);
        const middlePoint = calculateMiddlePoint3D(startPosition, destinationPosition);

        if(distanceBetween >= 20) distanceBetween /= 20;
        else distanceBetween = 1;

        middlePoint[1] = 5 * distanceBetween;

        this.trajectory = new THREE.CatmullRomCurve3([
            startPosition,
            new THREE.Vector3(...middlePoint),
            destinationPosition
        ]);

        const points = this.trajectory.getPoints(this.trajectoryLinePoints);
        const geo = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({color: 0xffffff});
        this.trajectoryLine = new THREE.Line(geo, material);
        this.timeElapsed = 0;
    }

    travel()
    {
        if(this.startingPlanet == null || this.destinationPlanet == null || this.startingPlanet == this.destinationPlanet || this.isTravelling)
            return;
        this.makePath();
        this.addTrajectoryLineToScene();
        this.isTravelling = true;
    }

    update(delta, simulationSpeed)
    {
        if(this.isTravelling)
        {
            if(this.timeElapsed == 0) {
                this.show();
            }

            this.timeElapsed += delta * simulationSpeed;
            const newPosition = (this.timeElapsed / this.speed % this.trajectoryLinePoints) / this.trajectoryLinePoints;
            const tan = this.trajectory.getTangent(newPosition);
            this.axis.crossVectors(this.up, tan).normalize();
            const radians = Math.acos(this.up.dot(tan));

            if(this.prevPosition != null && newPosition < this.prevPosition) {
                // JOURNEY FINISHED
                this.isTravelling = false;
                this.timeElapsed = 0;
                this.hide();
                this.removeTrajectoryLineFromScene();
                this.prevPosition = null;
                return;
            }

            this.mesh.position.copy(this.trajectory.getPointAt(newPosition));
            this.mesh.quaternion.setFromAxisAngle(this.axis, radians);
            this.prevPosition = newPosition;
        }
    }
}