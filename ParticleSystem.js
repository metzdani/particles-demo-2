import Vec2 from "./Vec2.js";
import Particle from "./Particle.js";

export default class ParticleSystem {

	constructor(canvas) {
		this.canvas = canvas;
		this.context = canvas.getContext("2d");
		this.context.font="16px Fixed";
		this.particles = [];
		
		this.gravity = new Vec2(0, 6); //6 / 0
		this.easeOnCollission =  0.99; //0.99 / 0.95
		this.easeOnContainerCollission = 0.45; //1 / 0.5;

		this.gridSize = 7+10+20; // FIXME this should be determined based on the max. radius of particles and interactions
		this.gridWidth = Math.ceil(this.canvas.width / this.gridSize);
		this.grid = {};
		this.initFluidParticles(1000, 0, 3*this.canvas.height/4, this.canvas.width, this.canvas.height/4);
		this.tmp = new Vec2(0,0);
	}

	update(dt) {
		let startTime = performance.now();
		let tmp = this.tmp;
	
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
			for (let particle1 of this.getParticlesNear(particle)) {
				let dir = particle1.position.clone(tmp).sub(particle.position);
				let dist = dir.length();
				if (dist<particle.radius+particle1.radius && dist>0) {
					let f = dir.scale(0.2*(dist-particle.radius-particle1.radius));
					particle.force.add(f);
					particle.velocity.scale(1-(1-this.easeOnCollission)*dt);
				} else if (dist<(particle.radius + particle1.radius  + 20) && dist>0) {
					let f = dir.scale(0.0005*((particle.radius + particle1.radius + 20)-dist));
					particle.force.add(f);
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

			this.particles.push(
				new Particle(
					isHeavy ? 0.1 : 0.05,
					isHeavy ? 5 : 7,
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
		let particle = new Particle(0, 10, new Vec2(0,0), new Vec2(0,0));
		particle.position.set(this.canvas.width, this.canvas.height*0.2);
		particle.velocity.set(-50, 55);
		particle.mass = 100;
		particle.color = "#555";
		this.particles.push(particle);
	}

	dropFluid() {
		this.initFluidParticles(50, this.canvas.width/2-40, 0, 80, 80);
	}

	render(dt) {
		let time = performance.now();
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);		
		for (let particle of this.particles) {
			this.context.save();
			this.context.translate(particle.position.x, particle.position.y);
			this.context.beginPath();
			this.context.arc(0,0,particle.radius*1.2,0,2*Math.PI);
			this.context.fillStyle = particle.color;
			this.context.fill();
			this.context.restore();
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

	getParticlesNear(particle) {
		let result = [];
		for (let y=-1; y<=1; y++) {
			let gridPos = y*this.gridWidth;
			for (let x=-1; x<=1; x++) {
				if (this.grid[particle.gridIndex + gridPos + x]) {
					for (let p of this.grid[particle.gridIndex + gridPos + x]) {
						result.push(p);
					}
				}
			}
		}
		return result;
	}

}