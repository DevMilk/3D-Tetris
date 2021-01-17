var down = false;
var dragBegin;
var objectSelected = true;
var leftBorderWidth;
var topBorderWidth;
//Get mouse position
function getMousePos(event,normalize=true) {
    let rect = canvas.getBoundingClientRect();

	if(normalize==false)
		return {
		  x: (event.clientX - rect.left-leftBorderWidth),
		  y: (rect.bottom - event.clientY-topBorderWidth)
		};
	
	return {
		  x: (event.clientX - rect.left)/rect.width -1/2,
		  y: (event.clientY - rect.top)/rect.height -1/2
		};
	
}

var prevColors= null;
//Check if object selected by mouse
function isObjectSelected(event,checkWhenMouseMove=false){

	let pixels = new Uint8Array(4); // A single RGBA value
	let mousePos = getMousePos(event,false);
	let mainObj = objects[objects.length-1];
	
	//If this function not executed on mouse move event, alpha of color is 0 already.
	if(!checkWhenMouseMove){
		prevColors = copy(mainObj.colors);

		for(i=0;i<mainObj.colors.length;i++)
			mainObj.colors[i]= [255,255,255,0];
		
	}
	buffer(mainObj);
	gl.readPixels(mousePos.x, mousePos.y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
	
	if(!checkWhenMouseMove && pixels.reduce((a, b) => a + b, 0) == 0 || pixels[3]!=0){
		mainObj.colors = prevColors;
		prevColors = null;
	}
	return pixels[0]!=0 && pixels[3]==0;
	
}

//Enable or disable Alpha blend option
function EnableAlpha(element){
	if(element.checked){
		gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
		gl.enable(gl.BLEND);
		gl.disable(gl.DEPTH_TEST);
		DISPLAY_WALLS= true;
	}
	else{
		gl.disable(gl.BLEND);
		gl.enable(gl.DEPTH_TEST);
		DISPLAY_WALLS= false;
	}
	
}

//Enable generating object that can grow along y-axis
function objectDepth(element){
	OBJECT_DEPTH = element.checked;
}

//Mouse pressed
window.onmousedown = function(event){
	//Save current mouse position
	dragBegin =  {
	  x: event.clientX,
	  y: event.clientY
	};
	down = true;
	if(event.button!=4)
		objectSelected= isObjectSelected(event);
	
}

//Mouse released
window.onmouseup= function(event){
	down = false;
	if(objectSelected && prevColors != null){
		let mainObj = objects[objects.length-1];
		mainObj.colors = prevColors;
		prevColors = null;
	}
	objectSelected=false;
}

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
		if(objectSelected){
			
				let x_change_new = Math.abs(x_change);
				let y_change_new = Math.abs(y_change);
				let isXChangeEnough = x_change_new>=move_scale;
				let isYChangeEnough = y_change_new>=move_scale;
				
				//If mouse X or Y difference is big enough to move
				if(isXChangeEnough || isYChangeEnough){
					
					//If mouse is not an object then move it
					if(!isObjectSelected(event,true)){
						
						if(isXChangeEnough){
							let directionX = Math.abs(x_change)/x_change > 0 ? directions.RIGHT : directions.LEFT;
							moveSound.play();
							move(objects[objects.length-1],move_scale,directionFix(directionX));
						}
						if(isYChangeEnough){
							let directionZ = Math.abs(y_change)/y_change > 0 ? directions.FRONT : directions.BEHIND;
							moveSound.play();
							move(objects[objects.length-1],move_scale,directionFix(directionZ));
						}
						
					}

				}
			}
		else{
			//Rotate camera for given 
			rotateCamera(directions.LEFT,scale=x_change);
			rotateCamera(directions.UP ,scale=y_change);
		}
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
			if(gravity_speed!=SPACE_SPEED)
				fallSound.play();
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

function touchHandler(event)
{
    var touches = event.changedTouches,
        first = touches[0],
        type = "";
    switch(event.type)
    {
        case "touchstart": type = "mousedown"; break;
        case "touchmove":  type = "mousemove"; break;        
        case "touchend":   type = "mouseup";   break;
        default:           return;
    }

    // initMouseEvent(type, canBubble, cancelable, view, clickCount, 
    //                screenX, screenY, clientX, clientY, ctrlKey, 
    //                altKey, shiftKey, metaKey, button, relatedTarget);

    var simulatedEvent = document.createEvent("MouseEvent");
    simulatedEvent.initMouseEvent(type, true, true, window, 1, 
                                  first.screenX, first.screenY, 
                                  first.clientX, first.clientY, false, 
                                  false, false, false, 0/*left*/, null);

    first.target.dispatchEvent(simulatedEvent);
    event.preventDefault();
}

function init() 
{
    document.addEventListener("touchstart", touchHandler, true);
    document.addEventListener("touchmove", touchHandler, true);
    document.addEventListener("touchend", touchHandler, true);
    document.addEventListener("touchcancel", touchHandler, true);    
}
init();