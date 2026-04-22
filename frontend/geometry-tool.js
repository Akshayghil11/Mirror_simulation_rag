// Simulation parameters (in simulation units)
const scale = 60; // Increased scale for zooming in (previously 40)
let mirrorType = "concave"; // "concave" or "convex"
let focalLength = -4; // Negative for concave, positive for convex (units)
let objectPosition = -7; // Object position (units, negative means left of mirror)
let objectHeight = 2; // Object height (units)
let mirrorRadius = 2 * Math.abs(focalLength); // Radius of curvature = 2 * |focal length|

// Get canvas and context
const canvas = document.getElementById("mirrorCanvas");
const ctx = canvas.getContext("2d");

// Convert simulation coordinates to canvas coordinates
function simToCanvasX(x) {
  return canvas.width / 2 + x * scale;
}
function simToCanvasY(y) {
  return canvas.height / 2 - y * scale;
}

// Calculate image position using mirror formula: 1/f = 1/u + 1/v  => v = (f*u)/(u - f)
function calculateImagePosition(u, f) {
  // Handle the case when object is at focal point
  if (Math.abs(u - f) < 0.01) return Infinity;
  return (f * u) / (u - f);
  return parseFloat(v.toFixed(1));
}

// Determine image properties (real/virtual, magnification)
function getImageProperties(u, v, f) {
  // Handle special case: object at focal point
  if (!isFinite(v) || Math.abs(v) > 1000) return "No Image (Rays Parallel)";

  // Calculate magnification
  let m = -v / u;
  let sizeDesc =
    Math.abs(m) > 1.05
      ? "Magnified"
      : Math.abs(m) < 0.95
      ? "Diminished"
      : "Same Size";

  if (mirrorType === "concave") {
    // For concave mirror - follow reference chart
    if (v > 0) {
      // Virtual image (behind mirror)
      return "Virtual, Upright, " + sizeDesc;
    } else {
      // Real image (in front of mirror)
      return "Real, Inverted, " + sizeDesc;
    }
  } else {
    // For convex mirror - always forms virtual, upright, diminished images
    return "Virtual, Upright, Diminished";
  }
}

// Get detailed position description based on focal length (f) and center of curvature (C)
function getPositionDescription(pos, f) {
  const c = 2 * f; // Center of curvature = 2 * focal length

  if (mirrorType === "concave") {
    if (Math.abs(pos - f) < 0.1) return "At F";
    if (Math.abs(pos - c) < 0.1) return "At C";
    if (pos < f) return "Between F and Mirror";
    if (pos < c) return "Between C and F";
    return "Beyond C";
  } else {
    // For convex mirror
    if (Math.abs(Math.abs(pos) - 1000) < 100) return "At ∞";
    return "Between ∞ and Mirror";
  }
}

// Toggle mirror type
function toggleMirrorType() {
  mirrorType = mirrorType === "concave" ? "convex" : "concave";

  // Update focal length sign to match mirror type
  focalLength =
    mirrorType === "concave" ? -Math.abs(focalLength) : Math.abs(focalLength);

  // Update radius of curvature
  mirrorRadius = 2 * Math.abs(focalLength);

  // Redraw simulation
  drawSimulation();
}

