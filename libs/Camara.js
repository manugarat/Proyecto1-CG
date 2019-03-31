class Camara {

    reset() {
        this.eye = [default_zoom,default_altura,0];
        this.target = [0, 0, 0];
        this.up = [0, 1, 0];
        // reestablecer sliders de la interfaz
        document.getElementById("range_paneo").value = "0";
        document.getElementById("range_zoom").value = "47";
        document.getElementById("range_altura").value = "40";
    }

	constructor() {
		this.reset(); // para reutilizar código
        this.viewMatrix = mat4.create();


    	this.fovy = glMatrix.toRadian(50);
    	this.aspect = 1;
    	this.zNear = 0.1;
    	this.zFar = 130;
        this.projMatrix = mat4.create();
    	mat4.perspective(this.projMatrix, this.fovy, this.aspect, this.zNear, this.zFar);
	}

	lookAt() {
        mat4.lookAt(this.viewMatrix, this.eye, this.target, this.up);
        return this.viewMatrix;
    }

    matriz_proyeccion() { return this.projMatrix; }

    camara_automatica() {

    }

    paneo(slider) { this.target[2] = parseFloat(slider.value); }

    zoom(slider) {
		let eye_esfericas = Utils.cartesianas_a_esfericas(this.eye);
        eye_esfericas[0] = parseFloat(slider.value);
        this.eye = Utils.esfericas_a_cartesianas(eye_esfericas);
	}

    altura(slider) { this.eye[1] = parseFloat(slider.value); }
}
