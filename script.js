const width = 600
const height = 600
const FONT = 'IM Fell English SC'
const DEBUG_TEXTURES = false

// A big map of every character that should be on the coresponding side of the die
// Their index in the array is the numerical position on the die
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
  'M',
]

const run = () => {
  // Camera and scene
  const aspect = width / height
  // This is the scale factor for the camera - higher = more on screen
  const d = 2
  // Orthographic camera, so everything appears the same size - i.e. no perspective
  const camera = new THREE.OrthographicCamera(
    -d * aspect,
    d * aspect,
    d,
    -d,
    1,
    1000
  )

  // Create a scene
  const scene = new THREE.Scene()

  // This function creates a THREE.Texture using a canvas
  // It's used to write a bit of text onto a texture for displaying on faces
  const createTextTexture = (text) => {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    const textureSize = 512
    const font = `120pt ${FONT}`

    canvas.width = textureSize
    canvas.height = textureSize

    // Fix the canvas first, to set the base colour
    context.fillStyle = '#d5210a'
    context.fillRect(0, 0, canvas.width, canvas.height)

    // Fill the text onto the middle of the canvas
    context.font = font
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillStyle = 'rgba(0, 0, 0, 0.8)'
    context.fillText(text, canvas.width / 2, canvas.height / 2)

    // If the text is a vertically ambiguous character, add a dot after it, to designate orientation
    if (text == '6' || text == '9') {
      context.fillText('   .', canvas.width / 2, canvas.height / 2)
    }

    // If DEBUG_TEXTURES is enabled, add the texture canvas to the body so we can see what was rendered
    if (DEBUG_TEXTURES) {
      canvas.className = 'debug-texture'
      document.body.appendChild(canvas)
    }

    const texture = new THREE.Texture(canvas)

    // We need THREE to prepare the texture for us on next render
    texture.needsUpdate = true

    return texture
  }

  // We can't use the built in Icosahedral shape, because it's face texture maps don't match our textures
  // const geometry = new THREE.IcosahedronGeometry()

  // Create a new geometry object
  const geometry = new THREE.Geometry()

  // Calculate the apex for each triangle
  const t = (1 + Math.sqrt(5)) / 2

  // Vertices for the shape
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

  // And their corresponding faces, in the format [v1, v2, v3, materialIndex]
  // Note, the material indexes are NOT in order - this is to ensure opposite faces of the die add up to 21
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
    // Push each vertex into the geometry, and normalise it
    geometry.vertices.push(new THREE.Vector3(x, y, z).normalize())
  })

  faces.forEach(([v1, v2, v3, materialIndex]) => {
    // Create a face from each face and triplet of relevant vertices
    const face = new THREE.Face3(v1, v2, v3)

    // Set the face's material to the corresponding material in the map
    // These are currently indexed from 1, so we need to shift them to index from zero
    face.materialIndex = materialIndex - 1

    // Push the face into the geometry
    geometry.faces.push(face)

    // Setting the faceVertexUvs is required to map each material texture onto each face
    // The below three vectors ensure the square texture maps to the centre of the triangular face
    // I don't know what the math is doing, but it looks better than my fixed approximations before
    const tab = -0.2
    const af = -Math.PI / 3 / 2
    const aa = (Math.PI * 2) / 3
    geometry.faceVertexUvs[0].push([
      new THREE.Vector2(
        (Math.cos(af) + 1 + tab) / 2 / (1 + tab),
        (Math.sin(af) + 1 + tab) / 2 / (1 + tab)
      ),
      new THREE.Vector2(
        (Math.cos(aa * 1 + af) + 1 + tab) / 2 / (1 + tab),
        (Math.sin(aa * 1 + af) + 1 + tab) / 2 / (1 + tab)
      ),
      new THREE.Vector2(
        (Math.cos(aa * 2 + af) + 1 + tab) / 2 / (1 + tab),
        (Math.sin(aa * 2 + af) + 1 + tab) / 2 / (1 + tab)
      ),
    ])
  })

  // Have THREE compute geometry normals and bounding, to save us doing it manually
  geometry.computeBoundingSphere()
  geometry.computeFaceNormals()
  geometry.computeVertexNormals()

  // Build an array of materials for each face
  const materials = []
  for (let i = 0; i < 20; i += 1) {
    // Create a texture with the corresponding text from the map
    const texture = createTextTexture(FACE_TEXT_MAP[i])

    // Create a non-shiny material for the texture, and push it into the materials array
    materials.push(new THREE.MeshLambertMaterial({ map: texture }))
  }

  // Create a mesh from the geometry we just created, and the materials
  // These materials will be displayed on their corresponding face by position in the array
  const mesh = new THREE.Mesh(geometry, materials)

  // Add the mesh to our scene
  scene.add(mesh)

  // Calculate the geometry for our edges
  // As the inbuilt edge material in THREE cannot show edges wider than a single unit in WebGL,
  // We have to generate actual geometry for our edges
  const edgesGeometry = new THREE.WireframeGeometry2(geometry)

  // Create a custom material for the edges, and simulate a line width of 5 pixels
  const edgesMaterial = new THREE.LineMaterial({
    color: 0xffffff,
    linewidth: 5,
  })

  // This is very important. We have to set the resolution that the line material should render at.
  // Without this, the lines will be very unpredictable, often filling the screen
  edgesMaterial.resolution.set(width, height)

  // Generate a mesh for the edge geometry and material
  const edgesMesh = new THREE.Wireframe(edgesGeometry, edgesMaterial)

  // Have THREE compute line distances for the edges
  edgesMesh.computeLineDistances()

  // Add the edges to our mesh
  mesh.add(edgesMesh)

  // Scale the face geometry so the wireframe always sits on top
  geometry.scale(0.99, 0.99, 0.99)

  // Create the WebGL renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setClearColor(0xffffff)
  renderer.setSize(width, height, false)

  // Create a Point light for illuminating the top left of the shape
  // This helps with the 3D effect
  const light = new THREE.PointLight(0xffffff, 1.4)
  light.position.set(-20, 20, 30)
  scene.add(light)

  // Create an ambient light so the other sides of the shape are illuminated
  // This is a soft white light, so it's not overwhelming compared to the point light
  const ambientLight = new THREE.AmbientLight(0xcccccc)
  scene.add(ambientLight)

  // Create a camera and point it at the scene
  camera.position.set(20, 20, 20)
  camera.lookAt(scene.position)

  // Add the renderer to the DOM. This is a canvas element with a class of "renderer"
  renderer.domElement.className = 'renderer'
  document.body.appendChild(renderer.domElement)

  // Rotate the mesh a little for a nicer first side
  mesh.rotation.x += 0
  mesh.rotation.y += 0
  mesh.rotation.z += 0

  function animate() {
    // Rotate the mesh for some life
    mesh.rotation.x += 0.015
    mesh.rotation.y += 0.015
    mesh.rotation.z += 0.015

    // Render the scene!
    renderer.render(scene, camera)
    requestAnimationFrame(animate)
  }

  // Start the first frame of animation
  animate()
}

// Load the fonts we need for the canvas
// https://github.com/typekit/webfontloader
WebFont.load({
  google: {
    families: [FONT],
  },
  active() {
    run()
  },
})
