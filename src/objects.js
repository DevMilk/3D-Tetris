var edge_length = 0.1;

let bitMap = [1, 1]
initObjects = [
	/*DÜZEY*/ createRect(-0.6,-0.7,-0.6,
				1.2,0.05,1.2,
				[[0.0, 0.0, 0.4, 1.0], [1.0, 0.0, 1.0, 1.0]]),
				
    /*KÜP createCube(
			   0,0,0,
			   edge_length,
			   [
					[0.0, 0.0, 0.0, 1.0],
					[0.2, 0.2, 0.2, 1.0]	
			   ]
			 ),*/

			combineCubes([[[1,0],[1]],[[1,1,1]]],edge_length,[[0.8, 0.8, 0.8, 1],[0, 0.8, 0.8, 1],[0.8, 0, 0.8, 1]],0,0.5,0)		
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
	
	return [
			[vertex[0][0],vertex[6][0]], //minX, maxX
			[vertex[6][1],vertex[0][1]], //minY, maxY
			[vertex[0][2],vertex[6][2]]  //minZ, maxZ
		   ]
	
}

function getBottom(vertices){
	let min = 1; // y'si en küçük olan en aşağıda, x'i en büyük olan en sağda
	for(var i=0;i<vertices.length;i++)
			if(vertices[i][1] < min)
				min = vertices[i][1];
	return min;
}



	/*
function getLowerMostPixels(object){
	//Her x ve z değerinin en küçük y değerini alacağız
	let min = 1;
	let lowerMosts = []
	let xz_yMap = {{}};
	for(var i=0;i<object.vertices.length;i++){
		let valueInMap = xz_yMap[object.vertices[i][0]][object.vertices[i][2]];
		let valueCurrent = object.vertices[i][1];
		if(valueInMap== null || valueInMap > valueCurrent)
			xz_yMap[object.vertices[i][0]][object.vertices[i][2]] = valueCurrent;
	}
	
	for(var xKey in xz_yMap)
		for(var zKey in xz_yMap[iKey])
			lowerMosts.push([xKey,xz_yMap[xKey][zKey],zKey);
		
	return lowerMosts;
	
}
   /* var vertices = [
        vec3( -0.1*sizeScale, -0.1*sizeScale, -0.1*sizeScale ),
        vec3(  0.1*sizeScale, -0.1*sizeScale, -0.1*sizeScale ),
        vec3(  0.0, -0.1*sizeScale,  0.1*sizeScale ),
        vec3(  0.0,  0.1*sizeScale,  0.1*sizeScale )
    ];
    var vertexColors = [
        vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
        vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
        vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
        vec4( 0.0, 1.0, 1.0, 1.0 )   // cyan
    ];

// indices of the 12 triangles that compise the cube

var indices = [ //Burada sıra farketmiyor. Verilen her 3 vertex bir yüz oluyor
    1, 0, 3,
    0, 2, 1,
	1, 2, 3,
	0, 2, 3
];*/
//numVertices = indices.length; //Eğer drawElements ile yapmaya çalışıyorsan numVertices'i indis uzunluğuna eşitle.

