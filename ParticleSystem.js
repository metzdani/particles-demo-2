import Vec2 from "./Vec2.js";
import Particle from "./Particle.js";

export default class ParticleSystem {

	constructor(canvas) {
		this.canvas = canvas;
		this.context = canvas.getContext("2d");
		this.context.font="16px Fixed";
		this.particles = [];
		this.spriteCache = {};
		
		this.gravity = new Vec2(0, 6); //6 / 0
		this.easeOnCollission =  0.0001;
		this.easeOnContainerCollission = 0.45; //1 / 0.5;

		this.gridSize = 1;
		this.gridWidth = Math.ceil(this.canvas.width / this.gridSize);
		this.grid = {};
		this.initFluidParticles(1000, 0, 3*this.canvas.height/4, this.canvas.width, this.canvas.height/4);
		this.tmp = new Vec2(0,0);
	}

	update(dt) {
		let startTime = performance.now();
		let tmp = new Vec2(0,0);
		let relativeVelocity = new Vec2(0,0);
		let f = new Vec2(0,0);
	
		this.grid = {};
		for (let particle of this.particles) {
			particle.gridIndex = this.getGridIdx(particle.position);
			if (!this.grid[particle.gridIndex]) {
				this.grid[particle.gridIndex] = [];
			}
			this.grid[particle.gridIndex].push(particle);
		}

		for (let particle of this.particles) {
			particle.force.reset();
			particle.force.add(this.gravity.clone(tmp).scale(particle.mass));
			for (let cell of this.getGridCellsNear(particle)) {
				for (let particle1 of cell) {
					let dir = particle1.position.clone(tmp).sub(particle.position);
					let dist = dir.length();
					if (dist>0 && dist<(particle.interactionRadius + particle1.interactionRadius)) {
						particle.velocity.clone(relativeVelocity).sub(particle1.velocity);
						let collissiondist = particle.radius+particle1.radius;
						let a = (dist<collissiondist) ? 1.0 : 0.0015;
						dir.clone(f).normalize().scale(a*(dist-collissiondist));
						f.sub(relativeVelocity.scale(this.easeOnCollission));
						particle.force.add(f);
					}
				}
			}
			particle.velocity.add(particle.force.clone(tmp).scale(dt/particle.mass));

			if (particle.position.x<=0 && particle.velocity.x<0) {
				particle.velocity.x *= -this.easeOnContainerCollission;
			}
			if (particle.position.y<=0 && particle.velocity.y<0) {
				particle.velocity.y *= -this.easeOnContainerCollission
			}
			if (particle.position.x>=this.canvas.width && particle.velocity.x>0) {
				particle.velocity.x *= -this.easeOnContainerCollission
			}
			if (particle.position.y>=this.canvas.height && particle.velocity.y>0) {
				particle.velocity.y *= -this.easeOnContainerCollission;
			}
		}

		for (let particle of this.particles) {
			particle.position.add(particle.velocity.clone(tmp).scale(dt));
		}

		this.calcTime = performance.now() - startTime;
	}

	initFluidParticles(number, tlx, tly, w, h, afterInit) {
		for (let i=0; i<number; i++) {
			let isHeavy = Math.random()>0.5;

			this.addParticle(
				new Particle(
					isHeavy ? 0.1 : 0.05,
					isHeavy ? 5 : 7,
					isHeavy ? 17 : 19,
					new Vec2(tlx+Math.random()*w, tly+Math.random()*h), 
					new Vec2(0,0),
					isHeavy ? "rgb(10,50,128,0.8)" : "rgb(150,20,100,0.8)"
				)
			);
			if (typeof afterInit=='function') {
				afterInit(particle);
			}
		}
	}


	dropStone() {
		let particle = new Particle(0, 10, 20, new Vec2(0,0), new Vec2(0,0));
		particle.position.set(this.canvas.width, this.canvas.height*0.2);
		particle.velocity.set(-50, 55);
		particle.mass = 20;
		particle.color = "#555";
		this.addParticle(particle);
	}

	dropFluid() {
		this.initFluidParticles(50, this.canvas.width/2-40, 0, 80, 80);
	}

	render(dt) {
		let time = performance.now();
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		var tmp = new Vec2(0,0);
		var tmp1 = new Vec2(0,0);
		for (let particle of this.particles) {
			particle.position.clone(tmp).sub(tmp1.set(particle.radius, particle.radius)).round();
			this.context.drawImage(particle.sprite, tmp.x, tmp.y);
		}
		
		this.drawGrid();
		let renderTime = performance.now() - time;

		this.context.fillStyle = "#000";
		this.context.fillText("Particles: "+this.particles.length, 5, 16);
		this.context.fillText("Physics: "+this.calcTime.toFixed(2)+" ms", 5, 32);
		this.context.fillText("Rendering: "+renderTime.toFixed(2)+" ms", 5, 48);
		this.context.fillText("deltaTime: "+dt, 5, 64);
	}

	drawGrid() {
		this.context.lineWidth = 0.5;
		this.context.strokeStyle = "#444";
		for (let x=this.gridSize; x<this.canvas.width; x+=this.gridSize) {
			this.context.beginPath();
			this.context.moveTo(x,0);
			this.context.lineTo(x, this.canvas.height);
			this.context.stroke();
		}
		for (let y=this.gridSize; y<this.canvas.height; y+=this.gridSize) {
			this.context.beginPath();
			this.context.moveTo(0,y);
			this.context.lineTo(this.canvas.width, y);
			this.context.stroke();
		}
	}

	getGridIdx(position) {
		let x = Math.floor(position.x / this.gridSize);
		let y = Math.floor(position.y / this.gridSize);
		return x + y*this.gridWidth;
	}

	addParticle(particle) {
		this.particles.push(particle);
		let key = this.getSpriteCacheKey(particle);
		if (this.gridSize < particle.interactionRadius*2) {
			this.gridSize = particle.interactionRadius*2;
			this.gridWidth = Math.ceil(this.canvas.width / this.gridSize);
		}
		if (!this.spriteCache[key]) {
			let c = document.createElement('canvas');
			let r = Math.ceil(particle.radius);
			let d = r*2;
			c.width = c.height = d;
			let ctx = c.getContext('2d');

			ctx.beginPath();
			ctx.arc(r,r,particle.radius,0,2*Math.PI);
			ctx.fillStyle = particle.color;
			ctx.fill();
			this.spriteCache[key] = c;
		}
		particle.sprite = this.spriteCache[key];
	}

	getSpriteCacheKey(particle) {
		return particle.color+":"+particle.radius;
	}

	getGridCellsNear(particle) {
		let result = [];
		for (let y=-1; y<=1; y++) {
			let gridPos = y*this.gridWidth;
			for (let x=-1; x<=1; x++) {
				if (this.grid[particle.gridIndex + gridPos + x]) {
					result.push(this.grid[particle.gridIndex + gridPos + x]);
				}
			}
		}
		return result;
	}

}