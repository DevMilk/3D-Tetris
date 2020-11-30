"use strict";

var canvas;
var gl;

var sizeScale = 1;
var objects = []
var mainObject = null;
var mainObjectIndex = 1;
var cameraTheta = [1,1,1];
var camera_theta_loc;
var idle_rotation_vel = 1.0;
const gravity_speed_init = 0.005;
var gravity_speed = gravity_speed_init;
var direction = 1;
var move_scale =0.1
var rotate_scale = 4;
const directions = {
	"RIGHT"	: [ 0,1],
	"LEFT"	: [0,-1],
	"UP"	: [ 1,1],
	"DOWN" 	: [1,-1],
//	"FRONT" : [2,1]

}
var program;


class Object{
	constructor(vertex,vertexColors,indices){
		this.vertices = [];
		this.colors = [];
		this.theta = [1,1,1];
		for(var i=0;i<vertex.length;i++){
			this.vertices.push([0,0,0]);
			for(var j=0;j<3;j++)
				this.vertices[i][j] = vertex[i][j];
		}		
		
		for(i=0;i<vertexColors.length;i++)
			this.colors.push(vec4(...vertexColors[i]));
		
		this.indices = indices;
	}
	
	setTheta = function(theta){this.theta = [...theta]};
	setThetaLoc = function(thetaLoc){this.thetaLoc = thetaLoc};
	setVertices = function(vertices){ this.vertices = vertices; }
	changeTheta = function(index,new_value){this.theta[index] = new_value%360};
	getTheta = function(){ return this.theta; }
	getThetaLoc = function(){ return this.thetaLoc; }
	getVertices = function(){ return this.vertices; }
	getColors = function(){ return this.colors; }
	getIndices = function(){ return this.indices; }
		
	
	
}




function buffer(obj){
	
    var iBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(obj.getIndices()), gl.STATIC_DRAW);

    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(obj.getColors()), gl.STATIC_DRAW );
	
    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(obj.getVertices()), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

	if(obj.getThetaLoc()==null)
		obj.setThetaLoc(gl.getUniformLocation(program, "theta"));
	
}
window.onload = function init()
{
	
	
    canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);;
	console.log("Sahnedeki obje sayısı: ",initObjects.length);
	
	
	program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
	
    for(var i=0;i<initObjects.length;i++){
		objects.push(new Object(initObjects[i].vertices,initObjects[i].colors,initObjects[i].indices));	
		buffer(objects[i]);
	}
	camera_theta_loc = gl.getUniformLocation(program, "camera");
	mainObject = objects[mainObjectIndex];
		
	render();
}


function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	
	for(var i=0;i<objects.length;i++){
		
		if(getBottom(objects[i].getVertices()) > -1)
			move(objects[i],gravity_speed,directions.DOWN);
		//objects[i].changeTheta(0,objects[i].getTheta()[0] + idle_rotation_vel);
		if(i==1)
			console.log("bottom:" ,getBottom(objects[i].getVertices()));
		gl.uniform3fv(objects[i].getThetaLoc(), objects[i].getTheta()); //theta, html'de uniform vec3 olarak tanımlandı, uniform3fv ile değer aktarması yapıyoruz
		
		buffer(objects[i]);
		gl.drawElements(gl.TRIANGLES, objects[i].getIndices().length, gl.UNSIGNED_BYTE, 0);
		
	}

    requestAnimFrame( render );
}


window.onkeydown = function(event) {
	let key = String.fromCharCode(event.keyCode).toLowerCase();
	switch(key){
		
		//ROTATİON
		case '&': //yukarı
			rotate(mainObject,directions.UP);
			break;
		case '%':  //sol
			rotate(mainObject,directions.LEFT);
			break;
		case '(': //aşağı
			rotate(mainObject,directions.DOWN);
			break;
		case '\'': //sağ
			rotate(mainObject,directions.RIGHT);
			break;
			
		//TODO MOVEMENT, Rotationdan sonraki directionlara bak
		case 'w':
			move(mainObject,move_scale,directions.UP);
			break;
		case 'a':
			move(mainObject,move_scale,directions.LEFT);
			break;
		case 's':
			move(mainObject,move_scale,directions.DOWN);
			break;
		case 'd':
			move(mainObject,move_scale,directions.RIGHT);
			break;
		case ' ':
			gravity_speed = 0.01;
			break;
		case 'c':
			cameraTheta[1] +=1;
			gl.uniform3fv(camera_theta_loc, cameraTheta);
			break;
			
	}
}

window.onkeyup = function(){
	let key = String.fromCharCode(event.keyCode).toLowerCase();
	
	switch(key){
		case ' ':
			gravity_speed = gravity_speed_init;
			break;
		
	}
	
}
function rotate(object,dir_enum){
	let index = 1 - dir_enum[0];
	let direction = (2*index-1)*dir_enum[1]; // 0 ise negatif, 1 ise pozitifi 
	object.changeTheta(index,object.getTheta()[index]+direction*rotate_scale); 
}

function move(object,move_scale,dir_enum){
	
	let index = dir_enum[0];
	let direction = dir_enum[1];
	let pay = 180 - Math.abs(object.getTheta()[1-index]);
	let direction_rotation_fix = pay/Math.abs(pay) ; //180 derece olayı var
	let vertices = object.getVertices();
	for(let i=0;i<vertices.length;i++)
		vertices[i][index]+=direction*move_scale*direction_rotation_fix;
	object.setVertices(vertices);
}

//Vertice'lerden y ekseninde en aşağıda olan pixelin koordinatını döndürür
function getBottom(vertices){
	let min = 1; // y'si en küçük olan en aşağıda, x'i en büyük olan en sağda
	for(var i=0;i<vertices.length;i++)
			if(vertices[i][1] < min)
				min = vertices[i][1];
	return min;
}
