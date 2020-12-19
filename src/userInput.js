var down = false;
var dragBegin;

//Get mouse position
function getMousePos(event) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left)/rect.width -1/2,
      y: (event.clientY - rect.top)/rect.height -1/2
    };
}

//Mouse pressed
window.onmousedown = function(event){
	//Save current mouse position
	dragBegin =  {
	  x: event.clientX,
	  y: event.clientY
	};
	down = true;
			
}

//Mouse released
window.onmouseup= function(event){down = false;}

//Mouse moved
window.onmousemove = function(event){
	if(!down) return;
	
	let x_change = (event.clientX-dragBegin.x)/25;
	let y_change = (event.clientY-dragBegin.y)/25;

	//If pressed mouse button is wheel, event.buttons == 4
	if(event.buttons == 4){
		//Change camera coordinates
		cameraCoord[0] += -x_change/10;
		cameraCoord[1] += y_change/10;
		gl.uniform2fv(cameraCoordLoc, cameraCoord);
	}
	else{
		//Rotate camera for given 
		rotateCamera(directions.LEFT,scale=x_change);
		rotateCamera(directions.UP ,scale=y_change);
	}
	//Update current mouse coordinates
	dragBegin.x = event.clientX;
	dragBegin.y = event.clientY;
	
}

//Mouse Wheel rotated
window.addEventListener('wheel', ({ deltaY }) => {

	//ZOOM
	
	let mousePos = getMousePos(event);
	cameraTheta[3] += deltaY/3000;
	
	//IF zoomed out then get camera coordinates to normal
	if(deltaY>0)
		cameraCoord = [0.2,0];
	
	//Zoom In
	else{
		cameraCoord[0] += -mousePos.x;
		cameraCoord[1] += mousePos.y;
	}

	//Update variables
	gl.uniform2fv(cameraCoordLoc, cameraCoord);
	gl.uniform4fv(camera_theta_loc, cameraTheta);
});

//Key pressed
window.onkeydown = function(event) {
	let key = String.fromCharCode(event.keyCode).toLowerCase();
	
	switch(key){
		
		//Camera Rotation
		case '&': //yukarı
			rotateCamera(directions.UP);
			break;
		case '%':  //sol
			rotateCamera(directions.LEFT);
			break;
		case '(': //aşağı
			rotateCamera(directions.DOWN);
			break;
		case '\'': //sağ
			rotateCamera(directions.RIGHT);
			break;
			
		//Object Rotation
		case 'q':
			rotateSound.play();
			rotateS(objects[objects.length-1],directions.UP);
			break;
		case 'e':
			rotateSound.play();
			rotateS(objects[objects.length-1],directions.LEFT);
			break;
			
		//Object Movement
		case 'w':
			moveSound.play();
			move(objects[objects.length-1],move_scale,directionFix(directions.BEHIND));
			break;
		case 'a':
		
			moveSound.play();
			move(objects[objects.length-1],move_scale,directionFix(directions.LEFT));
			break;
		case 's':
		
			moveSound.play();
			move(objects[objects.length-1],move_scale,directionFix(directions.FRONT));
			break;
		case 'd':
		
			moveSound.play();
			move(objects[objects.length-1],move_scale,directionFix(directions.RIGHT));
			break;
			
		//Gravity
		case ' ':
			gravity_speed = SPACE_SPEED;
			break;
			
	}
}

//Key released
window.onkeyup = function(){
	let key = String.fromCharCode(event.keyCode).toLowerCase();
	
	switch(key){
		//If you release spacebar, set gravity speed to default
		case ' ':
			gravity_speed = gravity_speed_init;
			break;
	}
}
