'use strict'
let time_1 = new Date().getTime(),
	time_2 = 0;

require('dotenv').config();

const DEBUG = parseInt(process.env.DEBUG) || false, // 1 or 0
	padLength = 20,
	pug = require('pug'),
	fs = require('fs'),
	path = require('path'),
	pkg = JSON.parse(fs.readFileSync('package.json', 'utf8')),
	UglifyJS = require("uglify-js"),
	less = require('less'),
	ZipLib = require("zip-lib"),
	newer = require('imagemin-newer'),
	Imagemin = require('imagemin'),
	colors = require('colors'),
	dirname = __dirname.replace(/\\/g, '/');
colors.setTheme({});
	// Информация о обоях
const LivelyInfo = {
		"AppVersion": `${pkg.version}.0`,
		"Title": `${pkg.title} v${pkg.version}`,
		"Thumbnail": `${pkg.name}.jpg`,
		"Preview": `${pkg.name}_preview.gif`,
		"Desc": `${pkg.description}`,
		"Author": `${pkg.author}`,
		"License": `${pkg.license}`,
		"Contact": `${pkg.homepage}`,
		"Type": 1,
		"FileName": "index.html"
	},
	// Настройки обоев
	LivelyProperty = {
		"PARTICLE_NUM": {
			// Количество звёзд
			"text": "Количество звёзд",
			"value": 500,
			"type": "slider",
			"min": 10,
			"max": 2000,
			"step": 10
		},
		"PARTICLE_BASE_RADIUS": {
			// Максимальный размер звёзд
			"text": "Максимальный размер звёзд",
			"value": 0.6,
			"type": "slider",
			"min": 0.01,
			"max": 0.7,
			"step": 0.01
		},
		"DEFAULT_SPEED": {
			// Скорость звёзд
			"text": "Скорость звёзд",
			"value": 2,
			"type": "slider",
			"min": 0.01,
			"max": 50,
			"step": 0.01
		},
		"PARTICLE_COLOR": {
			// Цвет звёзд
			"text": "Цвет звёзд",
			"type": "color",
			"value": "#D4F9FF"
		},
		"BACKGROUND_CHECK": {
			// Использовать фон
			"text": "Использовать фон",
			"type": "checkbox",
			"value": true
		},
		"CANVAS_IMAGE": {
			// Изображение
			"text": "Изображение",
			"type": "folderDropdown",
			"folder": "wallpapers",
			"value": "default.jpg",
			"filter": "*.jpg|*.png"
		},
		"FONT_CHECK": {
			// Отобразить Часы
			"text": "Отобразить Часы",
			"type": "checkbox",
			"value": true
		},
		"CLOCK_POSITION": {
			// Позиция Часов
			"text": "Позиция Часов",
			"type": "dropdown",
			"value": 1,
			"items": [
				// Верх Слева
				"Верх Слева",
				// Верх Справа
				"Верх Справа",
				// Низ Слева
				"Низ Слева",
				// Низ Справа
				"Низ Справа"
			]
		},
		"FONT_SIZE": {
			// Размер Шрифта
			"text": "Размер Шрифта",
			"type": "slider",
			"min": 10,
			"max": 200,
			"step": 1,
			"value": 52
		},
		"FONT_COLOR": {
			// Цвет Шрифта
			"text": "Цвет Шрифта",
			"type": "color",
			"value": "#D4F9FF"
		},
		"FONT_ALPHA": {
			// Прозрачность Шрифта
			"text": "Прозрачность Шрифта",
			"type": "slider",
			"value": 0.8,
			"min": 0,
			"max": 1,
			"step": 0.01
		}
	},
	log = function(name, log, deb=false) {
		let ht  = (new Date().getHours() + '').padStart(2, '0'),
			mt  = (new Date().getMinutes() + '').padStart(2, '0'),
			st  = (new Date().getSeconds() + '').padStart(2, '0'),
			ms  = (new Date().getMilliseconds() + '').padStart(3, '0'),
			std = `${ht}:${mt}:${st}.${ms}`;
		name = `${name}`.padEnd(padLength, ' ');
		name = colors.supportsColor ? colors.yellow(name) : name;
		log  = colors.supportsColor ? colors.cyan(log) : log;
		std  =  colors.supportsColor ? colors.white(std) : std;
		if(DEBUG || deb) {
			console.log(`${name}${std} ${log}`);
		}
	},
	info = function(str){
		str = str.padEnd(padLength - 1, ' .') + ' ';
		let inf = (DEBUG ? `\r\n` : ''),
			out = colors.supportsColor ? (`${inf}` + colors.yellow(`${str}`) + colors.cyan(`${pkg.title} v${pkg.version}`) + `${inf}`) : `${inf}${str}${pkg.title} v${pkg.version}${inf}`;
		console.log(out);
		done(`\u0023\u0421\u0432\u043e\u0438\u0445\u041d\u0435\u0411\u0440\u043e\u0441\u0430\u0435\u043c`);
	},
	done = function(str){
		const sm = `\u2588`,
			nl = ` `.padEnd(padLength, ' '),
			rn = DEBUG ? `` : `\r\n`;
		let len = str.length + 2,
			tb = ``.padEnd(len, sm),
			snb = colors.bgBlue(colors.blue(sm) + colors.white(str) + colors.blue(sm)),
			out = colors.supportsColor ? `${rn}${nl}${tb.white.bgWhite}\r\n${nl}${snb}\r\n${nl}${tb.red.bgRed}` : `${rn}${nl}${str}`
		console.log(`${out}\r\n`);
	},
	deleteFolder = function(dir) {
		return new Promise((resolve, reject) => {
			if(fs.existsSync(dir)) {
				fs.rm(dir, { recursive: true, force: true }, (error) => {
					if(error){
						reject(error);
					}
					resolve(dir);
				});
			}else{
				resolve('Folder Deleted Previously')
			}
		});
	};

