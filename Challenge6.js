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
				//goes from floor 1 to floor n
				for (var i = 1; i< floors.length; i++){
					if (isFloorWanted(elevator, i)){
						go(elevator, i);
					}
				}
				//goes from floor n-1 to floor 0
				for (var j = floors.length-2; j>= 0; j--){
					if (isFloorWanted(elevator, j)){
						go(elevator, j);
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