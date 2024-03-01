// matter.js

// Set up the canvas
const canvas = document.createElement("canvas");
document.body.appendChild(canvas);
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const context = canvas.getContext("2d");

const objects = [];
let stars = [];
let comets = [];
let lastClickedPlanet = null;

setupEventListeners();

// allows user slider selection to work
let gravity = 0.00001; // Universal Gravitational Constant, adjust as needed for simulation scale
scalar = 20;
window.addEventListener("resize", function () {
  canvas.width = Math.min(window.innerWidth, 1920);
  canvas.height = Math.min(window.innerHeight, 1080);
  generateStars(10000);
});

// zoom and scroll
let scale = 1;
const zoomSensitivity = 0.1;
let pan = { x: 0, y: 0 };
let dragStart = { x: 0, y: 0 };
let isDragging = false;

// balls balls balls
class PhysicsObject {
  constructor(x, y, radius, mass, color, isStationary, name, textColor) {
    this.x = x; // location x and y
    this.y = y;
    this.radius = radius;
    this.mass = mass;
    this.color = color;
    this.isStationary = isStationary;
    this.name = name;
    this.isHovered = false;
    this.positions = [];
    this.velocity = { x: 0, y: 0 };
    this.acceleration = { x: 0, y: 0.2 }; // Simulating gravity
  }

  update() {
    if (!this.isStationary) {
      // Reset acceleration to 0 at the start of each update
      this.acceleration.x = 0;
      this.acceleration.y = 0;

      // Calculate gravitational force from every other object
      objects.forEach((other) => {
        if (this !== other) {
          const dx = other.x - this.x;
          const dy = other.y - this.y;
          const distanceSquared = dx * dx + dy * dy;

          const forceDirection = Math.atan2(dy, dx);
          // Use the scaled gravitational constant here
          const forceMagnitude =
            (gravity * this.mass * other.mass) / distanceSquared;
          const forceX = Math.cos(forceDirection) * forceMagnitude;
          const forceY = Math.sin(forceDirection) * forceMagnitude;

          // Apply the gravitational force to acceleration
          this.acceleration.x += forceX / this.mass;
          this.acceleration.y += forceY / this.mass;
        }
      });

      // Update velocity and position based on the accumulated acceleration
      this.velocity.x += this.acceleration.x;
      this.velocity.y += this.acceleration.y;
      this.x += this.velocity.x;
      this.y += this.velocity.y;

      if (!this.isStationary) {
        this.positions.push({ x: this.x, y: this.y });
        // Limit the number of stored positions to avoid memory issues
        if (this.positions.length > 50000) {
          this.positions.shift(); // Remove the oldest position
        }
      }
    }
  }

  draw(context) {
    context.beginPath();

    this.positions.forEach((pos, index) => {
      if (index === 0) {
        context.moveTo(pos.x, pos.y);
      } else {
        context.lineTo(pos.x, pos.y);
      }
    });
    context.strokeStyle = this.color; // Use the object's color for the trail
    context.stroke();

    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    context.fillStyle = this.color; // Text color
    context.fill();

    context.font = `${Math.sqrt(this.radius)}px Arial`;
    context.textAlign = "center";
    // context.fillText(
    //   `Mass: ${Number(this.mass).toPrecision(2)}`,
    //   this.x,
    //   this.y + this.radius + 20
    // );

    context.fillStyle = "white";
    context.fillText(
      this.name,
      this.x,
      this.y + Math.sqrt(this.radius) * 3 + this.radius / 2
    );
  }
}