// Draw the simulation
function drawSimulation() {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw principal axis (horizontal line through canvas center)
  ctx.strokeStyle = "#888";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, canvas.height / 2);
  ctx.lineTo(canvas.width, canvas.height / 2);
  ctx.stroke();

  // Draw markers along principal axis
  drawAxisMarkers();

  // Draw curved mirror
  ctx.strokeStyle = "blue";
  ctx.lineWidth = 4;

  // Calculate mirror curvature - simplified approach
  const mirrorX = simToCanvasX(0); // Mirror vertex at origin
  const centerY = simToCanvasY(0); // Center on principal axis
  const mirrorHeight = 400; // Height of mirror in pixels
  const mirrorDepth = 60; // How curved the mirror is

  // Draw mirror using quadratic curve
  ctx.beginPath();
  ctx.moveTo(mirrorX, centerY - mirrorHeight / 2); // Top of mirror
  if (mirrorType === "concave") {
    // Concave mirror curves to the right
    ctx.quadraticCurveTo(
      mirrorX + mirrorDepth,
      centerY,
      mirrorX,
      centerY + mirrorHeight / 2
    );
  } else {
    // Convex mirror curves to the left
    ctx.quadraticCurveTo(
      mirrorX - mirrorDepth,
      centerY,
      mirrorX,
      centerY + mirrorHeight / 2
    );
  }
  ctx.stroke();

  // Draw focal point
  ctx.fillStyle = "purple";
  ctx.beginPath();
  ctx.arc(simToCanvasX(focalLength), simToCanvasY(0), 5, 0, 2 * Math.PI);
  ctx.fill();
  ctx.fillText("F", simToCanvasX(focalLength) - 10, simToCanvasY(0) - 10);

  // Draw center of curvature (C)
  const centerOfCurvature = focalLength * 2; // C = 2F
  ctx.fillStyle = "blue";
  ctx.beginPath();
  ctx.arc(simToCanvasX(centerOfCurvature), simToCanvasY(0), 5, 0, 2 * Math.PI);
  ctx.fill();
  ctx.fillText("C", simToCanvasX(centerOfCurvature) - 10, simToCanvasY(0) - 10);

  // Draw object as a vertical arrow at objectPosition
  ctx.strokeStyle = "green";
  ctx.lineWidth = 4;
  let objX = simToCanvasX(objectPosition);
  let objYBottom = simToCanvasY(0);
  let objYTop = simToCanvasY(objectHeight);
  ctx.beginPath();
  ctx.moveTo(objX, objYBottom);
  ctx.lineTo(objX, objYTop);
  ctx.stroke();
  // Draw arrow head for object
  ctx.beginPath();
  ctx.moveTo(objX, objYTop);
  ctx.lineTo(objX - 5, objYTop + 10);
  ctx.lineTo(objX + 5, objYTop + 10);
  ctx.closePath();
  ctx.fillStyle = "green";
  ctx.fill();

  // Calculate image position
  let v = calculateImagePosition(objectPosition, focalLength);

  // Object position description
  const objPosDesc = getPositionDescription(
    Math.abs(objectPosition),
    Math.abs(focalLength)
  );

  // Image position description (if image exists)
  let imgPosDesc = "N/A";
  if (isFinite(v)) {
    imgPosDesc = getPositionDescription(Math.abs(v), Math.abs(focalLength));
  }

  window.onload = function () {
    document.getElementById("objectPosition").value = ""; // Reset Object Position
    document.getElementById("focalLength").value = ""; // Reset Focal Length
  };

  // Update info display
  document.getElementById("objectPosition").textContent =
    objectPosition.toFixed(2) + " (" + objPosDesc + ")";
  document.getElementById("focalLength").textContent = focalLength.toFixed(2);
  document.getElementById("mirrorType").textContent =
    mirrorType.charAt(0).toUpperCase() + mirrorType.slice(1);
  document.getElementById("imagePosition").textContent = isFinite(v)
    ? v.toFixed(2) + " (" + imgPosDesc + ")"
    : "Infinity";
  document.getElementById("imageProperties").textContent = getImageProperties(
    objectPosition,
    v,
    focalLength
  );

  // Draw image if finite
  if (isFinite(v) && Math.abs(v) < 1000) {
    let m = -v / objectPosition; // magnification
    let imageHeight = m * objectHeight;
    ctx.strokeStyle = "red";
    ctx.lineWidth = 4;
    let imgX = simToCanvasX(v);
    let imgYBottom = simToCanvasY(0);
    let imgYTop = simToCanvasY(imageHeight);
    ctx.beginPath();
    ctx.moveTo(imgX, imgYBottom);
    ctx.lineTo(imgX, imgYTop);
    ctx.stroke();
    // Draw arrow head for image
    ctx.beginPath();
    if (imageHeight < 0) {
      // Inverted image: arrow head pointing downward
      ctx.moveTo(imgX, imgYTop);
      ctx.lineTo(imgX - 5, imgYTop - 10);
      ctx.lineTo(imgX + 5, imgYTop - 10);
    } else {
      // Upright image: arrow head pointing upward
      ctx.moveTo(imgX, imgYTop);
      ctx.lineTo(imgX - 5, imgYTop + 10);
      ctx.lineTo(imgX + 5, imgYTop + 10);
    }
    ctx.closePath();
    ctx.fillStyle = "red";
    ctx.fill();

    // Draw ray tracing
    drawRays(objectPosition, objectHeight, v, imageHeight);
  } else if (!isFinite(v) || Math.abs(v) >= 1000) {
    // Special case: object at focal point - rays go parallel
    drawParallelRays(objectPosition, objectHeight);
  }

  // Add mirror type label on the canvas
  ctx.fillStyle = "black";
  ctx.font = "bold 20px Arial"; // Add "bold" to make the text bold
  ctx.textAlign = "center";
  ctx.fillText(
    `${mirrorType.charAt(0).toUpperCase() + mirrorType.slice(1)} Mirror`,
    canvas.width / 1.1,
    canvas.height - 550
  );
}

