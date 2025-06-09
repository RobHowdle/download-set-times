// countdown.js - Manage countdown timer.

// Initialize variables
let Days, Hours, Minutes;
let DaysMobile, HoursMobile, MinutesMobile;
let DaysDesktop, HoursDesktop, MinutesDesktop;

// Set target date
// For testing: set to 1 minute from now
// const targetDate = new Date(Date.now() + 60 * 1000).getTime();

let targetDate;
const festivalStart = new Date("2025-06-12T00:00:00").getTime();
const festivalEnd = new Date("2025-06-16T00:00:00").getTime();
const nextDownloadStart = new Date("2026-06-10T00:00:00").getTime();

function getPhaseAndTarget() {
	const now = Date.now();
	if (now < festivalStart) {
		return {phase: "countdown25", target: festivalStart};
	} else if (now >= festivalStart && now < festivalEnd) {
		return {phase: "pit", target: null};
	} else {
		return {phase: "countdown26", target: nextDownloadStart};
	}
}

let phaseAndTarget = getPhaseAndTarget();
targetDate = phaseAndTarget.target;

// Function to initialize all DOM elements
function initializeElements() {
	// Constants - Mobile elements (old IDs)
	Days = document.getElementById("days");
	Hours = document.getElementById("hours");
	Minutes = document.getElementById("minutes");

	// Constants - Mobile elements (new IDs)
	DaysMobile = document.getElementById("days-mobile");
	HoursMobile = document.getElementById("hours-mobile");
	MinutesMobile = document.getElementById("minutes-mobile");

	// Constants - Desktop elements
	DaysDesktop = document.getElementById("days-desktop");
	HoursDesktop = document.getElementById("hours-desktop");
	MinutesDesktop = document.getElementById("minutes-desktop");
}

