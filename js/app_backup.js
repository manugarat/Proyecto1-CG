/* dudas:
 *      cargar archivos sin tener que elegirlos
 *      un vbo por .obj
 *      rotar uno con respecto al otro
 *      zoom no anda bien
 *      mostrar interfaz
 *      wireframe ok?
 */

var gl = null;
var shaderProgram  = null; //Shader program to use.
var vao = null; //Geometry to render (stored in VAO).
var indices, indices1, indices2;
var indexCount = 0;
var vertexAttributeInfoArray1;
var vertexAttributeInfoArray2;

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
	let canvas = document.getElementById('webglCanvas');
    gl = canvas.getContext('webgl2');

    indices1 = parsedOBJ1.indices;
    let positions1 = parsedOBJ1.positions;

    indices2 = parsedOBJ2.indices;
    let positions2 = parsedOBJ2.positions;

    indexCount = indices1.length+indices2.length;
    indices = new Array(indexCount);
    let i;
    let positions = new Array(positions1.length+positions2.length);
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

	//vertexShaderSource y fragmentShaderSource estan importadas en index.html <script>
	shaderProgram = ShaderProgramHelper.create(vertexShaderSource, fragmentShaderSource);

	let posLocation = gl.getAttribLocation(shaderProgram, 'vertexPos');
	let colLocation = gl.getAttribLocation(shaderProgram, 'vertexCol');
	u_modelMatrix = gl.getUniformLocation(shaderProgram, 'modelMatrix');
	u_viewMatrix = gl.getUniformLocation(shaderProgram, 'viewMatrix');
	u_projMatrix = gl.getUniformLocation(shaderProgram, 'projMatrix');
	vertexAttributeInfoArray1 = [
		new VertexAttributeInfo(positions1, posLocation, 3),
		new VertexAttributeInfo(colors1, colLocation, 3)
	];
	vertexAttributeInfoArray2 = [
		new VertexAttributeInfo(positions2, posLocation, 3),
		new VertexAttributeInfo(colors2, colLocation, 3)
	];

	vao = gl.createVertexArray();
	let ebo = VAOHelper._createEBO(indices);
	gl.bindVertexArray(vao);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo);

	gl.clearColor(0.18, 0.18, 0.18, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	//Matrix de Vista y Proyeccion.
	mat4.lookAt(viewMatrix, eye, target, up);

	let fovy = glMatrix.toRadian(50);
	let aspect = 1;
	let zNear = 0.1;
	let zFar = 10.0;
	mat4.perspective(projMatrix, fovy, aspect, zNear, zFar);

	gl.enable(gl.DEPTH_TEST);
}

function onRender() {
    let select_objeto = document.getElementById("objeto_seleccionado");
	let objeto = select_objeto.options[select_objeto.selectedIndex].text;

	let select_camara = document.getElementById("camara_seleccionada");
	let camara = select_camara.options[select_camara.selectedIndex].text;

	if ( camara == "Automática" ) {
		document.getElementById("range_paneo").disabled = true;
		document.getElementById("mas_zoom").disabled = true;
        document.getElementById("menos_zoom").disabled = true;
		document.getElementById("arriba").disabled = true;
        document.getElementById("abajo").disabled = true;
	}
	else {
		document.getElementById("range_paneo").disabled = false;
		document.getElementById("mas_zoom").disabled = false;
        document.getElementById("menos_zoom").disabled = false;
		document.getElementById("arriba").disabled = false;
        document.getElementById("abajo").disabled = false;
	}

	let rotationMatrix = mat4.create();
	let scaleMatrix = mat4.create();
	let translationMatrix = mat4.create();
	mat4.fromYRotation(rotationMatrix, glMatrix.toRadian(angle));
	mat4.fromScaling(scaleMatrix, [scale, scale, scale]);
	mat4.fromTranslation(translationMatrix, [1,0,0]);

	modelMatrix = mat4.create();
	mat4.multiply(modelMatrix, rotationMatrix, scaleMatrix);
	//mat4.fromTranslation(modelMatrix,modelMatrix,translationMatrix);

	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	bindVBO(vertexAttributeInfoArray1);
	gl.useProgram(shaderProgram);
	gl.uniformMatrix4fv(u_modelMatrix, false, modelMatrix);
	gl.uniformMatrix4fv(u_viewMatrix, false, viewMatrix);
	gl.uniformMatrix4fv(u_projMatrix, false, projMatrix);

	gl.drawElements(gl.LINE_LOOP, indices1.length, gl.UNSIGNED_INT, 0);


	bindVBO(vertexAttributeInfoArray2);
	gl.drawElements(gl.LINE_LOOP, indices2.length, gl.UNSIGNED_INT, 0);
}

function bindVBO(vertexAttributeInfoArray) {
	//Create all VBOs
	let vboArray = [];
	let count = vertexAttributeInfoArray.length;
	for (let i = 0; i < count; i++) {
		let currentVBO = VAOHelper._createVBO(vertexAttributeInfoArray[i].data);
		vboArray.push(currentVBO);
	}

	//Configure all attributes.
	for (let i = 0; i < count; i++) {
		let attrLocation = vertexAttributeInfoArray[i].location;
		let attrSize = vertexAttributeInfoArray[i].size;
		gl.bindBuffer(gl.ARRAY_BUFFER, vboArray[i]);
		gl.enableVertexAttribArray(attrLocation);
		gl.vertexAttribPointer(attrLocation, attrSize, gl.FLOAT, false, 0, 0);
	}
}

function rotar_objeto(slider) {
	angle = parseFloat(slider.value);
	onRender();
}

function rotar_objeto_sobre_otro(slider) {

}

function camara_automatica(slider) {

}

function paneo(slider) {
    let nuevo_z = parseFloat(slider.value);
    target[2] = nuevo_z;
	mat4.lookAt(viewMatrix, eye, target, up);
    onRender();
}

function mas_zoom() {
    console.log("("+ax+","+ay+","+az+")");
    ax -= step; ay -= step; az -= step;
    eye = [ax,ay,az];
    mat4.lookAt(viewMatrix, eye, target, up);
	onRender();
}

function menos_zoom() {
    console.log("("+ax+","+ay+","+az+")");
    ax += step; ay += step; az += step;
    eye = [ax,ay,az];
    mat4.lookAt(viewMatrix, eye, target, up);
	onRender();
}

function arriba() {
	eye[1] += step;
	mat4.lookAt(viewMatrix, eye, target, up);
    onRender();
}

function abajo() {
	eye[1] -= step;
	mat4.lookAt(viewMatrix, eye, target, up);
    onRender();
}

function onModelLoad1(event) {
	let objFileContent = event.target.result;
	parsedOBJ1 = OBJParser.parseFile(objFileContent);
}

function onModelLoad2(event) {
	let objFileContent = event.target.result;
	parsedOBJ2 = OBJParser.parseFile(objFileContent);
}
