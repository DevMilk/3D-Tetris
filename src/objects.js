var edge_length = 0.1; //edge length of cubes
var w_count = 4;
var h_count = 4;
var w = edge_length*w_count;
var h = 0.05;
var d = edge_length*h_count;
var ground = -0.7;
var l = 0.01;

//First objects
var initObjects = [
	/*DÜZEY*/ createRect(-0.1,ground,-0.3,
				w,h,d,
				[[0.7, 0.7, 0.7, 1.0]]),
				
				/*createRect(-0.5,0.3,-0.6,
				0.1,w+0.4,d,
				[[0.0, 0.0, 1.0, 1.0]]),
				
				createRect(-0.4,0.3,-0.6-edge_length,
				w,w+0.4,0.1,
				[[0.0, 0.0, 1.0, 1.0]]),
				
				createRect(-0.4,0.3,-0.6+d,
				w,w+0.4,0.1,
				[[0.0, 0.0, 1.0, 1.0]]),
				
				createRect(-0.4+w,0.3,-0.6,
				0.1,w+0.4,d,
				[[0.0, 0.0, 1.0, 1.0]]),*/

			combineCubes([
						 //En ön
							[3,4,4,4], //Üst
							
						],
						edge_length,[[0.8, 0.8, 0.0, 1]],-0.1,0.5,0)		
]
	
//Get 4 indices and generate 6 indices for cube
function quad(indicesOriginal){
	let indices = indicesOriginal;
	for(var j=0;j<indices.length;j++){
		let index = indices[j];
		indices[j] = [index[0],index[1],index[2],index[0],index[2],index[3]]
	}
	indices = [].concat.apply([], indices);
	return indices;
}

//return Minimum and Maximum per coordinates of given rectangle object or vertices
function getMinMax(rectangle){
	let vertex = rectangle.vertices;
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