// Main Timer Function
export function timer() {
	// Re-evaluate phase and target date in case we've crossed a threshold
	phaseAndTarget = getPhaseAndTarget();
	targetDate = phaseAndTarget.target;
	const currentDate = new Date().getTime();
	const distance = targetDate ? targetDate - currentDate : 0;

	// PHASE 1: Countdown to 12th June 2025
	if (phaseAndTarget.phase === "countdown25") {
		const days = Math.floor(distance / 1000 / 60 / 60 / 24);
		const hours = Math.floor(distance / 1000 / 60 / 60) % 24;
		const minutes = Math.floor(distance / 1000 / 60) % 60;

		// Update mobile elements (old IDs)
		if (Days) Days.innerHTML = days;
		if (Hours) Hours.innerHTML = hours;
		if (Minutes) Minutes.innerHTML = minutes;

		// Update mobile elements (new IDs)
		if (DaysMobile) DaysMobile.innerHTML = days;
		if (HoursMobile) HoursMobile.innerHTML = hours;
		if (MinutesMobile) MinutesMobile.innerHTML = minutes;

		// Update desktop elements
		if (DaysDesktop) DaysDesktop.innerHTML = days;
		if (HoursDesktop) HoursDesktop.innerHTML = hours;
		if (MinutesDesktop) MinutesDesktop.innerHTML = minutes;

		// Show countdown if hidden
		const timerUnits = document.querySelectorAll(".timer-unit");
		timerUnits.forEach((unit) => (unit.style.display = ""));

		// Remove message and confetti if present
		const msg = document.getElementById("download-message");
		if (msg) msg.remove();
		const confetti = document.getElementById("confetti-canvas");
		if (confetti) confetti.remove();
		return;
	}

	// PHASE 2: Festival is on (12th-16th June 2025) - Show message
	if (phaseAndTarget.phase === "pit") {
		// Hide all countdown numbers and labels
		const timerUnits = document.querySelectorAll(".timer-unit");
		timerUnits.forEach((unit) => (unit.style.display = "none"));

		// Show the message only once
		if (!document.getElementById("download-message")) {
			let countdownContainer = document.querySelector(
				".countdown, #countdown, .timer, .timer-container"
			);
			if (!countdownContainer) {
				countdownContainer =
					document.querySelector(".main-nav") || document.body;
			}
			const oldMsg =
				countdownContainer.querySelector("#download-message");
			if (oldMsg) oldMsg.remove();

			const message = document.createElement("div");
			message.id = "download-message";
			message.style.position = "absolute";
			message.style.top = 0;
			message.style.left = 0;
			message.style.width = "100%";
			message.style.height = "100%";
			message.style.display = "flex";
			message.style.alignItems = "center";
			message.style.justifyContent = "center";
			message.style.pointerEvents = "none";
			message.style.zIndex = 10;
			message.innerHTML = `
				<span style="
					display: inline-block;
					font-size: 2.2rem;
					font-weight: 900;
					letter-spacing: 0.05em;
					color: #fff;
					text-shadow:
						0 0 16px #00ffe6,
						0 0 32px #00ffe6,
						0 2px 8px #000,
						0 0 2px #00ffe6;
					font-family: 'Oswald', 'Impact', 'Arial Black', 'sans-serif';
					padding: 0.5em 0;
				">See You In The Pit!</span>
			`;
			if (getComputedStyle(countdownContainer).position === "static") {
				countdownContainer.style.position = "relative";
			}
			countdownContainer.appendChild(message);

			// Confetti animation (rock/metal SVG icons)
			if (!document.getElementById("confetti-canvas")) {
				const confettiCanvas = document.createElement("canvas");
				confettiCanvas.id = "confetti-canvas";
				confettiCanvas.style.position = "fixed";
				confettiCanvas.style.top = 0;
				confettiCanvas.style.left = 0;
				confettiCanvas.style.width = "100vw";
				confettiCanvas.style.height = "100vh";
				confettiCanvas.style.pointerEvents = "none";
				confettiCanvas.style.zIndex = 9999;
				document.body.appendChild(confettiCanvas);
				startRockConfetti(confettiCanvas);
			}
		}
		return;
	}

	// PHASE 3: Countdown to 10th June 2026
	if (phaseAndTarget.phase === "countdown26") {
		const days = Math.floor(distance / 1000 / 60 / 60 / 24);
		const hours = Math.floor(distance / 1000 / 60 / 60) % 24;
		const minutes = Math.floor(distance / 1000 / 60) % 60;

		// Update mobile elements (old IDs)
		if (Days) Days.innerHTML = days;
		if (Hours) Hours.innerHTML = hours;
		if (Minutes) Minutes.innerHTML = minutes;

		// Update mobile elements (new IDs)
		if (DaysMobile) DaysMobile.innerHTML = days;
		if (HoursMobile) HoursMobile.innerHTML = hours;
		if (MinutesMobile) MinutesMobile.innerHTML = minutes;

		// Update desktop elements
		if (DaysDesktop) DaysDesktop.innerHTML = days;
		if (HoursDesktop) HoursDesktop.innerHTML = hours;
		if (MinutesDesktop) MinutesDesktop.innerHTML = minutes;

		// Show countdown if hidden
		const timerUnits = document.querySelectorAll(".timer-unit");
		timerUnits.forEach((unit) => (unit.style.display = ""));

		// Remove message and confetti if present
		const msg = document.getElementById("download-message");
		if (msg) msg.remove();
		const confetti = document.getElementById("confetti-canvas");
		if (confetti) confetti.remove();
		return;
	}
}