function initializeSolarSystem() {
  objects.length = 0; // Clear existing objects

  // Create the Sun
  const sunRadius = 695508 / 100000; // Scale size, no effect on physics
  const sunMass = 1988500 / scalar; // Scale mass
  const sunX = canvas.width / 2;
  const sunY = canvas.height / 2;
  objects.push(
    new PhysicsObject(
      sunX,
      sunY,
      sunRadius,
      sunMass,
      "yellow",
      true,
      "Sun",
      "black"
    )
  );

  // Create planets

  // distance from sun in 10^6 km
  const planetDistances = [
    57.9, 108.2, 149.6, 228, 778.5, 1432, 2867, 4515, 5906.4,
  ];
  // radius in km
  const planetRadiuses = [
    2439.5, 6052, 6378, 3396, 71492, 60268, 25559, 24764, 1188,
  ];
  // mass in 10^24 kg
  const planetMasses = [0.33, 4.87, 5.97, 0.642, 1898, 568, 86.8, 102, 0.013];
  const planetColors = [
    "lightgray",
    "pink",
    "lightblue",
    "red",
    "#FF7000",
    "#FF9E00",
    "#00FFD8",
    "#0023FF",
    "#999",
  ];
  const planetNames = [
    "Mercury",
    "Venus",
    "Earth",
    "Mars",
    "Jupiter",
    "Saturn",
    "Uranus",
    "Neptune",
    "Pluto",
  ];

  for (let i = 0; i < 9; i++) {
    const distance = planetDistances[i] / Math.sqrt(scalar); // Distance from the Sun
    const planetRadius = planetRadiuses[i] / 1500; // Varying sizes
    const planetMass = planetMasses[i] / scalar; // Mass based on size (density)
    const planetColor = planetColors[i];
    const angle = Math.random() * 2 * Math.PI;
    const x = sunX + distance * Math.cos(angle);
    const y = sunY + distance * Math.sin(angle);

    // Initial velocity for orbit
    const velocityMagnitude = Math.sqrt((gravity * sunMass) / distance); // Simplified orbital velocity
    const planet = new PhysicsObject(
      x,
      y,
      planetRadius,
      planetMass,
      planetColor,
      false,
      planetNames[i],
      "white"
    );
    planet.velocity.x = velocityMagnitude * -Math.sin(angle);
    planet.velocity.y = velocityMagnitude * Math.cos(angle);

    objects.push(planet);
  }
}

class Star {
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.brightness = Math.random();
  }

  update() {
    // Randomly change the brightness to simulate twinkling
    this.brightness = 0.5 + Math.random() * 0.5;
  }

  draw(context) {
    context.beginPath();
    context.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
    context.fillStyle = `rgba(255, 255, 255, ${this.brightness})`; // Use brightness for alpha
    context.fill();
  }
}
let maxViewWidth = canvas.width * 8;
let maxViewHeight = canvas.height * 8;

function generateStars(count) {
  stars = [];
  for (let i = 0; i < count; i++) {
    const x = Math.random() * maxViewWidth - maxViewWidth / 2;
    const y = Math.random() * maxViewHeight - maxViewHeight / 2;
    const size = Math.random() * 2; // Size range between 0 and 2 pixels
    stars.push(new Star(x, y, size));
  }
}

class Comet {
  constructor() {
    this.reset();
  }

  reset() {
    // Initialize the comet at a random position on the canvas edge
    if (Math.random() < 0.5) {
      this.x = Math.random() < 0.5 ? 0 : maxViewWidth - maxViewWidth / 2; // Start from left or right edge
      this.y = Math.random() * maxViewWidth - maxViewWidth / 2;
    } else {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() < 0.5 ? 0 : canvas.height; // Start from top or bottom edge
    }

    // Assign a random velocity
    this.velocity = {
      x: (Math.random() - 0.5) * 20,
      y: (Math.random() - 0.5) * 20,
    };

    // Trail positions
    this.trailLength = 6;
    this.trail = [];

    this.lifespan = Math.random() * 100 + 20;
  }

  update() {
    // Move comet
    this.x += this.velocity.x;
    this.y += this.velocity.y;

    // Add current position to the trail
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > this.trailLength) {
      this.trail.shift(); // Remove the oldest position
    }

    this.lifespan--;

    // Reset comet if it goes off canvas
    if (
      this.lifespan <= 0 ||
      this.x < 0 ||
      this.x > canvas.width ||
      this.y < 0 ||
      this.y > canvas.height
    ) {
      this.reset();
    }
  }

  draw(context) {
    // Draw comet trail
    for (let i = 0; i < this.trail.length; i++) {
      context.beginPath();
      context.arc(
        this.trail[i].x,
        this.trail[i].y,
        1 * (1 - i / this.trail.length),
        0,
        1 * Math.PI
      );
      context.fillStyle = `rgba(255, 255, 255, ${1 - i / this.trail.length})`; // Gradually fade
      context.fill();
    }

    // Draw comet head
    context.beginPath();
    context.arc(this.x, this.y, 1, 0, 2 * Math.PI);
    context.fillStyle = "rgba(255, 250, 220)";
    context.fill();
  }
}
const numberOfComets = 3;

function initializeComets() {
  for (let i = 0; i < numberOfComets; i++) {
    comets.push(new Comet());
  }
}

function updateAndDrawComets(context) {
  comets.forEach((comet) => {
    comet.update();
    comet.draw(context);
  });
}

// for planet information

