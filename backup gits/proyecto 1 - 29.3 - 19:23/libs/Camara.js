class Camara {

	/*
	 *	x = r·sin(tita)cos(fi)
	 *	y = r·sin(tita)sin(fi)
	 *	z = r·cos(tita)
	 */

	constructor() {
		this.p = 20;
		this.t = 1;
		this.f = 1; //ro, tita y fi
		this.eye = Utils.esfericas_a_cartesianas(this.p,this.t,this.f);
        this.target = [0, 0, 0];
        this.up = [0, 1, 0];
        this.viewMatrix = mat4.create();
	}

	lookAt() {
        mat4.lookAt(this.viewMatrix, this.eye, this.target, this.up);
        return this.viewMatrix;
    }

    camara_automatica() {

    }

    paneo(slider) { this.target[2] = parseFloat(slider.value); }

    zoom(slider) {
		this.p = parseFloat(slider.value);
		this.eye = Utils.esfericas_a_cartesianas(this.p,this.t,this.f);
	}

    altura(slider) {

    }

    reset() {
        this.eye = [2, 2, 2];
        this.target = [0, 0, 0];
        this.up = [0, 1, 0];
    }
}
