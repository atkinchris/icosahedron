const size = 10
const textMargin = 1
const width = 600
const height = 600
const fontColour = '#000000'
const backColour = '#ffffff'

// Camera and scene
const aspect = width / height
const d = 2
const camera = new THREE.OrthographicCamera(
  -d * aspect,
  d * aspect,
  d,
  -d,
  1,
  1000
)
camera.position.z = -50

const scene = new THREE.Scene()

// Material and geometry

const material = new THREE.MeshPhongMaterial({
  specular: 0xa02a10,
  shininess: 50,
  emissive: 0xd5210a,
})

const createTextTexture = (text, color, backColour) => {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  const ts = 512

  canvas.width = ts
  canvas.height = ts

  context.font = '120pt Arial'
  context.fillStyle = backColour
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillStyle = color
  context.fillText(text, canvas.width / 2, canvas.height / 2)

  if (text == '6' || text == '9') {
    context.fillText('   .', canvas.width / 2, canvas.height / 2)
  }

  const texture = new THREE.Texture(canvas)
  texture.needsUpdate = true

  return texture
}

const materials = []

for (let i = 0; i < 20; i += 1) {
  const texture = createTextTexture(i + 1, fontColour, backColour)

  materials.push(
    new THREE.MeshPhongMaterial({
      specular: 0xa02a10,
      shininess: 50,
      emissive: 0xd5210a,
      flatShading: true,
      map: texture,
    })
  )
}

const geometry = new THREE.Geometry()
const t = (1 + Math.sqrt(5)) / 2
const vertices = [
  [-1, t, 0],
  [1, t, 0],
  [-1, -t, 0],
  [1, -t, 0],
  [0, -1, t],
  [0, 1, t],
  [0, -1, -t],
  [0, 1, -t],
  [t, 0, -1],
  [t, 0, 1],
  [-t, 0, -1],
  [-t, 0, 1],
]
const faces = [
  [0, 11, 5, 1],
  [0, 5, 1, 2],
  [0, 1, 7, 3],
  [0, 7, 10, 4],
  [0, 10, 11, 5],
  [1, 5, 9, 6],
  [5, 11, 4, 7],
  [11, 10, 2, 8],
  [10, 7, 6, 9],
  [7, 1, 8, 10],
  [3, 9, 4, 11],
  [3, 4, 2, 12],
  [3, 2, 6, 13],
  [3, 6, 8, 14],
  [3, 8, 9, 15],
  [4, 9, 5, 16],
  [2, 4, 11, 17],
  [6, 2, 10, 18],
  [8, 6, 7, 19],
  [9, 8, 1, 20],
]

vertices.forEach(([x, y, z]) => {
  geometry.vertices.push(new THREE.Vector3(x, y, z).normalize())
})

faces.forEach(([x, y, z, index]) => {
  const face = new THREE.Face3(x, y, z)
  face.materialIndex = index
  geometry.faces.push(face)

  geometry.faceVertexUvs[0].push([
    new THREE.Vector2(0, 0.2),
    new THREE.Vector2(1, 0.2),
    new THREE.Vector2(0.5, 1),
  ])
})

geometry.computeBoundingSphere()

// const geometry = new THREE.IcosahedronGeometry()
const mesh = new THREE.Mesh(geometry, materials)
scene.add(mesh)

// Edges

// const edgesGeometry = new THREE.EdgesGeometry(mesh.geometry)
// const edgesMaterial = new THREE.LineBasicMaterial({ color: 0xffffff })
// const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial)
// edges.renderOrder = 1
// mesh.add(edges)

// Webgl renderer

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setPixelRatio(window.devicePixelRatio)

// Svg renderer

// const renderer = new three.svgrenderer()

// Renderer

renderer.setClearColor(0xffffff)
renderer.setSize(width, height, false)

// Lights

const light = new THREE.PointLight(0xffffff, 0.4)
// light.position.set(20, 60, 40)
light.position.set(-20, 20, 20)
scene.add(light)

// Set camera

camera.position.set(20, 20, 20)
camera.lookAt(scene.position)

// Add to dom

renderer.domElement.className = 'renderer'
document.body.appendChild(renderer.domElement)

// Animate

mesh.rotation.x += 0.5
mesh.rotation.y += 3
mesh.rotation.z -= 0.5

function animate() {
  mesh.rotation.x += 0.015
  mesh.rotation.y += 0.015

  renderer.render(scene, camera)
  // requestAnimationFrame(animate)
}

animate()
