var gl = null;
var shaderProgram  = null; //Shader program to use.
var vao = null; //Geometry to render (stored in VAO).
var indexCount = 0;

//Uniform locations.
var u_modelMatrix;
var u_viewMatrix;
var u_projMatrix;

//Uniform values.
var modelMatrix = mat4.create();
var model2Matrix = mat4.create();
var viewMatrix = mat4.create();
var projMatrix = mat4.create();

//Aux variables,
var angle = 0;
var scale = 1;
var parsedOBJ1 = null; //Parsed OBJ file
var parsedOBJ2 = null; //Parsed OBJ file
var paneo_def = 0;
var zoom_def = 0;
var arriba_def = 5;
var abajo_def = 5;
var eye = [2, 2, 0];
var target = [0, 0, 0];
var up = [0, 1, 0];
var step = 0.1;
var mx = 2, my = 2, mz = 0;
var Mx = 2, My = 2, Mz = 0;
var ax = 2, ay = 2, az = 0;

function onLoad() {

    // 1️⃣ Configuracion base de WebGL

    // Encontramos el canvas y obtenemos el contexto de WebGL
	let canvas = document.getElementById('webglCanvas');
    gl = canvas.getContext('webgl2');


    let indices1 = parsedOBJ1.indices;
    let positions1 = parsedOBJ1.positions;

    let indices2 = parsedOBJ2.indices;
    let positions2 = parsedOBJ2.positions;


    indexCount = indices1.length+indices2.length;
    let indices = new Array(indexCount);
    let i;
    let colors1 = new Array(positions1.length);
    let colors2 = new Array(positions2.length);
    for ( i = 0; i < indices1.length; i++) {
        indices[i] = indices1[i];
        colors1[i] = 255;
    }
    for ( i = indices1.length; i < indexCount; i++) {
        indices[i] = indices2[i-indices1.length];
        colors2[i-indices1.length] = 255;
    }

    // Seteamos el color que vamos a usar para limpiar el canvas (i.e. el color de fondo)
    gl.clearColor(0.18, 0.18, 0.18, 1.0)

    // Cargamos las posiciones de los vertices en un buffer (VBO)
    const vertexPositionsBuffer1 = createVertexBuffer(gl, positions1)
    const vertexPositionsBuffer2 = createVertexBuffer(gl, positions2)

    // Cargamos los colores de los vertices en otro (VBO)
    const vertexColorsBuffer1 = createVertexBuffer(gl, colors1)
    const vertexColorsBuffer2 = createVertexBuffer(gl, colors2)

    // Cargamos los indices de los vertices en otro más (EBO)
    const vertexIndicesBuffer = createIndexBuffer(gl, indices)

    // 3️⃣ Creamos los shaders y el programa de shaders que vamos a usar

    // Shader de vertices
    const vertexShaderSource = getVertexShaderSourceCode()
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource)

    // Shader de fragmentos
    const fragmentShaderSource = getFragmentShaderSourceCode()
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)

    // "Conectamos" los shaders en un Programa de Shaders
    shaderProgram = createShaderProgram(gl, vertexShader, fragmentShader)

    // 4️⃣ Asociamos el Programa de Shaders a los buffers de la geometria

    // Obtenemos la ubicacion de los atributos que representan a la posicion y el color de los vertices en nuestro programa ("vertexPosition", "vertexColor")
    const vertexPositionLocation = gl.getAttribLocation(shaderProgram, "vertexPosition")
    const vertexColorLocation = gl.getAttribLocation(shaderProgram, "vertexColor")

    // Registramos la relacion entre los atributos y sus buffers, y que vamos a estar usando el buffer de indices
    const vertexArray = gl.createVertexArray()
    gl.bindVertexArray(vertexArray)
    addAttributeToBoundVertexArray(gl, vertexPositionLocation, vertexPositionsBuffer1, 3)
    addAttributeToBoundVertexArray(gl, vertexColorLocation, vertexColorsBuffer1, 3)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertexIndicesBuffer)
    gl.bindVertexArray(null)

    // 5️⃣ Establecemos el programa de shaders e info de la geometria que vamos a usar para dibujar

    // Programa de Shaders
    gl.useProgram(shaderProgram)

    // Info de la geometria
    gl.bindVertexArray(vertexArray)

    // Magia ✨ (que mas adelante vamos a ver qué esta haciendo)
    magic(gl, shaderProgram, canvas)

    // 6️⃣ Dibujamos la escena

    // Limpiamos el canvas
    gl.clear(gl.COLOR_BUFFER_BIT)

    // Y dibujamos 🎨
    const mode   = gl.LINE_LOOP
    const offset = 0
    const type   = gl.UNSIGNED_SHORT
    gl.drawElements(mode, indices1.length, type, offset)

    gl.bindVertexArray(vertexArray)
    addAttributeToBoundVertexArray(gl, vertexPositionLocation, vertexPositionsBuffer2, 3)
    addAttributeToBoundVertexArray(gl, vertexColorLocation, vertexColorsBuffer2, 3)
    gl.bindVertexArray(null)
    gl.bindVertexArray(vertexArray)
    gl.drawElements(mode, indices2.length, type, offset)




}

