// Own schematic geometry, no semantic shape names or answer keys.
export const scenes = {
  "plant": [
    {
      "id": "r1",
      "shape": "path",
      "x": 200,
      "y": 55,
      "d": "M218 35 a18 18 0 1 0 -36 0 a18 18 0 1 0 36 0 M236 45 a18 18 0 1 0 -36 0 a18 18 0 1 0 36 0 M236 65 a18 18 0 1 0 -36 0 a18 18 0 1 0 36 0 M218 75 a18 18 0 1 0 -36 0 a18 18 0 1 0 36 0 M200 65 a18 18 0 1 0 -36 0 a18 18 0 1 0 36 0 M200 45 a18 18 0 1 0 -36 0 a18 18 0 1 0 36 0",
      "color": "#cf83a5",
      "fill": "#cf83a5",
      "strokeWidth": 1
    },
    {
      "id": "r2",
      "shape": "rect",
      "x": 191,
      "y": 98,
      "w": 18,
      "h": 154,
      "color": "#58875b"
    },
    {
      "id": "r3",
      "shape": "ellipse",
      "x": 147,
      "y": 169,
      "w": 98,
      "h": 36,
      "color": "#72a66a"
    },
    {
      "id": "r4",
      "shape": "path",
      "x": 200,
      "y": 254,
      "d": "M200 254 l-40 65 m40 -65 l40 65 m-40 -65 v80 m0 -55 l-55 20 m55 -20 l55 20",
      "color": "#9a7552",
      "fill": "none",
      "strokeWidth": 8
    }
  ],
  "room": [
    {
      "id": "r1",
      "shape": "rect",
      "x": 40,
      "y": 40,
      "w": 100,
      "h": 90,
      "color": "#a9d8ef"
    },
    {
      "id": "r2",
      "shape": "rect",
      "x": 255,
      "y": 38,
      "w": 92,
      "h": 120,
      "color": "#c3a18a"
    },
    {
      "id": "r3",
      "shape": "path",
      "x": 170,
      "y": 250,
      "d": "M80 210 h180 v18 h-180 z M95 228 v60 M245 228 v60",
      "color": "#d6b073",
      "fill": "#d6b073",
      "strokeWidth": 6
    },
    {
      "id": "r4",
      "shape": "ellipse",
      "x": 278,
      "y": 250,
      "w": 40,
      "h": 40,
      "color": "#8a80c4"
    }
  ]
};
export function authoredVisual(q) {return q.type === "numberline" ? {version:1,min:q.visual.min,max:q.visual.max,step:q.visual.step} : {version:1,objects:scenes[q.visual?.template] || [],labels:[...(q.visual?.labels || [])].sort((a,b)=>a.id.localeCompare(b.id))};}