function displayPlanetModal(planetName) {
  const planetInfoMap = {
    Sun: "The solar systems largest nuclear reactor, the Sun is made up of predominantly hydrogen and helium. If the sun in this model were scaled by the same factor as the planets, it would go past the orbit of Saturn. Click the Scale Sun button and see for yourself!",
    Mercury:
      "Mercury, the closest planet to the Sun, is named after the swift messenger god. Good job successfully clicking on this! The surface color is gray, resembling the Moon, with surface temperatures ranging from -173 to 427°C.",
    Venus:
      "Venus is about 108.2 million km away from the Sun. Known for its bright, yellowish-white color, Venus experiences extreme greenhouse effects, a result of it's C02 rich atmosphere, with surface temperatures hovering around 465°C.",
    Earth:
      "Earth, our home planet. With an average surface temperature of 14°C, it is the only planet in the solar system that can sustain life as we know it. Also, the only planet known to support Instagram Reels. Better take good care of it!",
    Mars: "Mars, known as the Red Planet, is 227.9 million km from the Sun, and was once the home of famous actor Matt Damon. Its reddish appearance comes from the plentiful iron oxide dust. Temperatures on Mars can vary widely, averaging around -60°C.",
    Jupiter:
      "Jupiter, the largest planet in our solar system, has a mass of 1,898 x 10^24 kg (or 17,434 trillion blue whales for you Americans) and is 778.5 million km from the Sun. Its striking appearance with bands of white, red, orange, brown, and yellow are due to its gaseous nature. The average temperature is about -145°C.",
    Saturn:
      "Saturn, famous for its beautiful ring system, is about 1.434 billion km away from the Sun (Just a tad closer than you've ever been to feeling true love). Its pale yellow color is due to ammonia crystals in its atmosphere. Temperatures are cold, averaging -178°C.",
    Uranus:
      "Uranus, the brunt of many a joke, is distinguished by its blue-green color, occuring due to methane in its atmosphere. It is 2.871 billion km from the Sun, and has an unusual tilt, essentially orbiting the Sun on its side, which scientists attribute to a collision with an Earth-sized object a very long time ago. Average temperatures are around -224°C.",
    Neptune:
      "Neptune is known for its vivid blue color, and holds the record for the fastest winds in the solar system. Scientists suspect that it rains diamonds 8,000km under the 'surface'. It is 4.495 billion km from the Sun and is the coldest of the planets, with temperatures dipping to -214°C. Brr.",
    Pluto:
      "If you somehow clicked on this, congrats. Pluto, arguably the most beloved object in the Solar system, is 5.906 billion km from the Sun. Its color varies from white to charcoal black, with surface temperatures averaging -229°C. Pluto was reclassified as a dwarf planet in 2006, and has a heart-shaped glacier to show it loves us too.",
  };

  const info = planetInfoMap[planetName];
  if (info) {
    document.getElementById("planetName").innerText = planetName;
    document.getElementById("planetInfo").innerText = info;
    document.getElementById("planetModal").style.display = "block";
  } else {
    console.log("No information available for " + planetName);
  }
}

function drawFixedText(context) {
  context.font = "36px Arial";
  context.fillStyle = "white"; // Choose a text color that stands out
  context.textAlign = "center"; // Align text to be in the center
  context.fillText("Scale Solar System by Dalí", canvas.width / 2, 30); // Position text in the middle at the top

  context.font = "18px Arial";
  context.fillStyle = "white";
  context.textAlign = "center";
  context.fillText(
    `One Earth year passes every 40 seconds`,
    canvas.width / 2,
    60
  );

  context.font = "18px Arial";
  context.fillStyle = "white";
  context.textAlign = "center";
  context.fillText(`Try to find Pluto!`, canvas.width / 2, 85);
}

function animate() {
  requestAnimationFrame(animate);
  context.clearRect(0, 0, canvas.width, canvas.height);

  // Apply transformations for zoom and pan
  context.save();
  context.translate(pan.x, pan.y);
  context.scale(scale, scale);

  // Draw stars
  stars.forEach((star) => {
    star.update();
    star.draw(context);
  });

  // Draw comets
  comets.forEach((comet) => {
    comet.update();
    comet.draw(context);
  });

  // Draw physics objects (planets, etc.)
  objects.forEach((object) => {
    object.update();
    object.draw(context);
  });

  // Restore the context to avoid affecting other drawing operations
  context.restore();

  drawFixedText(context);
}

function initialize() {
  // Initialize solar system, stars, and any other initial setup
  initializeSolarSystem();
  generateStars(8000); // Adjust count based on your needs
  initializeComets();
  animate();
}