// Funciones auxiliares

function createShader(gl, type, sourceCode) {
    const shader = gl.createShader(type)
    gl.shaderSource(shader, sourceCode)
    gl.compileShader(shader)

    // Chequeamos que el shader haya compilado con exito
    const compiledSuccessfully = gl.getShaderParameter(shader, gl.COMPILE_STATUS)

    if ( ! compiledSuccessfully ) {
        // Obtenemos el log generado por el compilador de shaders y lo mostramos
        const shaderLog = gl.getShaderInfoLog(shader)
        console.group(type === gl.VERTEX_SHADER ? "Vertex Shader Logs" : "Fragment Shader Logs")
        console.log(shaderLog)
        console.groupEnd()
    }

    return shader
}

function createShaderProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram()
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)

    // Chequeamos que el programa se haya creado con exito
    const linkedSuccessfully = gl.getProgramParameter(program, gl.LINK_STATUS)

    if ( ! linkedSuccessfully ) {
        // Obtenemos el log generado al intentar crear el program y lo mostramos
        const programLog = gl.getProgramInfoLog(program)
        console.group("Shaders Program Log")
        console.log(programLog)
        console.groupEnd()
    }

    return program
}

function createVertexBuffer(gl, data) {
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW)
    gl.bindBuffer(gl.ARRAY_BUFFER, null)

    return buffer
}

function createIndexBuffer(gl, data) {
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(data), gl.STATIC_DRAW)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)

    return buffer
}

function addAttributeToBoundVertexArray(gl, attributeLocation, attributeBuffer, attributeSize) {
    gl.bindBuffer(gl.ARRAY_BUFFER, attributeBuffer)
    gl.vertexAttribPointer(attributeLocation, attributeSize, gl.FLOAT, false, 0, 0)
    gl.bindBuffer(gl.ARRAY_BUFFER, null)
    gl.enableVertexAttribArray(attributeLocation)
}

function getVertexShaderSourceCode() {
    return`#version 300 es
    uniform mat4 viewMatrix;
    uniform mat4 projectionMatrix;
    in vec3 vertexPosition;
    in vec3 vertexColor;
    out vec3 color;
    void main() {
        color = vertexColor;
        gl_Position = projectionMatrix * viewMatrix * vec4(vertexPosition, 1);
    }`
}

function getFragmentShaderSourceCode() {
    return `#version 300 es
    precision mediump float;
    in vec3 color;
    out vec4 fragmentColor;
    void main() {
        fragmentColor = vec4(color, 1);
    }`
}


function magic(gl, program, canvas) {
    let viewMatrixLocation = gl.getUniformLocation(program, "viewMatrix")
    let projectionMatrixLocation = gl.getUniformLocation(program, "projectionMatrix")


    let viewMatrix = mat4.create()
    let projectionMatrix = mat4.create()

    let eye    = [3, 3, 5]
    let center = [0, 0, 0]
    let up     = [0, 1, 0]
    mat4.lookAt(viewMatrix, eye, center, up)

    const fov    = 45 * Math.PI / 180
    const aspect = canvas.width / canvas.height
    const near   = 0.1
    const far    = 10
    mat4.perspective(projectionMatrix, fov, aspect, near, far)

    gl.uniformMatrix4fv(viewMatrixLocation, false, viewMatrix)
    gl.uniformMatrix4fv(projectionMatrixLocation, false, projectionMatrix)
}


function onModelLoad1(event) {
	let objFileContent = event.target.result;
	parsedOBJ1 = OBJParser.parseFile(objFileContent);
}

function onModelLoad2(event) {
	let objFileContent = event.target.result;
	parsedOBJ2 = OBJParser.parseFile(objFileContent);
}
