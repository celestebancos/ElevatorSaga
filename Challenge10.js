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

		// adds event handler to elevators
		elevators.forEach(function(element){
			chooseNextFloor(element);
		});

		function chooseNextFloor(elevator){
			elevator.on("stopped_at_floor", function(){
				console.log(elevator.loadFactor());
				if(elevator.currentFloor() === 0){
					console.log("zero");
					tryFloor(elevator, floors.length - 1);
				} else if(elevator.loadFactor() > .7){
					console.log("heavy");
					go(elevator, 0);
				} else {
					console.log("else");
					tryFloor(elevator, elevator.currentFloor() - 1);						
				}
			});
		}

		//goes to a floor if it is wanted
		function tryFloor(elevator, floor){
			if (isFloorWanted(elevator, floor)){
				go(elevator, floor);
			} else if (floor > 0){
				tryFloor(elevator, floor - 1);
			}
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