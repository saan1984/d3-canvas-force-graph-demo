import {getData} from "./files/service.js";

const data = await getData();
  // Specify the dimensions of the chart.

document.addEventListener("DOMContentLoaded", () => {
  // Your existing code here
  const width = 928;
  const height = 600;
  const color = d3.scaleOrdinal(d3.schemeCategory10);

  const links = data.links.map(d => ({ ...d }));
  const nodes = data.nodes.map(d => ({ ...d }));

  const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id))
      .force("charge", d3.forceManyBody())
      .force("center", d3.forceCenter(width / 2, height / 2))
      .on("tick", draw);

  const dpi = devicePixelRatio;
  const canvas = d3.create("canvas")
      .attr("width", dpi * width)
      .attr("height", dpi * height)
      .attr("style", `width: ${width}px; max-width: 100%; height: auto;`)
      .node();
  document.body.appendChild(canvas);
  const context = canvas.getContext("2d");
  context.scale(dpi, dpi);

  function draw() {
    context.clearRect(0, 0, width, height);

    context.save();
    context.globalAlpha = 0.6;
    context.strokeStyle = "#999";
    context.beginPath();
    links.forEach(drawLink);
    context.stroke();
    context.restore();

    context.save();
    context.strokeStyle = "#fff";
    context.globalAlpha = 1;
    nodes.forEach(node => {
      context.beginPath();
      drawNode(node);
      context.fillStyle = color(node.group);
      context.strokeStyle = "#fff";
      context.fill();
      context.stroke();
      writeTextInNode(node);
    });
    context.restore();
  }

    function drawLink(d) {
    context.moveTo(d.source.x, d.source.y);
    context.lineTo(d.target.x, d.target.y);
  }

  const circles = [];

  function drawNode(node) {
    const radius = 20;

    context.globalAlpha = 0.2;
    context.beginPath();
    context.arc(node.x, node.y, radius, 0, 2 * Math.PI);
    context.fillStyle = "#fff";
    context.fill();
    context.globalAlpha = 1;

    // Store information about the circle
    circles.push({
      x: node.x,
      y: node.y,
      radius: radius,
      id: node.id,
    });

  }

  function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    };
  }

// Debounced click event handler
  const debouncedClickHandler = debounce(handleClick, 300);


  function handleClick(event) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const maxDistance = 20; // Adjust the distance threshold as needed

    // Check if the click is inside any node
    const clickedNode = circles.find((circle) => {
      const dx = mouseX - circle.x;
      const dy = mouseY - circle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Check if the click is within a certain distance of the circle
      return distance < maxDistance;
    });

    // Log something to the console when a node is clicked
    if (clickedNode) {
      console.log("Node clicked:", clickedNode.id);
    }
  }

// Add a debounced click event to the canvas
  canvas.addEventListener("click", debouncedClickHandler);
  function writeTextInNode(node) {
    const text = "sandeep";
    // Display "sandeep" text inside the node
    context.fillStyle = "#fff";
    context.font = "14px sans-serif"; // Adjust the font size and family as needed
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(node.id, node.x, node.y);
  }

  d3.select(canvas)
      .call(d3.drag()
          .subject(event => {
            const [px, py] = d3.pointer(event, canvas);
            return d3.least(nodes, ({ x, y }) => {
              const dist2 = (x - px) ** 2 + (y - py) ** 2;
              if (dist2 < 400) return dist2;
            });
          })
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended));

  function dragstarted(event) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }

  function dragged(event) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }

  function dragended(event) {
    if (!event.active) simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
  }

// Stop the previous simulation when this cell is re-run.
  simulation.on("end", () => simulation.stop());
});


