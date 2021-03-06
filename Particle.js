import Vec2 from "./Vec2.js";

export default class Particle {

	constructor(mass, radius, interactionRadius, position, velocity, color) {
		this.id = id++;
		this.position = position;
		this.velocity = velocity;
		this.mass = mass;
		this.color = color;
		this.force = new Vec2(0,0);
		this.radius = radius;
		this.interactionRadius = interactionRadius;
		this.gridIndex = -1;
		this.sprite = null;
	}

}

var id=0;