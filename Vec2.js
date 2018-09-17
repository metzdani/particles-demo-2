export default class Vec2 {
	
	constructor(x,y) {
		this.x = x;
		this.y = y;
	}

	set(x, y) {
		this.x = x;
		this.y = y;
		return this;
	}

	add(other) {
		this.x += other.x;
		this.y += other.y;
		return this;
	}

	sub(other) {
		this.x -= other.x;
		this.y -= other.y;
		return this;
	}

	scale(scalar) {
		this.x *= scalar;
		this.y *= scalar;
		return this;
	}

	length() {
		return Math.sqrt(this.x*this.x + this.y*this.y);
	}

	round() {
		return this.set((this.x+0.5)|0, (this.y+0.5)|0);
	}

	clone(to) {
		return to ? to.set(this.x, this.y) : new Vec2(this.x, this.y);
	}

	reset() {
		this.x = 0;
		this.y = 0;
	}

}