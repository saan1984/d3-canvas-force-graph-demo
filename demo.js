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
    console.log("canvas", canvas);
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
    });
    context.restore();
  }

  function drawLink(d) {
    context.moveTo(d.source.x, d.source.y);
    context.lineTo(d.target.x, d.target.y);
  }

  function drawNode(d) {
    context.moveTo(d.x + 5, d.y);
    context.arc(d.x, d.y, 5, 0, 2 * Math.PI);
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


