class Utils {

	static deshabilitar_sliders(value) {
		document.getElementById("range_paneo").disabled = value;
		document.getElementById("range_zoom").disabled = value;
		document.getElementById("range_altura").disabled = value;
	}

	static deshabilitar_movimientos_y_camara(value) {
		document.getElementById("range_casa").disabled = value;
		document.getElementById("range_cohete").disabled = value;
		document.getElementById("range_orbita").disabled = value;
		document.getElementById("camara_seleccionada").disabled = value;
		document.getElementById("boton_reset").disabled = value;
	}

	static blanquear(length) {
		let colors = new Array(length);
		let i = 0;
		while (i < length) colors[i++] = 255;
		return colors;
	}

	static indices_triangulos_a_lineas(indicesT) {
		let indicesL = new Array(indicesT.length*3);
		let pri, segu, terc, iT = 0, iL = 0;
		while (iT < indicesT.length) {
			pri = indicesT[iT++];
			segu = indicesT[iT++];
			terc = indicesT[iT++];
			indicesL[iL++] = pri; indicesL[iL++] = segu;
			indicesL[iL++] = segu; indicesL[iL++] = terc;
			indicesL[iL++] = terc; indicesL[iL++] = pri;
		}
		return indicesL;
	}

	static cartesianas_a_esfericas(cartesianas) {
		let x = cartesianas[0], y = cartesianas[1], z = cartesianas[2];
		let esfericas = new Array(3); // ro, tita y fi
		esfericas[0] = Math.sqrt( Math.pow(x,2)+Math.pow(y,2)+Math.pow(z,2) ); // ro
		esfericas[1] = Math.atan( Math.sqrt(Math.pow(x,2)+Math.pow(y,2))/z ); // tita
		esfericas[2] = Math.atan(y/x); // fi
		return esfericas;
	}

	static esfericas_a_cartesianas(esfericas) {
		let p = esfericas[0], t = esfericas[1], f = esfericas[2];
		let cartesianas = new Array(3);
		cartesianas[0] = p*Math.sin(t)*Math.cos(f);
		cartesianas[1] = p*Math.sin(t)*Math.sin(f);
		cartesianas[2] = p*Math.cos(t);
		return cartesianas;
	}

	static onFileChooser(event, onLoadFileHandler) {
		//Code from https://stackoverflow.com/questions/750032/reading-file-contents-on-the-client-side-in-javascript-in-various-browsers
		if (typeof window.FileReader !== 'function') {
			throw ("The file API isn't supported on this browser.");
		}
		let input = event.target;
		if (!input) {
			throw ("The browser does not properly implement the event object");
		}
		if (!input.files) {
			throw ("This browser does not support the 'files' property of the file input.");
		}
		if (!input.files[0]) {
			return undefined;
		}
		let file = input.files[0];
		let fileReader = new FileReader();
		fileReader.onload = onLoadFileHandler;
		fileReader.readAsText(file);
	}

	static reArrangeIndicesToRenderWithLines(indices) {
		let result = [];
		let count = indices.length;
		let index = 0;
		for (let i = 0; i < count; i = i + 3) {
			result.push(indices[i]);
			result.push(indices[i + 1]);
			result.push(indices[i + 1]);
			result.push(indices[i + 2]);
			result.push(indices[i + 2]);
			result.push(indices[i]);
		}
		return result;
	}

	static hexToRgbInt(hex) {
		let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return {
			r: parseInt(result[1], 16),
			g: parseInt(result[2], 16),
			b: parseInt(result[3], 16)
		};
	}

	static hexToRgbFloat(hex) {
		let rgbInt = Utils.hexToRgbInt(hex);
		return {
			r: parseFloat(rgbInt.r) / 255.0,
			g: parseFloat(rgbInt.g) / 255.0,
			b: parseFloat(rgbInt.b) / 255.0,
		};
	}

	static hexToRgbFloatArray(hex) {
		let rgbFloat = Utils.hexToRgbFloat(hex);
		return [rgbFloat.r, rgbFloat.g, rgbFloat.b];
	}
}
