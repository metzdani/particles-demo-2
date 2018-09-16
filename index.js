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

var dtime = 0.1;
function tick() {
	system.update(dtime);
	system.render();
	requestAnimationFrame(tick);
}

tick();
