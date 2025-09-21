document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("myCanvas");
  const ctx = canvas.getContext("2d");

  function resizeCanvas() {
    const container = document.querySelector(".holder");
    canvas.width = container.clientWidth * 0.9; 
    canvas.height = window.innerHeight * 0.6; 
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  //resize canvas and redraw saved states
  let tempHistory = [];
  window.addEventListener("resize", () => {
    tempHistory = [...history]; //clone history
    resizeCanvas();
    tempHistory.forEach((state) => restoreState(state)); //redraw saved states
  });

  //stacks for undo and redo
  const history = [];
  const redoStack = [];

  //strandard brush settings
  let drawing = false;
  let brushColor = "#000000";
  let brushSize = 5;
  let shape = "round";
  let isErasing = false;

  //color picker
  const brushColorInput = document.getElementById("brushColor");

  brushColorInput.addEventListener("input", () => {
    brushColor = brushColorInput.value;
  });

  //brush size picker
  const brushSizeInput = document.getElementById("brushSize");

  brushSizeInput.addEventListener("input", () => {
    brushSize = brushSizeInput.value;
  });

  //shape picker
  const brushShape = document.getElementById("shape");

  brushShape.addEventListener("input", () => {
    shape = brushShape.value;
  });
  //save current state
  function saveState() {
    history.push(canvas.toDataURL()); //save as img
    if (history.length > 10) {
      history.shift(); //limit history to 10 states
    }
  }

  //restore state
  function restoreState(state) {
    const img = new Image();
    img.src = state;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height); //clear
      ctx.drawImage(img, 0, 0); // Draw the saved state
    };
  }

  //draw
  canvas.addEventListener("mousedown", (e) => {
    drawing = true;
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
  });

  canvas.addEventListener("mousemove", (e) => {
    if (!drawing) return;
    ctx.lineTo(e.offsetX, e.offsetY);
    if (isErasing) {
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "rgba(0,0,0,0)";
    } else {
      ctx.globalCompositeOperation = "source-over";
    }
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = shape;
    canvas.style.cursor = isErasing
      ? "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewport=\"0 0 32 32\"><text x=\"0\" y=\"24\" font-size=\"24\">🧽</text></svg>') 16 16, auto"
      : "crosshair";

    ctx.stroke();
  });

  canvas.addEventListener("mouseup", () => {
    if (drawing) {
      saveState(); 
    }
    drawing = false;
    ctx.closePath();
  });

  canvas.addEventListener("mouseleave", () => {
    if (drawing) {
      saveState(); 
    }
    drawing = false;
  });

  canvas.addEventListener("dragover", (e) => {
    e.preventDefault(); //necessary to allow the drop
  });

  // Handle the drop event
  canvas.addEventListener("drop", (e) => {
    e.preventDefault(); 
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      const img = new Image();
      img.src = URL.createObjectURL(file); // Convert file to a URL
      img.onload = () => {
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
    } else {
      alert("Please drop an image file!");
    }
  });

  // Undo Button
  document.getElementById("undoButton").addEventListener("click", () => {
    if (history.length > 0) {
      redoStack.push(history.pop());
      if (history.length > 0) {
        restoreState(history[history.length - 1]); //restore last state
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height); //clear if no history
      }
    }
  });

  // Redo Button
  document.getElementById("redoButton").addEventListener("click", () => {
    if (redoStack.length > 0) {
      const state = redoStack.pop(); //get the last undo state
      history.push(state); //save it back to history
      restoreState(state); 
    }
  });

  // Clear Button
  document.getElementById("clearButton").addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height); //clear 
    history.length = 0; //clear history
    redoStack.length = 0; //clear redo stack
  });

  //save button
  document.getElementById("saveButton").addEventListener("click", () => {
    const imageUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = "drawing.png";
    link.href = imageUrl;

    link.click();
  });

  document.getElementById("eraserButton").addEventListener("click", () => {
    isErasing = !isErasing; //eraser mode
    const eraserButton = document.getElementById("eraserButton");
    if (isErasing) {
      eraserButton.classList.add("active");
    } else {
      eraserButton.classList.remove("active");
    }
  });
});
