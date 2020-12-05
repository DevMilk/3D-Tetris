var edge_length = 0.1;
initObjects = [
  /*{
  "vertices": [
        [-0.1, -0.1, -0.1],
        [0.1, -0.1, -0.1],
        [0.0, -0.1,  0.1],
        [0.0,  0.1,  0.1]
    ],
  "colors": [
        [0.0, 0.0, 0.0, 1.0] ,  
        [1.0, 0.0, 0.0, 1.0] ,  
        [1.0, 1.0, 0.0, 1.0] ,  
        [0.0, 1.0, 1.0, 1.0]    
    ],
  "indices": [ 
    1, 0, 3,
    0, 2, 1,
	1, 2, 3,
  	0, 2, 3
  ]
  
  }, //OBJE*/
 
  
   {
  "vertices": [
        [-0.6, -0.9, -0.6],
        [-0.6, -0.9, 0.6],
        [0.6, -0.9, 0.6],
        [0.6, -0.9, -0.6],
		[-0.6, -0.95, -0.6],
        [-0.6, -0.95, 0.6],
        [0.6, -0.95, 0.6],
        [0.6, -0.95, -0.6]
    ],
  "colors": [
        [0.0, 0.0, 0.4, 1.0] ,  
        [0.0, 0.0, 0.4, 1.0] ,  
        [0.0, 0.0, 0.4, 1.0] ,  
        [0.0, 0.0, 0.4, 1.0] ,
		[1.0, 0.0, 1.0, 1.0] ,  
        [1.0, 0.0, 1.0, 1.0] ,  
        [1.0, 0.0, 1.0, 1.0] ,  
        [1.0, 0.0, 1.0, 1.0]   		
    ],
  "indices": [ 
    0,1,2, 0,2,3, //üst
	4,5,6, 4,6,7, //alt
	0,1,5, 0,5,4, //sol
	3,7,6, 3,6,2, //sağ
	0,3,7, 0,7,4, //arka
	1,5,6, 1,6,2  //ön
	
  ]
  
  }, //DÜZEY
  
  {
  "vertices": [
        [0,0,0],
        [0,0,1], 
        [1,0,1],
        [1,0,0],
		[0,1,0],
		[0,1,1],
		[1,1,1],
		[1,1,0]
    ],
  "colors": [
        [0.0, 0.0, 0.0, 1.0] ,  
        [1.0, 0.0, 0.0, 1.0] ,  
        [1.0, 1.0, 0.0, 1.0] ,  
        [0.0, 1.0, 1.0, 1.0] ,
		[0.0, 0.0, 0.0, 1.0] ,  
        [1.0, 0.0, 0.0, 1.0] ,  
        [1.0, 1.0, 0.0, 1.0] ,  
        [0.0, 1.0, 1.0, 1.0] 		
    ],
  "indices": [ 
    0,1,2,0,2,3,
	0,4,5,0,5,1,
	4,5,6,4,6,7,
	3,2,6,3,6,7,
	1,5,2,1,6,2,
	0,4,7,0,7,3
  ]
  
  }, //BLOK
]
for(var i=0;i<8;i++)
	for(var j=0;j<3;j++)
		initObjects[1].vertices[i][j] *= edge_length;
	
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

