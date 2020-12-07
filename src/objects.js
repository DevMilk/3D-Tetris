var edge_length = 0.1;

let bitMap = [1, 1]
var initObjects = [
	/*DÜZEY*/ createRect(-0.6,-0.7,-0.6,
				1.2,0.05,1.2,
				[[0.0, 0.0, 0.4, 1.0], [1.0, 0.0, 1.0, 1.0]]),
				
    /*KÜP*/ createCube(
			   0,0,0,
			   edge_length,
			   [
					[0.0, 0.0, 0.0, 1.0],
					[0.2, 0.2, 0.2, 1.0]	
			   ]
			 ),

			combineCubes([
							[ //En ön
								[1,1,1], //Üst
								, //Alt
							],
							
							[ //Bir arka
								[]
							]
						],
						edge_length,[[0.8, 0.8, 0.0, 1],[0, 0.8, 0.8, 1],[0.8, 0, 0.8, 1]],-0.1,0.5,0)		
]
	

function quad(indicesOriginal){
	let indices = indicesOriginal;
	for(var j=0;j<indices.length;j++){
		let index = indices[j];
		indices[j] = [index[0],index[1],index[2],index[0],index[2],index[3]]
	}
	indices = [].concat.apply([], indices);
	return indices;
}
function getMinMax(rectangle){
	let vertex = Array.isArray(rectangle) ? rectangle: rectangle.vertices;
	let pivot = 0;
	let refer = 6;
	let minMaxes = [[10,-10],[10,-10],[10,-10]];
	for(var i =0;i<vertex.length;i++){
		for(var cord=0;cord<3;cord++){
			minMaxes[cord][0]   = Math.min(vertex[i][cord],minMaxes[cord][0]);
			minMaxes[cord][1] = Math.max(vertex[i][cord], minMaxes[cord][1]);
		}	
	}
	return minMaxes;
	
}

function getBottom(vertices){
	let min = 1; // y'si en küçük olan en aşağıda, x'i en büyük olan en sağda
	for(var i=0;i<vertices.length;i++)
			if(vertices[i][1] < min)
				min = vertices[i][1];
	return min;
}