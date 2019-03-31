
// - rotar cohete sobre su eje direccional (en sentido horario).
// - flipear cohete al cambiar de dirección en la órbita.
// - cámara automática.
// - cómo hacer MTRT' con mat4 (cómo obtener la posición actual y hacer el vector para llevar al origen).
// - realizar órbita con el cohete originalmente en el medio.
// - cambiar rocketT por rocket y eliminar rocketT de rocket.js
// - zoom no anda del todo bien (saltos al hacerlo por primera vez)

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
var modelMatrixh = mat4.create();
var modelMatrixr = mat4.create();

//Aux variables,
var default_zoom = 45;
var default_altura = 40;
var direccion_cohete = "antihoraria";
var angulo_orbita_actual_cohete = 0;
var scale = 1;
var parsedOBJh = null; //Parsed OBJ file
var parsedOBJr = null; //Parsed OBJ file

function onLoad() {
	let canvas = document.getElementById('webglCanvas');
	gl = canvas.getContext('webgl2');
	document.getElementById('boton_dibujar').disabled = false;
	document.getElementById('boton_cargar').disabled = true;

	onModelLoad();
	let indicesTh = parsedOBJh.indices;
	indicesh = Utils.indices_triangulos_a_lineas(indicesTh);
	indexcounth = indicesh.length;

	let positionsh = parsedOBJh.positions;
	let colorsh = Utils.blanquear(positionsh.length);

	let indicesTr = parsedOBJr.indices;
	indicesr = Utils.indices_triangulos_a_lineas(indicesTr);
	indexcountr = indicesr.length;

	let positionsr = parsedOBJr.positions;
	let colorsr = Utils.blanquear(positionsr.length);

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


	// posicionamiento del cohete
	//
	// mat4.translate(modelMatrixr,modelMatrixr,[0,15,-20]);
	// mat4.rotateZ(modelMatrixr,modelMatrixr,glMatrix.toRadian(90));

	gl.enable(gl.DEPTH_TEST);
}

function onRender() {
	let select_camara = document.getElementById("camara_seleccionada");
	let camara_seleccionada = select_camara.options[select_camara.selectedIndex].text;

	Utils.deshabilitar_movimientos_y_camara(false);
	if ( camara_seleccionada == "Automática" ) { Utils.deshabilitar_sliders(true); }
	else { Utils.deshabilitar_sliders(false) }

	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	viewMatrix = camara.lookAt();

	gl.useProgram(shaderProgram);
	gl.uniformMatrix4fv(u_modelMatrix, false, modelMatrixh);
	gl.uniformMatrix4fv(u_viewMatrix, false, viewMatrix);
	gl.uniformMatrix4fv(u_projMatrix, false, camara.matriz_proyeccion());

	// dibujar casa
	gl.bindVertexArray(vaoh);
	gl.drawElements(gl.LINES, indexcounth, gl.UNSIGNED_INT, 0);

	gl.bindVertexArray(null);

	// editar y dibujar cohete
	gl.uniformMatrix4fv(u_modelMatrix, false, modelMatrixr);
	gl.bindVertexArray(vaor);

	gl.drawElements(gl.LINES, indexcountr, gl.UNSIGNED_INT, 0);

	gl.bindVertexArray(null);
	gl.useProgram(null);
}

function rotar_cohete(slider) {
	let angulo = parseFloat(slider.value); //convertir deg a rad
	//modelMatrixr = mat4.create();
	mat4.rotateZ(modelMatrixr,modelMatrixr,glMatrix.toRadian(angulo));
	onRender();
}

function orbitar_cohete(slider) {
	let angulo = parseFloat(slider.value); //convertir deg a rad
	modelMatrixr = mat4.create();
	mat4.rotateY(modelMatrixr,modelMatrixr,glMatrix.toRadian(angulo));
	onRender();
}

function rotar_casa(slider) {
	let angulo = parseFloat(slider.value); //convertir deg a rad
	modelMatrixh = mat4.create();
	mat4.rotateY(modelMatrixh,modelMatrixh,glMatrix.toRadian(angulo));
	onRender();
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
	parsedOBJr = OBJParser.parseFile(rocketT);
}
