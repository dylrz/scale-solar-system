let isDragging = false;
let draggedObject = null;
let dragOffsetX = 0;
let dragOffsetY = 0;

canvas.addEventListener("mousedown", function (e) {
  const mouseX = e.clientX - canvas.getBoundingClientRect().left;
  const mouseY = e.clientY - canvas.getBoundingClientRect().top;
  for (let i = 0; i < objects.length; i++) {
    const obj = objects[i];
    const distance = Math.sqrt((mouseX - obj.x) ** 2 + (mouseY - obj.y) ** 2);
    if (distance < obj.radius) {
      isDragging = true;
      draggedObject = obj;
      dragOffsetX = obj.x - mouseX;
      dragOffsetY = obj.y - mouseY;
      break;
    }
  }
});

canvas.addEventListener("mousemove", function (e) {
  if (isDragging && draggedObject) {
    const mouseX = e.clientX - canvas.getBoundingClientRect().left;
    const mouseY = e.clientY - canvas.getBoundingClientRect().top;
    draggedObject.x = mouseX + dragOffsetX;
    draggedObject.y = mouseY + dragOffsetY;
  }
});

canvas.addEventListener("mouseup", function () {
  isDragging = false;
  draggedObject = null;
});
