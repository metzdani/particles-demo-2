import Vec2 from "./Vec2.js";
import ParticleSystem from "./ParticleSystem.js";

const canvas = document.getElementById("canvas");
canvas.width = innerWidth;
canvas.height = innerHeight;

const system = new ParticleSystem(canvas);

canvas.addEventListener("click",function(){
	system.dropStone();
});

canvas.addEventListener("contextmenu",function(e){
	e.preventDefault();
	system.dropFluid();
});

document.addEventListener("keypress",function(e){
	if (e.key=='+' && dtime<0.1) {
		dtime *= 2.0;
	}
	if (e.key=='-') {
		dtime /= 2.0;
	}
});

var dtime = 0.1;
function tick() {
	system.update(dtime);
	system.render(dtime);
	requestAnimationFrame(tick);
}

tick();