function setupEventListeners() {
  canvas.addEventListener("click", function (event) {
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / scale - pan.x / scale;
    const y = (event.clientY - rect.top) / scale - pan.y / scale;

    const modal = document.getElementById("planetModal");
    if (
      modal.style.display === "block" &&
      !event.target.closest("#planetModal")
    ) {
      // If it did and the modal is open, close the modal
      if (lastClickedPlanet) {
        lastClickedPlanet.radius *= 5 / 6;
        lastClickedPlanet = null;
      }
      modal.style.display = "none";
    } else {
      checkPlanetClick(x, y);
    }
  });

  function checkPlanetClick(x, y) {
    objects.forEach((object) => {
      const distance = Math.sqrt((x - object.x) ** 2 + (y - object.y) ** 2);
      if (distance < object.radius) {
        // The planet has been clicked
        object.radius *= 1.2; // Enlarge the planet by 50%
        lastClickedPlanet = object;
        displayPlanetModal(object.name); // Open information page based on the planet name
      }
    });
  }

  // Close the modal when the user clicks on <span> (x)
  document.getElementById("closeModal").onclick = function () {
    if (lastClickedPlanet) {
      lastClickedPlanet.radius *= 5 / 6;
      lastClickedPlanet = null;
    }
    document.getElementById("planetModal").style.display = "none";
  };

  canvas.addEventListener("mousemove", function (event) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = (event.clientX - rect.left - pan.x) / scale;
    const mouseY = (event.clientY - rect.top - pan.y) / scale;
    objects.forEach((object) => {
      const distance = Math.sqrt(
        (mouseX - object.x) ** 2 + (mouseY - object.y) ** 2
      );
      if (distance < object.radius && !object.isHovered) {
        object.originalRadius = object.originalRadius || object.radius;
        if (object.radius > 10) {
          object.radius = object.originalRadius * 1.2; // Increase radius by 20% on hover
        } else if (object.radius > 5) {
          object.radius = object.originalRadius * 1.5;
        } else if (object.radius > 1) {
          object.radius = object.originalRadius * 1.8;
        } else {
          object.radius = object.originalRadius * 2;
        }
        object.isHovered = true;
      } else if (distance >= object.radius && object.isHovered) {
        object.radius = object.originalRadius; // Restore original radius
        object.isHovered = false;
      }
    });

    if (isDragging) {
      pan.x = event.clientX - dragStart.x;
      pan.y = event.clientY - dragStart.y;
    }
  });
  canvas.addEventListener("wheel", function (event) {
    event.preventDefault();

    // Calculate the position of the mouse relative to the center of the canvas
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // Calculate the position of the mouse in the world (considering current pan and scale)
    const worldMouseX = (mouseX - pan.x) / scale;
    const worldMouseY = (mouseY - pan.y) / scale;

    // Determine the direction and amount to zoom
    const zoomIntensity = 0.1;
    const wheel = event.deltaY < 0 ? 1 : -1;
    const zoomFactor = Math.exp(wheel * zoomIntensity);

    // Apply the zoom
    scale *= zoomFactor;

    // Limit the scale to prevent zooming too far in or out
    scale = Math.max(0.1, Math.min(scale, 10));

    // Adjust pan to keep the mouse position stable in the world
    pan.x = mouseX - worldMouseX * scale;
    pan.y = mouseY - worldMouseY * scale;
  });

  canvas.addEventListener("mousedown", function (event) {
    isDragging = true;
    dragStart.x = event.clientX - pan.x;
    dragStart.y = event.clientY - pan.y;
  });

  window.addEventListener("mousemove", function (event) {});

  window.addEventListener("mouseup", function () {
    isDragging = false;
  });

  window.addEventListener("resize", function () {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
}

let sunScaled = false; // Variable to track the current state of sun scaling

document
  .getElementById("scaleSunButton")
  .addEventListener("click", function () {
    // Toggle the sun scaling state
    sunScaled = !sunScaled;

    // Call the function to scale the sun based on the current state
    scaleSun();
  });

function scaleSun() {
  if (sunScaled) {
    // Update the sun's radius to match the scaling of the planets
    const sunRadius = 695508 / 1500; // Update the sun's radius to match the scaling of the planets

    // Find the sun object in the objects array and update its radius
    objects.forEach((object) => {
      if (object.name === "Sun") {
        object.radius = sunRadius;
      }
    });
  } else {
    // Set the sun's radius back to its original value
    const sunRadius = 695508 / 100000; // Original sun radius

    // Find the sun object in the objects array and update its radius
    objects.forEach((object) => {
      if (object.name === "Sun") {
        object.radius = sunRadius;
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", initialize);
