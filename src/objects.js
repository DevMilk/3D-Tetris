initObjects = [
  {
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
  
  }, //OBJE
 
  {
  "vertices": [
        [0.0,0.0,0.0],
        [0.0,0.0,0.1], 
        [0.1,0.0,0.1],
        [0.1,0.0,0.0],
		[0.0,0.1,0.0],
		[0.0,0.1,0.1],
		[0.1,0.1,0.1],
		[0.1,0.1,0.0]
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
  
  } //OBJE
  
]
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