// --- Rock/Metal Confetti ---
function startRockConfetti(canvas) {
	const ctx = canvas.getContext("2d");
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	const confettiCount = 40;
	const icons = [
		// SVG paths for skull, lightning, star, metal hand, guitar pick
		{
			svg: `<svg width='32' height='32' viewBox='0 0 32 32'><path fill='#fff' stroke='#222' stroke-width='2' d='M16 2c-7 0-12 5-12 12 0 7 5 12 12 12s12-5 12-12c0-7-5-12-12-12zm0 20c-4 0-8-4-8-8s4-8 8-8 8 4 8 8-4 8-8 8zm-3-7c0 .6-.4 1-1 1s-1-.4-1-1 .4-1 1-1 1 .4 1 1zm8 0c0 .6-.4 1-1 1s-1-.4-1-1 .4-1 1-1 1 .4 1 1zm-7 4c.5 1.5 2.5 2 3 2s2.5-.5 3-2' /></svg>`,
			color: "#fff",
		},
		{
			svg: `<svg width='32' height='32' viewBox='0 0 32 32'><polygon points='16,2 20,18 12,18 16,2' fill='#ffe600' stroke='#b8860b' stroke-width='2'/><polygon points='16,30 20,14 12,14 16,30' fill='#ffe600' stroke='#b8860b' stroke-width='2'/></svg>`,
			color: "#ffe600",
		},
		{
			svg: `<svg width='32' height='32' viewBox='0 0 32 32'><polygon points='16,2 20,12 31,12 22,19 25,30 16,23 7,30 10,19 1,12 12,12' fill='#fff' stroke='#b8860b' stroke-width='2'/></svg>`,
			color: "#fff",
		},
		{
			svg: `<svg width='32' height='32' viewBox='0 0 32 32'><path d='M8 24c0-4 8-4 8 0v-8c0-4 8-4 8 0v8' stroke='#fff' stroke-width='2' fill='none'/><path d='M12 24v-8c0-2 4-2 4 0v8' stroke='#b8860b' stroke-width='2' fill='none'/></svg>`,
			color: "#fff",
		},
		{
			svg: `<svg width='32' height='32' viewBox='0 0 32 32'><ellipse cx='16' cy='16' rx='12' ry='16' fill='#b8860b' stroke='#fff' stroke-width='2'/></svg>`,
			color: "#b8860b",
		},
	];
	const palette = [
		"#fff",
		"#b8860b",
		"#e6e6e6",
		"#222",
		"#ff1744",
		"#00ffc3",
	];
	const confetti = [];
	for (let i = 0; i < confettiCount; i++) {
		const icon = icons[Math.floor(Math.random() * icons.length)];
		confetti.push({
			x: Math.random() * canvas.width,
			y: Math.random() * canvas.height - canvas.height,
			size: Math.random() * 24 + 24,
			vy: Math.random() * 2 + 2,
			vx: Math.random() * 2 - 1,
			rot: Math.random() * Math.PI * 2,
			rotSpeed: (Math.random() - 0.5) * 0.04,
			icon,
			color: palette[Math.floor(Math.random() * palette.length)],
		});
	}
	function draw() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		confetti.forEach((c) => {
			ctx.save();
			ctx.translate(c.x, c.y);
			ctx.rotate(c.rot);
			// Draw SVG icon as image
			const svg = c.icon.svg.replace(/#fff|#b8860b/g, c.color);
			const img = new window.Image();
			img.src = "data:image/svg+xml;utf8," + encodeURIComponent(svg);
			ctx.globalAlpha = 0.92;
			ctx.drawImage(img, -c.size / 2, -c.size / 2, c.size, c.size);
			ctx.restore();
		});
		update();
		requestAnimationFrame(draw);
	}
	function update() {
		confetti.forEach((c) => {
			c.y += c.vy;
			c.x += c.vx;
			c.rot += c.rotSpeed;
			if (c.y > canvas.height + 40) {
				c.x = Math.random() * canvas.width;
				c.y = -40;
				c.vy = Math.random() * 2 + 2;
				c.vx = Math.random() * 2 - 1;
				c.rot = Math.random() * Math.PI * 2;
				c.icon = icons[Math.floor(Math.random() * icons.length)];
				c.color = palette[Math.floor(Math.random() * palette.length)];
				c.size = Math.random() * 24 + 24;
			}
		});
	}
	draw();
	window.addEventListener("resize", () => {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
	});
}

// Initialize the countdown when navigation is ready
function initializeCountdown() {
	// Initialize DOM elements
	initializeElements();

	// Run the timer once immediately
	timer();

	// Then set interval to update every second
	setInterval(timer, 1000);
}

// Listen for navigation loaded event
document.addEventListener("navigationLoaded", initializeCountdown);

// Also initialize on DOM content loaded as a fallback
document.addEventListener("DOMContentLoaded", function () {
	// Small delay to ensure navigation component has time to render
	setTimeout(initializeElements, 500);

	// Start timer
	timer();

	// Set interval to update every second if not already done
	if (!window.countdownInterval) {
		window.countdownInterval = setInterval(timer, 1000);
	}
});
