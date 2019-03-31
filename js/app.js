var gl = null;
var shaderProgram  = null; //Shader program to use.
var vaoh = null;
var vaor = null;
var indexcounth = 0;
var indexcountr = 0;
var indicesh;
var indicesr;
var vertexAttributeInfoArrayh;
var vertexAttributeInfoArrayr;
var camara;

//Uniform locations.
var u_modelMatrix;
var u_viewMatrix;
var u_projMatrix;

//Uniform values.
var modelMatrix = mat4.create();
var projMatrix = mat4.create();

//Aux variables,
var angle = 0;
var scale = 1;
var parsedOBJh = null; //Parsed OBJ file
var parsedOBJr = null; //Parsed OBJ file

function onLoad() {

	let canvas = document.getElementById('webglCanvas');
	gl = canvas.getContext('webgl2');

	onModelLoad();
	indicesh = parsedOBJh.indices;
	//let indices_wire = convertirIndices(indicesh);
	indexcounth = indicesh.length;

	let positionsh = parsedOBJh.positions;
	let colorsh = parsedOBJh.positions;

	indicesr = parsedOBJr.indices;
	//let indices_wire2 = convertirIndices(indicesr);
	indexcountr = indicesr.length;

	let positionsr = parsedOBJr.positions;
	let colorsr = parsedOBJr.positions;

	//vertexShaderSource y fragmentShaderSource estan importadas en index.html <script>
	shaderProgram = ShaderProgramHelper.create(vertexShaderSource, fragmentShaderSource);

	let posLocation = gl.getAttribLocation(shaderProgram, 'vertexPos');
	let colLocation = gl.getAttribLocation(shaderProgram, 'vertexCol');
	u_modelMatrix = gl.getUniformLocation(shaderProgram, 'modelMatrix');
	u_viewMatrix = gl.getUniformLocation(shaderProgram, 'viewMatrix');
	u_projMatrix = gl.getUniformLocation(shaderProgram, 'projMatrix');
	vertexAttributeInfoArrayh = [
		new VertexAttributeInfo(positionsh, posLocation, 3),
		new VertexAttributeInfo(colorsh, colLocation, 3)
	];

	vertexAttributeInfoArrayr = [
		new VertexAttributeInfo(positionsr, posLocation, 3),
		new VertexAttributeInfo(colorsr, colLocation, 3)
	];

	vaoh = VAOHelper.create(indicesh, vertexAttributeInfoArrayh);
	vaor = VAOHelper.create(indicesr, vertexAttributeInfoArrayr);

	gl.clearColor(0.18, 0.18, 0.18, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	//Matrix de Vista y Proyeccion.
	camara = new Camara();

	let fovy = glMatrix.toRadian(50);
	let aspect = 1;
	let zNear = 0.1;
	let zFar = 100;
	mat4.perspective(projMatrix, fovy, aspect, zNear, zFar);

	gl.enable(gl.DEPTH_TEST);
}

function onRender() {
	let select_camara = document.getElementById("camara_seleccionada");
	let camara_seleccionada = select_camara.options[select_camara.selectedIndex].text;

	if ( camara_seleccionada == "Automática" ) {
		document.getElementById("range_paneo").disabled = true;
		document.getElementById("range_zoom").disabled = true;
		document.getElementById("range_altura").disabled = true;
	}
	else {
		document.getElementById("range_paneo").disabled = false;
		document.getElementById("range_zoom").disabled = false;
		document.getElementById("range_altura").disabled = false
	}

	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	viewMatrix = camara.lookAt();

	gl.useProgram(shaderProgram);
	gl.uniformMatrix4fv(u_modelMatrix, false, modelMatrix);
	gl.uniformMatrix4fv(u_viewMatrix, false, viewMatrix);
	gl.uniformMatrix4fv(u_projMatrix, false, projMatrix);

	gl.bindVertexArray(vaoh);
	gl.drawElements(gl.LINE_LOOP, indexcounth, gl.UNSIGNED_INT, 0);

	gl.bindVertexArray(null);
	gl.bindVertexArray(vaor);

	gl.drawElements(gl.LINE_LOOP, indexcountr, gl.UNSIGNED_INT, 0);

	gl.bindVertexArray(null);
	gl.useProgram(null);
}

function rotar_cohete(slider) {

}

function rotar_casa(slider) {

}

function orbitar_cohete(slider) {

}

function camara_automatica() {

}

function paneo(slider) {
	camara.paneo(slider);
	onRender();
}

function zoom(slider) {
	camara.zoom(slider);
	onRender();
}

function altura(slider) {
	camara.altura(slider);
	onRender();
}

function reset_camera() {
	camara.reset();
	onRender();
}

function onModelLoad() {
	parsedOBJh = OBJParser.parseFile(house);
	parsedOBJr = OBJParser.parseFile(rocket);
}
