// matter.js

// allows user slider selection to work
let gravity = 0.0001; // Universal Gravitational Constant, adjust as needed for simulation scale
scalar = 20;
window.addEventListener("resize", function () {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

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

    context.font = "12px Arial";
    context.textAlign = "center";
    // context.fillText(
    //   `Mass: ${Number(this.mass).toPrecision(2)}`,
    //   this.x,
    //   this.y + this.radius + 20
    // );

    context.fillStyle = "white";
    context.fillText(this.name, this.x, this.y + 20);

    context.font = "28px Arial";
    context.fillStyle = "white"; // Choose a text color that stands out
    context.textAlign = "center"; // Align text to be in the center
    context.fillText("Scale Solar System by Dali", canvas.width / 2, 30); // Position text in the middle at the top

    context.font = "16px Arial";
    context.fillStyle = "white";
    context.textAlign = "center";
    context.fillText("(sun not to scale)", canvas.width / 2, 50);
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
      "sun",
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
    "orange",
    "yellow",
    "purple",
    "darkblue",
    "white",
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
    const planetRadius = planetRadiuses[i] / 1000; // Varying sizes
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

// Set up the canvas
const canvas = document.createElement("canvas");
document.body.appendChild(canvas);
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const context = canvas.getContext("2d");

const objects = [];

function animate() {
  requestAnimationFrame(animate);
  context.clearRect(0, 0, canvas.width, canvas.height);

  // Update and draw stars
  stars.forEach((star) => {
    star.update();
    star.draw(context);
  });

  objects.forEach((object) => {
    object.update();
    object.draw(context);
  });
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
let stars = [];

function generateStars(count) {
  stars = [];
  for (let i = 0; i < count; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
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
      this.x = Math.random() < 0.5 ? 0 : canvas.width; // Start from left or right edge
      this.y = Math.random() * canvas.height;
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

let comets = [];
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

function animate() {
  requestAnimationFrame(animate);
  context.clearRect(0, 0, canvas.width, canvas.height);

  // Update and draw stars
  stars.forEach((star) => {
    star.update();
    star.draw(context);
  });

  // Update and draw the comet
  updateAndDrawComets(context);

  // Update and draw physics objects
  objects.forEach((object) => {
    object.update();
    object.draw(context);
  });
}

document.addEventListener("DOMContentLoaded", function () {
  generateStars(400);
  initializeSolarSystem();
  initializeComets();
  animate();
});
