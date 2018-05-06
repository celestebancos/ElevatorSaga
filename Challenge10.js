{
	init: function(elevators, floors) {
		var topFloor = floors[floors.length - 1].floorNum();

		//initialize buttons array
		var buttons = [];
		floors.forEach(function(){
			buttons.push({up: false, down: false, elevator: false});
		});

		//initialize floorsWanted array (get rid of this at some point!)
		var floorsWanted = [];
		for (var index = 0; index < floors.length; index++){
			floorsWanted.push(false);
		}

		//add button event handlers to each floor object
		floors.forEach(function(floor){
			addButtonEvents(floor);
		});
		function addButtonEvents(floor){
			floor.on("up_button_pressed", function(){
				buttons[floor.floorNum()].up = true;
			});
			floor.on("down_button_pressed", function(){
				buttons[floor.floorNum()].down = true;
			});
		}

		// initialize elevators with idle event
		elevators.forEach(function(elevator){
			addIdleEvent(elevator);
		});
		function addIdleEvent(elevator){
			elevator.on("idle", function(){
				console.log("I have nothing to do.");
				var currentPosition = getPosition(elevator);
				console.log(`I am on floor ${currentPosition.floor} going ${currentPosition.direction}`);
				go(elevator, currentPosition.next().floor);
			});
		}

		//go to a floor if it is wanted
		// function tryFloor(elevator, floor){
		// 	if (isFloorWanted(elevator, floor) || floor === 0){ 			//go to the selected floor if it is wanted
		// 		go(elevator, floor);
		// 	} else {
		// 		console.log("Trying floor " + nextFloor(floor));
		// 		tryFloor(nextFloor(floor));
		// 	}
		// }

		// function nextFloor(floor, direction){
		// 	if (floor === 0 || direction == "up"  && floor < topFloor){	 		//try the next floor up if at the bottom of going up
		// 		return floor + 1;
		// 	} 
		// 	else if (floor == topFloor || direction == "down" && floor > 0){		//try the next floor down if at the top or going down
		// 		return floor - 1;
		// 	}
		// }		

		//return the current position of the elevator
		function getPosition(elevator){
			var floor = elevator.currentFloor();
			var direction;
			if (elevator.goingUpIndicator()){
				direction = "up";
			} else {
				direction = "down";
			}
			var position = new Position(floor, direction);
			return position;
		}

		//create a position object
		function Position(floor, direction){
			this.floor = floor;
			this.direction = direction;
			this.next = function() {
				var nextFloor;
				var nextDirection;
				if (floor === 0 || direction == "up"  && floor < topFloor){	 		//try the next floor up if at the bottom of going up
					nextFloor = floor + 1;
					if (nextFloor == topFloor){
						nextDirection = "down";
					} else {
						nextDirection = "up";
					}
				} 
				else if (floor == topFloor || direction == "down" && floor > 0){		//try the next floor down if at the top or going down
					nextFloor = floor - 1;
					if (nextFloor === 0){
						nextDirection = "up";
					} else {
						nextDirection = "down";
					}					
				}
				return new Position (nextFloor, nextDirection);
			};
		}

		//check if an elevator or floor button is pressed
		function isFloorWanted(elevator, floor){
			if (elevator.getPressedFloors().includes(floor) || buttons[floor].up || buttons[floor].down){
				return true;
			} else {
				return false;
			}
		}

		//go to a floor and turns off the wanted status
		function go(elevator, floor){
			console.log("I'm going to floor " + floor);
			elevator.goToFloor(floor);
			if (elevator.goingUpIndicator()){
				buttons[floor].up = false;
			}
			if (elevator.goingDownIndicator()){
				buttons[floor].down = false;
			}
			floorsWanted[floor] = false;
		}

		//change indicators
		function indicateUp(elevator){
			elevator.goingUpIndicator(true);
			elevator.goingDownIndicator(false);
			console.log("Let's go up.");
		}
		function indicateDown(elevator){
			elevator.goingUpIndicator(false);
			elevator.goingDownIndicator(true);
			console.log("Let's go down.");
		} 
		function indicateBoth(elevator){
			elevator.goingUpIndicator(true);
			elevator.goingDownIndicator(true);
			console.log("I could go up or down.");
		}
	},
	update: function(dt, elevators, floors) {
		// We normally don't need to do anything here
	}
}