{
	init: function(elevators, floors) {
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

		// adds idle event handler to elevators
		elevators.forEach(function(element){
			idle(element);
		});

		function idle(elevator){
			elevator.on("idle", function(){
				for (var i = 0; i< floors.length; i++){
					if (isFloorWanted(elevator, i)){
						go(elevator, i);
					}
				}
			});
		}

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
		}
	},
	update: function(dt, elevators, floors) {
		// We normally don't need to do anything here
	}
}