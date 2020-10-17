import Vec2 from "./Vec2.js";
import ParticleSystem from "./ParticleSystem.js";

const canvas = document.getElementById("canvas");
let afReq = null;
window.onload = window.onresize = function() {
	if (afReq!=null) {
		cancelAnimationFrame(afReq);
		afReq = null;
	}
	canvas.width =  canvas.style.width = innerWidth;
	canvas.height = canvas.style.height = innerHeight;
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
		if (e.key=='c') {
			system.cool();
		}
	});

	var dtime = 0.1;
	function tick() {
		system.update(dtime);
		system.render(dtime);
		afReq = requestAnimationFrame(tick);
	}

	tick();
}
