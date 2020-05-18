const size = 10
const textMargin = 1
const width = 600
const height = 600

const FACE_TEXT_MAP = [
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  '11',
  '12',
  '13',
  '14',
  '15',
  '16',
  '17',
  '18',
  '19',
  '20',
]

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

const createTextTexture = (text) => {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  const ts = 512

  canvas.width = ts
  canvas.height = ts

  context.font = '120pt Arial'
  context.fillStyle = '#d5210a'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillStyle = 'rgba(0, 0, 0, 0.8)'
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
  const texture = createTextTexture(FACE_TEXT_MAP[i])

  materials.push(
    new THREE.MeshLambertMaterial({ map: texture, emissiveMap: texture })
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
  [3, 9, 4, 17],
  [3, 4, 2, 18],
  [3, 2, 6, 19],
  [3, 6, 8, 20],
  [3, 8, 9, 16],
  [4, 9, 5, 12],
  [2, 4, 11, 11],
  [6, 2, 10, 15],
  [8, 6, 7, 14],
  [9, 8, 1, 13],
]

vertices.forEach(([x, y, z]) => {
  geometry.vertices.push(new THREE.Vector3(x, y, z).normalize())
})

faces.forEach(([x, y, z, index]) => {
  const face = new THREE.Face3(x, y, z)
  face.materialIndex = index - 1
  geometry.faces.push(face)

  geometry.faceVertexUvs[0].push([
    new THREE.Vector2(0, 0.2),
    new THREE.Vector2(1, 0.35),
    new THREE.Vector2(0.5, 1),
  ])
})

geometry.computeBoundingSphere()
geometry.computeFaceNormals()
geometry.computeVertexNormals()

// const geometry = new THREE.IcosahedronGeometry()
const mesh = new THREE.Mesh(geometry, materials)
scene.add(mesh)

// Edges

const edgesGeometry = new THREE.WireframeGeometry2(geometry)

const edgesMaterial = new THREE.LineMaterial({ color: 0xffffff, linewidth: 5 })
edgesMaterial.resolution.set(width, height)

const edgesMesh = new THREE.Wireframe(edgesGeometry, edgesMaterial)
edgesMesh.computeLineDistances()
edgesMesh.scale.set(1, 1, 1)

mesh.add(edgesMesh)

// Scale the face geometry so the wireframe always sits on top
geometry.scale(0.99, 0.99, 0.99)

// Webgl renderer

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setPixelRatio(window.devicePixelRatio)

// Renderer

renderer.setClearColor(0xffffff)
renderer.setSize(width, height, false)

// Lights

const light = new THREE.PointLight(0xffffff, 1.4)
// light.position.set(20, 60, 40)
light.position.set(-20, 20, 30)
scene.add(light)

const ambientLight = new THREE.AmbientLight(0xcccccc)
scene.add(ambientLight)

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
  requestAnimationFrame(animate)
}

animate()
