import Vec2 from "./Vec2.js";

export default class Particle {

	constructor(mass, radius, position, velocity, color) {
		this.position = position;
		this.velocity = velocity;
		this.mass = mass;
		this.color = color;
		this.force = new Vec2(0,0);
		this.radius = radius;
		this.gridIndex = -1;
		this.sprite = null;
	}

}