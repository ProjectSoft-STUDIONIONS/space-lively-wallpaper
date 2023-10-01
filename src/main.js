'use strict'

let PARTICLE_NUM = 500,
	PARTICLE_BASE_RADIUS = 0.6,
	FL = 200,
	DEFAULT_SPEED = 2,
	CANVAS_IMAGE = "wallpapers/default.jpg",
	BACKGROUND_CHECK = true,
	PARTICLE_COLOR = '#FFFFFF',
	font,
	CLOCK_POSITION = 1,
	FONT_CHECK = true,
	FONT_SIZE = 52,
	FONT_COLOR = "#FFFFFF",
	FONT_ALPHA = 0.25,
	tmpFontSize = 52,
	fontColor = 'rgba(0, 255, 0, 1)',
	padding = 15,
	canvas = document.getElementById('c'),
	context = canvas.getContext('2d'),
	canvasWidth, canvasHeight,
	centerX, centerY,
	mouseX, mouseY,
	speed = DEFAULT_SPEED,
	targetSpeed = DEFAULT_SPEED,
	particles = [],
	requestID,
	root = {
		FL: FL,
		PARTICLE_NUM: PARTICLE_NUM,
		PARTICLE_BASE_RADIUS: PARTICLE_BASE_RADIUS,
		DEFAULT_SPEED: DEFAULT_SPEED,
		PARTICLE_COLOR: PARTICLE_COLOR,
		BACKGROUND_CHECK: BACKGROUND_CHECK,
		CANVAS_IMAGE: CANVAS_IMAGE,
		FONT_CHECK: FONT_CHECK,
		FONT_SIZE: FONT_SIZE,
		FONT_COLOR:FONT_COLOR ,
		FONT_ALPHA: FONT_ALPHA,
		CLOCK_POSITION: CLOCK_POSITION
	},
	contain = {
		image: null,
		x: 0,
		y: 0,
		w: 0,
		h: 0
	},
	/**
	 * Загрузка шрифта
	**/
	setFont = function()
	{
		font && document.fonts.delete(font);
		font = new FontFace("DIGIT-CL", 'url(font/digit-cl.ttf)');
		font.load().then(function(fn) {
			font = fn;
			document.fonts.add(font);
			context.font =  root.FONT_SIZE + 'px DIGIT-CL';
		}).catch(function(e) {
			// error
		});
	},
	/**
	 * HEX to RGBA
	**/
	hexToRgbA = function(hex)
	{
		let c = false;
		if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
			c= hex.substring(1).split('');
			if(c.length== 3){
				c= [c[0], c[0], c[1], c[1], c[2], c[2]];
			}
			c= '0x'+c.join('');
			return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+',' + root.FONT_ALPHA + ')';
		}
		return hex;
	},
	/**
	 * Время
	**/
	getTime = function()
	{
		let date = new Date(),
			hour = String(date.getHours()).padStart(2, "0"),
			minute = String(date.getMinutes()).padStart(2, "0"),
			second = String(date.getSeconds()).padStart(2, "0"),
			ms = date.getMilliseconds() >= 500 ? ";" : ":";
		return `${hour}${ms}${minute}${ms}${second}`;
	},
	/**
	 * Анимация
	**/
	loop = function()
	{
		cancelAnimationFrame(requestID);
		const FPL = 500,
			CENTER_X = centerX,
			CENTER_Y = centerY;
		let p,
			/* cx, cy, */
			rx, ry,
			f, x, y, r,
			pf, px, py, pr,
			a, a1, a2,
			halfPi = Math.PI * 0.5,
			atan2  = Math.atan2,
			cos	= Math.cos,
			sin	= Math.sin,
			i;
		speed += (root.DEFAULT_SPEED - speed) * 0.01;
		context.save();
		context.fillStyle = 'rgba(0, 0, 0, 1)';
		context.fillRect(0, 0, canvasWidth, canvasHeight);
		context.restore();
		/**
		 * Отрисовка фона
		**/
		if(root.BACKGROUND_CHECK) {
			try{context.drawImage(contain.image, contain.x, contain.y, contain.w, contain.h);}catch(e){}
		}
		context.save();
		/**
		 * Отрисовка времени
		**/
		if(root.FONT_CHECK) {
			context.font =  root.FONT_SIZE + 'px DIGIT-CL';
			context.fillStyle = fontColor;
			let time = getTime();
			switch(root.CLOCK_POSITION){
				case 0:
					context.textBaseline = "top";
					context.textAlign = "left";
					context.fillText(time, padding, padding);
					break;
				case 1:
					context.textBaseline = "top";
					context.textAlign = "right";
					context.fillText(time, canvas.width - padding, padding);
					break;
				case 2:
					context.textBaseline = "bottom";
					context.textAlign = "left";
					context.fillText(time, padding, canvas.height - padding * 3);
					break;
				case 3:
					context.textBaseline = "bottom";
					context.textAlign = "right";
					context.fillText(time, canvas.width - padding, canvas.height - padding * 3);
					break;
			}
		}
		context.restore();
		context.fillStyle = root.PARTICLE_COLOR;
		context.beginPath();
		/**
		 * Отрисовка звёзд
		**/
		for (i = 0; i < root.PARTICLE_NUM; i++) {
			p = particles[i];
			p.pastZ = p.z;
			p.z -= speed;
			if (p.z <= 0) {
				randomizeParticle(p);
				continue;
			}
			rx = p.x - CENTER_X;
			ry = p.y - CENTER_Y;
			f = FPL / p.z;
			x = CENTER_X + rx * f;
			y = CENTER_Y + ry * f;
			r = root.PARTICLE_BASE_RADIUS * f;
			pf = FPL / p.pastZ;
			px = CENTER_X + rx * pf;
			py = CENTER_Y + ry * pf;
			pr = root.PARTICLE_BASE_RADIUS * pf;
			a  = atan2(py - y, px - x);
			a1 = a + halfPi;
			a2 = a - halfPi;
			context.moveTo(px + pr * cos(a1), py + pr * sin(a1));
			context.arc(px, py, pr, a1, a2, true);
			context.lineTo(x + r * cos(a2), y + r * sin(a2));
			context.arc(x, y, r, a2, a1, true);
			context.closePath();
		}
		context.fill();
		requestID = window.requestAnimationFrame(loop);
	},
	/**
	 * Рандомное положение звезды
	**/
	randomizeParticle = function(p)
	{
		p.x = Math.random() * canvasWidth;
		p.y = Math.random() * canvasHeight;
		p.z = Math.random() * 1500 + 500;
		return p;
	},
	/**
	 * Загрузка изображения
	**/
	loadImage = function(callback)
	{
		const image = new Image(),
			obj = {
				image: image,
				x: 0,
				y: 0,
				w: 0,
				h: 0
			};
		image.src = root.CANVAS_IMAGE;
		image.onload = function () {
			const ratio = image.width / image.height;
			let newWidth = canvas.width;
			let newHeight = newWidth / ratio;
			if (newHeight < canvas.height) {
				newHeight = canvas.height;
				newWidth = newHeight * ratio;
			}
			obj.w = newWidth;
			obj.h = newHeight;
			obj.x = newWidth > canvas.width ? (canvas.width - newWidth) / 2 : 0;
			obj.y = newHeight > canvas.height ? (canvas.height - newHeight) / 2 : 0;
			callback(obj);
		}
		return obj;
	},
	setContain = function(con){
		contain = con;
	},
	/**
	 * Ресайз
	**/
	resize = function()
	{
		context = canvas.getContext('2d');
		context.canvas.width = canvasWidth  = window.innerWidth;
		context.canvas.height = canvasHeight = window.innerHeight;
		centerX = canvasWidth * 0.5;
		centerY = canvasHeight * 0.5;
		context.fillStyle = root.PARTICLE_COLOR;
		context.fillRect(0, 0, canvasWidth, canvasHeight);
		if(contain.image){
			const ratio = contain.image.width / contain.image.height;
			let newWidth = canvas.width;
			let newHeight = newWidth / ratio;
			if (newHeight < canvas.height) {
				newHeight = canvas.height;
				newWidth = newHeight * ratio;
			}
			contain.w = newWidth;
			contain.h = newHeight;
			contain.x = newWidth > canvas.width ? (canvas.width - newWidth) / 2 : 0;
			contain.y = newHeight > canvas.height ? (canvas.height - newHeight) / 2 : 0;
		}else{
			contain = loadImage(setContain);
		}
	},
	/**
	 * Particle (Звезда)
	 */
	Particle = function(x, y, z)
	{
		this.x = x || 0;
		this.y = y || 0;
		this.z = z || 0;
		this.pastZ = 0;
	},
	createParticles = function() {
		particles = [];
		for (i = 0; i < root.PARTICLE_NUM; i++) {
			particles[i] = randomizeParticle(new Particle());
			particles[i].z -= 500 * Math.random();
		}
	},
	i;
// Lively Wallpaper Property Listener
function livelyPropertyListener(name, val){
	cancelAnimationFrame(requestID);
	root[name] = val;
	speed = root.DEFAULT_SPEED;
	switch(name){
		// background
		case "CANVAS_IMAGE":
		case "BACKGROUND_CHECK":
			contain = loadImage(setContain);
			break;
		// particles
		case "PARTICLE_NUM":
			createParticles();
			break;
		case "PARTICLE_COLOR":
			resize();
			break;
		// font clock
		case "FONT_CHECK":
		case "FONT_SIZE":
			setFont();
			break;
		case "FONT_COLOR":
		case "FONT_ALPHA":
			fontColor = hexToRgbA(root.FONT_COLOR);
			break;
	}
	loop();
}
// Загружаем шрифт
setFont();
// Подписываемся на событие и запускаем Ресайз
window.addEventListener('resize', resize);
resize();
// Сoздаём Звёзды
createParticles();
// Запуск Анимации
requestID = window.requestAnimationFrame(loop);