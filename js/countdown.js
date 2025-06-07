// countdown.js - Manage countdown timer.

// Initialize variables
let Days, Hours, Minutes;
let DaysMobile, HoursMobile, MinutesMobile;
let DaysDesktop, HoursDesktop, MinutesDesktop;

// Set target date
const targetDate = new Date("June 13 2025 12:00:00").getTime();

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
	const currentDate = new Date().getTime();
	const distance = targetDate - currentDate;

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

	if (distance < 0) {
		// Mobile elements (old IDs)
		if (Days) Days.innerHTML = "00";
		if (Hours) Hours.innerHTML = "00";
		if (Minutes) Minutes.innerHTML = "00";

		// Mobile elements (new IDs)
		if (DaysMobile) DaysMobile.innerHTML = "00";
		if (HoursMobile) HoursMobile.innerHTML = "00";
		if (MinutesMobile) MinutesMobile.innerHTML = "00";

		// Desktop elements
		if (DaysDesktop) DaysDesktop.innerHTML = "00";
		if (HoursDesktop) HoursDesktop.innerHTML = "00";
		if (MinutesDesktop) MinutesDesktop.innerHTML = "00";
	}
}

// Initialize the countdown when navigation is ready
function initializeCountdown() {
	// Initialize DOM elements
	initializeElements();

	// Run the timer once immediately
	timer();

	// Then set interval to update every second
	setInterval(timer, 1000);

	console.log("Countdown initialized successfully");
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
