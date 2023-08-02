export class GameLoop {
	static MAX_DT = 1000;

	constructor ({ fps = 60, onTick, onStart, onStop, start = false, $game } = {}) {
		this.$game = $game;

		this.fps = fps;
		this.onTick = onTick;
		this.onStart = onStart;
		this.onStop = onStop;

		this.startTime = null;
		this.lastTime = null;
		this.frame = null;

		if(onTick && start) {
			this.start();
		}
	}

	get spf() {
		return 1000 / this.fps;
	}
	get isRunning() {
		return this.frame !== null;
	}

	start() {
		this.startTime = this.lastTime = performance.now();
		this.frame = requestAnimationFrame((time) => this.tick(time));

		if(this.onStart) {
			this.onStart();
		}

		return this;
	}
	stop() {
		cancelAnimationFrame(this.frame);
		this.frame = null;

		if(this.onStop) {
			this.onStop();
		}

		return this;
	}

	tick(time) {
		let dt = time - this.lastTime;
		dt = Math.min(dt, GameLoop.MAX_DT);

		if(dt >= this.spf) {
			const ip = Math.floor(dt / this.spf);
			const normalizedDt = dt / 1000;

			this.onTick({
				dt: normalizedDt,
				ip,
				startTime: this.startTime,
				lastTime: this.lastTime,
				fps: this.fps,
			});

			this.lastTime = time;
		}

		this.frame = requestAnimationFrame((time) => this.tick(time));
	}
};

export default GameLoop;