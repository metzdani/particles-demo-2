export default class Vec2 {
	
	constructor(x,y) {
		this.x = x;
		this.y = y;
	}

	set(x, y) {
		this.x = x;
		this.y = y;
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

	clone() {
		return new Vec2(this.x, this.y);
	}

	reset() {
		this.x = 0;
		this.y = 0;
	}

}