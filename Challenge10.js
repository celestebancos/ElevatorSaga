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
				tryFloor(elevator, currentPosition.nextPosition());
				//go(elevator, currentPosition.next().floor);
			});
		}

		//go to a floor if it is wanted
		function tryFloor(elevator, position){
			var floor = position.floor;
			console.log(`Trying floor ${floor}`);
			if (isCurrentPosition(elevator, position)){
				return; //stops the function to avoid an infinite loop
			} else if (isFloorWanted(elevator, floor) || floor === 0){ 			//go to the selected floor if it is wanted
				go(elevator, floor);
			} else {
				tryFloor(elevator, position.nextPosition());
			}
		}

		//check if an elevator or floor button is pressed
		function isFloorWanted(elevator, floor){
			if (elevator.getPressedFloors().includes(floor) || buttons[floor].up || buttons[floor].down){
				return true;
			} else {
				return false;
			}
		}	

		function isCurrentPosition(elevator, position){
			var elevatorPosition = getPosition(elevator);
			if (position.floor == elevatorPosition.floor && position.direction == elevatorPosition.direction){
				return true;
			} else {
				return false;
			}
		}

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

			this.nextFloor = function(){
				// if (floor === 0 || direction == "up"  && floor < topFloor){	 			//next floor up if at the bottom or going up
				if (this.direction == "up"){
					return this.floor + 1;
				}
				//else if (floor == topFloor || direction == "down" && floor > 0){		//next floor down if at the top or going down
				else if (this.direction == "down"){
					return this.floor - 1;
				}
			};

			this.nextDirection = function(){
				if (this.nextFloor() === 0){
					return "up";
				} else if (this.nextFloor() == topFloor){
					return "down";
				} else {
					return this.direction;
				}
			};

			this.nextPosition = function() {
				return new Position (this.nextFloor(), this.nextDirection());
			};
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