// Draw parallel rays when object is at focal point
function drawParallelRays(objectPos, objectHeight) {
  ctx.strokeStyle = "rgba(255, 165, 0, 0.8)"; // Orange
  ctx.lineWidth = 2;

  const objX = simToCanvasX(objectPos);
  const objY = simToCanvasY(objectHeight);
  const mirrorX = simToCanvasX(0);
  const axisY = simToCanvasY(0);

  // Draw rays from object to mirror
  ctx.beginPath();
  ctx.setLineDash([]);

  // Ray 1: to mirror center
  ctx.moveTo(objX, objY);
  ctx.lineTo(mirrorX, axisY);

  // Reflected ray parallel to principal axis
  ctx.lineTo(canvas.width, axisY);
  ctx.stroke();

  // Ray 2: parallel to principal axis
  ctx.beginPath();
  ctx.moveTo(objX, objY);
  ctx.lineTo(mirrorX, objY);

  // Calculate angle based on mirror type
  if (mirrorType === "concave") {
    // For concave, draw ray parallel to axis
    ctx.lineTo(canvas.width, objY);
  } else {
    // For convex, rays diverge
    const centerY = simToCanvasY(0);
    const slope = (objY - centerY) / (objX - mirrorX);
    const y2 = objY - slope * (canvas.width - mirrorX);
    ctx.lineTo(canvas.width, y2);
  }

  ctx.stroke();
  ctx.setLineDash([]);
}

// Draw axis markers for measurement
function drawAxisMarkers() {
  ctx.fillStyle = "#333";
  ctx.textAlign = "center";
  ctx.font = "12px Arial";

  // Draw unit markers along x-axis
  for (let x = -15; x <= 15; x++) {
    // Adjusted to show 15 units on each side
    if (x === 0) continue; // Skip the origin

    const xPos = simToCanvasX(x);
    const yPos = simToCanvasY(0);

    // Draw tick mark
    ctx.beginPath();
    ctx.moveTo(xPos, yPos - 5);
    ctx.lineTo(xPos, yPos + 5);
    ctx.stroke();

    // Label the tick
    ctx.fillText(x.toString(), xPos, yPos + 20);
  }

  // Label the origin
  ctx.font = "bold 16px Poppins"; // Set font to bold and specify size and font family
  ctx.fillText("Mirror", simToCanvasX(0), simToCanvasY(0) + 20);
}

