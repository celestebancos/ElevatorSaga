{
	init: function(elevators, floors) {
		var topFloor = floors[floors.length - 1].floorNum();
		var loadThreshold = 0.65;
		var chatty = false;
		//put some space between the new log and the old stuff
		console.log("\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n");
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
            say(`I can hold ${elevator.maxPassengerCount()} people.`);
		});
		function addIdleEvent(elevator){
			elevator.on("idle", function(){
				say("I have nothing to do.");
				var currentPosition = getPosition(elevator);
				say(`I am on floor ${currentPosition.floor} going ${currentPosition.direction}`);
				tryFloor(elevator, currentPosition.nextPosition());
				//go(elevator, currentPosition.next().floor);
			});
		}

		//go to a floor if it is wanted
		function tryFloor(elevator, position){
			var floor = position.floor;
			if (isCurrentPosition(elevator, position)){
				return; //stops the function to avoid an infinite loop
			} else if (isRequested(elevator, position)){ 			//go to the selected floor if it is wanted
				go(elevator, position);
			} else {
				tryFloor(elevator, position.nextPosition());
			}
		}

		//check if an elevator or floor button is pressed
		function isRequested(elevator, position){
			var floor = position.floor;
			var direction = position.direction;
			if (elevator.getPressedFloors().includes(floor)){
				return true;
			} else if (isFull(elevator)){
				return false;
			} else if (direction == "up" && buttons[floor].up){
				return true;
			} else if (direction == "down" && buttons[floor].down){
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
		function go(elevator, position){
			var floor = position.floor;
			var direction = position.direction;
			say(`I am ${Math.round(elevator.loadFactor()*100)}% full.`);
			say(`I'm going to floor ${floor}`);
			elevator.goToFloor(floor);
			if (direction == "up"){
				indicateUp(elevator);
				buttons[floor].up = false;
			} else {
				indicateDown(elevator);
				buttons[floor].down = false;
			}
			floorsWanted[floor] = false;
		}

		//check if an elevator is full
		function isFull(elevator){
			if (elevator.loadFactor() > loadThreshold){
				say("I'm too full.");
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

		//change indicators
		function indicateUp(elevator){
			elevator.goingUpIndicator(true);
			elevator.goingDownIndicator(false);
			say("Let's go up.");
		}
		function indicateDown(elevator){
			elevator.goingUpIndicator(false);
			elevator.goingDownIndicator(true);
			say("Let's go down.");
		} 

		function say(text){
			if (chatty){
				console.log(text);
			}
		}
	},
	update: function(dt, elevators, floors) {
		// We normally don't need to do anything here
	}
}