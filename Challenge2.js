{
	init: function(elevators, floors) {
		var elevator = elevators[0]; // Let's use the first elevator
		var floorsWanted = [];
		for (var index = 0; index < floors.length; index++){
			floorsWanted.push(false);
		}

		//adds button event handlers to each floor object
		floors.forEach(function(element){
			addButtonEvents(element);
		});

		function addButtonEvents(floor){
			floor.on("up_button_pressed down_button_pressed", function(){
				floorsWanted[floor.floorNum()] = true;
			});
		}

		// Whenever the elevator is idle (has no more queued destinations) ...
		elevator.on("idle", function() {
			for (var i = 1; i<= 4; i++){
				if (isFloorWanted(elevator, i)){
					go(elevator, i);
				}
			}
			elevator.goToFloor(0);
		});

		//checks if an elevator or floor button is pressed
		function isFloorWanted(elevator, floor){
			if (elevator.getPressedFloors().includes(floor) || floorsWanted[floor]){
				return true;
			} else {
				return false;
			}
		}

		//goes to a floor and turns off the wanted status
		function go(elevator, floor){
			elevator.goToFloor(floor);
			floorsWanted[floor] = false;
			console.log(floorsWanted);
		}
	},
	update: function(dt, elevators, floors) {
		// We normally don't need to do anything here


		//Okay, so my idea is to have a floors wanted array, that stores boolean values for all the floors.
		//I'll make a new elevator.go() function that goes to the floor and sets the value to false for that floor.
		//And when a button is pressed, I'll set the value to true.
	}
}