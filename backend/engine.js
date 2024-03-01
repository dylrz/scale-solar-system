// engine.js
document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.createElement("canvas");
  canvas.width = 800;
  canvas.height = 600;
  document.body.appendChild(canvas);

  const context = canvas.getContext("2d");
  const gravityEarth = 9.81; // Earth's gravity in m/s^2, adjust for other planets
  let projectile = {
    x: 50,
    y: canvas.height - 50, // Start near the bottom
    velocityX: 10, // Horizontal velocity
    velocityY: -20, // Vertical velocity, negative to simulate shooting upwards
    radius: 5,
  };

  function updateProjectile() {
    // Update position based on velocity
    projectile.x += projectile.velocityX;
    projectile.y += projectile.velocityY;

    // Apply gravity effect
    projectile.velocityY += gravityEarth * 0.01; // Adjust gravity effect here

    // Bounce off the ground
    if (projectile.y > canvas.height - projectile.radius) {
      projectile.y = canvas.height - projectile.radius;
      projectile.velocityY *= -0.9; // Simulate bounce with energy loss
    }
  }

  function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas

    // Draw projectile
    context.beginPath();
    context.arc(
      projectile.x,
      projectile.y,
      projectile.radius,
      0,
      Math.PI * 2,
      true
    );
    context.fill();

    updateProjectile();
    requestAnimationFrame(draw); // Continue the loop
  }

  draw(); // Start the simulation
});