// Стартуем
info(`START`);

// Удаляем папку dest и всё её содержимое
deleteFolder(path.join(__dirname, `dest`)).then((result) => {
	log('Folder Deleted', result);
	// Удаляем ZIP архив если существует
	fs.existsSync(path.join(__dirname, `${pkg.name}.zip`)) && (
		fs.unlinkSync(path.join(__dirname, `${pkg.name}.zip`)),
		log('File Deleted', path.join(__dirname, `${pkg.name}.zip`))
	);
	// Создаём папку dest
	fs.mkdirSync(path.join(__dirname, `dest`));
	log('Folder Created', path.join(__dirname, `dest`));

	const html_options = {
			doctype: 'html',
			client: false,
			title: `${pkg.description}`
		},
		less_options = {
			compress: true,
			plugins: []
		};
	// Создаём LICENSE
	const LICENSE = fs.readFileSync(path.join(__dirname, `LICENSE`), `utf8`);
	fs.writeFileSync(path.join(__dirname, `dest`, `LICENSE`), LICENSE, {encoding: `utf8`});
	log('File Created', path.join(__dirname, `dest`, `LICENSE`));

	// Сохраняем LivelyInfo в JSON файл с форматированием
	fs.writeFileSync(path.join(__dirname, `dest`, `LivelyInfo.json`), JSON.stringify(LivelyInfo, null, "\t"), {encoding: `utf8`});
	log('File Created', path.join(__dirname, `dest`, `LivelyInfo.json`));

	// Сохраняем LivelyProperty в JSON файл с форматированием
	fs.writeFileSync(path.join(__dirname, `dest`, `LivelyProperties.json`), JSON.stringify(LivelyProperty, null, "\t"), {encoding: `utf8`});
	log('File Created', path.join(__dirname, `dest`, `LivelyProperties.json`));

	// Компилируем LESS 
	log('File Compiled', path.join(__dirname, `src`, `main.less`));
	less.render(
		fs.readFileSync(
			path.join(__dirname, `src`, `main.less`),
			`utf8`
		),
		{
			compress : true
		})
		.then(
			function(output) {
				// Сохраняем CSS
				fs.writeFileSync(path.join(__dirname, `src`, `html_index.css`), output.css, {encoding: `utf8`});
				log('File Created', path.join(__dirname, `src`, `html_index.css`));
				// Оптимизируем изображения для LivelyInfo
				new Imagemin()
					.src(path.join(__dirname, `src`, `*.{gif,jpg}`))
					.use(newer(path.join(__dirname, `dest`)))
					.use(Imagemin.jpegtran())
					.use(Imagemin.optipng())
					.use(Imagemin.gifsicle())
					.dest(path.join(__dirname, `dest`))
				 	.run(function (error, files) {
						if (error) {
							log('ERROR', error);
							return;
						}
						files.forEach(function(a, b, c) {
							log('File Reading', a.history[0]);
							log('File Compressed', a.history[1]);
						});
						// Оптимизируем Wallpapers
						new Imagemin()
							.src(path.join(__dirname, `src`, `wallpapers`, `*.{jpg,png}`))
							.use(newer(path.join(__dirname, `dest`)))
							.use(Imagemin.jpegtran())
							.use(Imagemin.optipng())
							.dest(path.join(__dirname, `dest`, `wallpapers`))
						 	.run(function (error, files) {
								if (error) {
									log('ERROR', error);
									return;
								}
								files.forEach(function(a, b, c) {
									log('File Reading', a.history[0]);
									log('File Compressed', a.history[1]);
								});
								log('File Compiled', path.join(__dirname, `src`, `main.js`));
								// Коипилируем JS
								let codeJS = fs.readFileSync(path.join(__dirname, `src`, `main.js`), "utf8");
								// Сохраняем JS
								fs.writeFileSync(path.join(__dirname, `src`, `html_index.js`), UglifyJS.minify( codeJS, { mangle: { toplevel: true}, compress: { drop_console: true } }).code, "utf8");
								log('File Created', path.join(__dirname, `src`, `html_index.js`));
								// Копируем шрифт
								let ftd, ftf;
								if(ftf = fs.readFileSync(path.join(__dirname, `src`, `fonts`, `digit-cl.ttf`))) {
									fs.writeFileSync(path.join(__dirname, `dest`, `digit-cl.ttf`), ftf)
									log('File Copied', path.join(__dirname, `dest`, `digit-cl.ttf`));
								}
								// Рендер pug в html
								log('File Compiled', path.join(__dirname, `src`, `index.pug`));
								const html = pug.renderFile(path.join(__dirname, `src`, `index.pug`), html_options);
								// Сохраняем html в файл
								fs.writeFileSync(path.join(__dirname, `dest`, `index.html`), `<!--\n${LICENSE}-->\n${html}`, {encoding: `utf8`});
								log('File Created', path.join(__dirname, `dest`, `index.html`));
								// Удаляем скомпилированный js
								fs.existsSync(path.join(__dirname, `src`, `html_index.js`)) && (
									fs.unlinkSync(path.join(__dirname, `src`, `html_index.js`)),
									log('File Deleted', path.join(__dirname, `src`, `html_index.js`))
								);
								// Удаляем скомпилированный css
								fs.existsSync(path.join(__dirname, `src`, `html_index.css`)) && (
									fs.unlinkSync(path.join(__dirname, `src`, `html_index.css`)),
									log('File Deleted', path.join(__dirname, `src`, `html_index.css`))
								);
								// Упаковываем содержимое dest в ZIP
								log('Packing Files', path.join(__dirname, `dest`));
								const zip = new ZipLib.Zip();
								zip.addFolder(path.join(__dirname, `dest`));
								zip.archive(path.join(__dirname, `${pkg.name}.zip`)).then(
									function () {
										log(`File Created`, path.join(__dirname, `${pkg.name}.zip`));
										// Удаляем dest
										deleteFolder(path.join(__dirname, `dest`)).then((result) => {
											log('Folder Deleted', result);
											time_2 = new Date().getTime();
											let tm = String((time_2 - time_1) / 1000) + ` seconds`;
											console.log(` `);
											log(`BUILD TIME`, tm, true);
											info(`DONE `);
										}).catch((error) => {
											log('ERROR', error);
										});
									},
									function (error) {
										log('ERROR', error);
									}
								);
							});
					});
			},
			function(error) {
				log('ERROR', error);
			}
		);
}).catch((error) => {
	log('ERROR', error);
});