// Draw ray tracing to show how the image is formed
function drawRays(objectPos, objectHeight, imagePos, imageHeight) {
  ctx.strokeStyle = "rgba(255, 165, 0, 0.8)"; // More opaque orange
  ctx.lineWidth = 2; // Thicker lines for better visibility

  const objX = simToCanvasX(objectPos);
  const objY = simToCanvasY(objectHeight);
  const mirrorX = simToCanvasX(0);
  const axisY = simToCanvasY(0);
  const imgX = simToCanvasX(imagePos);
  const imgY = simToCanvasY(imageHeight);
  const focalX = simToCanvasX(focalLength);
  const cX = simToCanvasX(focalLength * 2); // Center of curvature

  if (mirrorType === "concave") {
    // Ray tracing for concave mirror

    // Ray 1: Parallel to principal axis, then through focal point
    ctx.beginPath();
    ctx.setLineDash([]);
    ctx.moveTo(objX, objY);
    ctx.lineTo(mirrorX, objY);

    if (imagePos < 0) {
      // Real image
      ctx.lineTo(imgX, imgY);
    } else {
      // Virtual image - use dashed line for virtual part
      const slope = (objY - axisY) / (mirrorX - focalX);
      const interceptY = axisY - slope * focalX;
      const y2 = slope * (canvas.width - mirrorX) + objY;

      ctx.lineTo(canvas.width, y2);

      // Draw extension backward (dashed)
      ctx.setLineDash([5, 3]);
      ctx.moveTo(mirrorX, objY);
      ctx.lineTo(imgX, imgY);
    }
    ctx.stroke();

    // Ray 2: Through center of curvature (perpendicular to mirror)
    ctx.beginPath();
    ctx.setLineDash([]);

    // Draw ray from object to mirror along line to center of curvature
    const slope = (objY - axisY) / (objX - cX);
    const mirrorY = slope * (mirrorX - objX) + objY;

    ctx.moveTo(objX, objY);
    ctx.lineTo(mirrorX, mirrorY);

    // This ray reflects back along the same path
    if (imagePos < 0) {
      // Real image
      ctx.lineTo(imgX, imgY);
    } else {
      // Virtual image
      ctx.setLineDash([5, 3]);
      ctx.moveTo(mirrorX, mirrorY);
      ctx.lineTo(imgX, imgY);
    }
    ctx.stroke();

    // Ray 3: Through focal point to mirror, then parallel to axis
    ctx.beginPath();
    ctx.setLineDash([]);

    // Calculate where ray hits mirror
    const slopeToF = (objY - axisY) / (objX - focalX);
    const mirrorYF = slopeToF * (mirrorX - objX) + objY;

    ctx.moveTo(objX, objY);
    ctx.lineTo(mirrorX, mirrorYF);

    if (imagePos < 0) {
      // Real image - reflect parallel to axis
      ctx.lineTo(imgX, mirrorYF);
      ctx.lineTo(imgX, imgY);
    } else {
      // Virtual image - rays appear to diverge from behind mirror
      ctx.lineTo(canvas.width, mirrorYF); // Parallel to axis

      // Draw extension backward (dashed)
      ctx.setLineDash([5, 3]);
      ctx.moveTo(mirrorX, mirrorYF);
      ctx.lineTo(imgX, imgY);
    }
    ctx.stroke();
  } else {
    // Ray tracing for convex mirror

    // Ray 1: Parallel to principal axis, then away from focal point
    ctx.beginPath();
    ctx.setLineDash([]);
    ctx.moveTo(objX, objY);
    ctx.lineTo(mirrorX, objY);

    // Calculate reflection - appears to come from behind focal point
    const virtualRaySlope = (objY - axisY) / (mirrorX - focalX);
    const y2 = virtualRaySlope * (canvas.width - mirrorX) + objY;

    ctx.lineTo(canvas.width, y2);

    // Draw virtual ray (dashed)
    ctx.setLineDash([5, 3]);
    ctx.moveTo(mirrorX, objY);
    ctx.lineTo(imgX, imgY);
    ctx.stroke();

    // Ray 2: Toward center of curvature, reflects directly back
    ctx.beginPath();
    ctx.setLineDash([]);

    // Calculate the line pointing toward center of curvature
    const slope = (objY - axisY) / (objX - cX);
    const mirrorY = slope * (mirrorX - objX) + objY;

    ctx.moveTo(objX, objY);
    ctx.lineTo(mirrorX, mirrorY);

    // Calculate reflection
    const outAngle = Math.atan2(mirrorY - axisY, 0 - (mirrorX - mirrorX));
    const reflectedY = Math.tan(outAngle) * (canvas.width - mirrorX) + mirrorY;

    ctx.lineTo(canvas.width, reflectedY);

    // Draw virtual ray (dashed)
    ctx.setLineDash([5, 3]);
    ctx.moveTo(mirrorX, mirrorY);
    ctx.lineTo(imgX, imgY);
    ctx.stroke();

    // Ray 3: Toward focal point, reflects parallel to axis
    ctx.beginPath();
    ctx.setLineDash([]);

    // Calculate where ray would hit mirror
    const slopeToF = (objY - axisY) / (objX - focalX);
    const mirrorYF = slopeToF * (mirrorX - objX) + objY;

    ctx.moveTo(objX, objY);
    ctx.lineTo(mirrorX, mirrorYF);

    // Reflects parallel to principal axis
    ctx.lineTo(canvas.width, mirrorYF);

    // Draw virtual ray (dashed)
    ctx.setLineDash([5, 3]);
    ctx.moveTo(mirrorX, mirrorYF);
    ctx.lineTo(imgX, imgY);
    ctx.stroke();
  }

  ctx.setLineDash([]);
}

// Handle object dragging (using mouse events)
let dragging = false;
let adjustingFocus = false;

// Get mouse position accounting for responsive canvas scaling
function getMousePos(canvas, evt) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  return {
    x: (evt.clientX - rect.left) * scaleX,
    y: (evt.clientY - rect.top) * scaleY,
  };
}

canvas.addEventListener("mousedown", function (e) {
  const mousePos = getMousePos(canvas, e);
  const objX = simToCanvasX(objectPosition);
  const focalX = simToCanvasX(focalLength);

  // If click is near the object (within 15 pixels), start dragging
  if (Math.abs(mousePos.x - objX) < 15) {
    dragging = true;
  }
  // If click is near the focal point (within 15 pixels), start adjusting focal length
  else if (
    Math.abs(mousePos.x - focalX) < 15 &&
    Math.abs(mousePos.y - simToCanvasY(0)) < 15
  ) {
    adjustingFocus = true;
  }
});

canvas.addEventListener("mousemove", function (e) {
  const mousePos = getMousePos(canvas, e);

  if (dragging) {
    // Convert mouseX to simulation coordinate (x-axis) and round to 2 decimal places
    objectPosition = parseFloat(
      ((mousePos.x - canvas.width / 2) / scale).toFixed(2)
    );

    // Prevent dragging object past the mirror
    if (objectPosition >= 0) {
      objectPosition = -0.1;
    }

    drawSimulation();
  } else if (adjustingFocus) {
    // Convert mouseX to simulation coordinate (x-axis) and round to 2 decimal places
    const newFocalLength = parseFloat(
      ((mousePos.x - canvas.width / 2) / scale).toFixed(2)
    );

    // Ensure focal length is either positive (convex) or negative (concave)
    if (mirrorType === "concave") {
      // For concave, focal length must be negative
      focalLength = Math.min(newFocalLength, -0.5);
      if (focalLength >= 0) focalLength = -0.5;
    } else {
      // For convex, focal length must be positive
      focalLength = Math.max(newFocalLength, 0.5);
      if (focalLength <= 0) focalLength = 0.5;
    }

    // Update radius of curvature
    mirrorRadius = 2 * Math.abs(focalLength);

    drawSimulation();
  }
});

canvas.addEventListener("mouseup", function () {
  dragging = false;
  adjustingFocus = false;
});

canvas.addEventListener("mouseleave", function () {
  dragging = false;
  adjustingFocus = false;
});

const infoButton = document.getElementById("infoButton");
const introPopup = document.getElementById("introPopup");

infoButton.addEventListener("click", () => {
  introPopup.style.display = "flex";
  introPopup.classList.remove("closing");
});

function closeIntroPopup() {
  introPopup.classList.add("closing");
  setTimeout(() => {
    introPopup.style.display = "none";
  }, 300);
}

introPopup.addEventListener("click", function (event) {
  if (event.target === this) {
    closeIntroPopup();
  }
});
// Function to open the image popup
function openImagePopup() {
  const popup = document.getElementById("imagePopup");
  popup.style.display = "flex";
  popup.classList.remove("closing");
}

// Function to close the image popup
function closeImagePopup() {
  const popup = document.getElementById("imagePopup");
  popup.classList.add("closing");
  setTimeout(() => {
    popup.style.display = "none";
  }, 300);
}

// Add event listener to the new button
document
  .getElementById("imageButton")
  .addEventListener("click", openImagePopup);

// Close the popup when clicking outside the content
document
  .getElementById("imagePopup")
  .addEventListener("click", function (event) {
    if (event.target === this) {
      closeImagePopup();
    }
  });
// Initialize the simulation
drawSimulation();
