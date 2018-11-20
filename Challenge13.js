{
	init: function(elevators, floors) {
		//This version wraps each elevator into a controller object
		//It doesn't pass all the earlier challenges

		//------------ INITIALIZATION -------------
		var startTime = new Date(Date.now());
		var topFloor = floors[floors.length - 1].floorNum();
		var loadThreshold = 0.65;
		var controllers = [];
		var controllersIndex = 0;
		var upButtons = [];
		var downButtons = [];

		//put some space between the new log and the old stuff
		console.log("\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n"); 		

		//populate arrays of direction buttons
		floors.forEach(function(){
			upButtons.push(false);
			downButtons.push(false);
		});

		//add event handlers and controllers
		//floors.forEach(addUpButtonEvent);
		//floors.forEach(addDownButtonEvent);
		floors.forEach(addFloorEvents);
		elevators.forEach(addElevatorControllers);
		controllers.forEach(addElevatorEvents);


		//------------ FLOORS -------------

		function addFloorEvents(floor){
			addButtonEvent(floor, "up");
			addButtonEvent(floor, "down");
		}

		function addButtonEvent(floor, direction){
			var position = new Position(floor.floorNum(), direction);
			floor.on(direction + "_button_pressed", function(){
				recordButtonPress(position);
				requestElevators(position);
			});
		}

		function recordButtonPress(position){
			if (position.direction == "up"){
				upButtons[position.floor] = true;
			} else if (position.direction == "down"){
				downButtons[position.floor] = true;
			}
		}

		function requestElevators(position){
			var bids = [];
			controllers.forEach(function(controller){
				bids.push(controller.request(position));
			});					
			console.log(bids);
		}

		//------------ ELEVATORS -------------

		//populate controllers array with elevator controller objects

		function addElevatorControllers(elevator){
			var controller = new Controller(elevator, controllersIndex);
			//add the controller to the array of controllers and increments the index
			controllersIndex = controllers.push(controller);
		}

		function addElevatorEvents(controller){
			controller.elevator.on("idle", function(){
				controller.onIdle(controller);
			});
			controller.elevator.on("floor_button_pressed", function(floorNum){
				controller.onFloorButtonPressed(controller, floorNum);
			});
			controller.elevator.on("stopped_at_floor", function(floorNum){
				controller.onStopped(controller, floorNum);
			});
		}

		//create a controller object for an elevator
		function Controller(elevator, elevatorNum){
			this.elevator = elevator;
			this.chatty = false;
			this.num = elevatorNum;
			//initialize numberButtons array
			//the array index will represent the floor number and the value will represent the time pressed.
			//0 means not pressed.
			this.numberButtons = []; 
			var index;
			for (index = 0; index <= topFloor; index++){
				this.numberButtons.push(0);
			}

			this.onIdle = function(controller){
				controller.say("I have nothing to do.");
				var currentPosition = controller.getPosition();
				this.getMostUrgentDropOff();
				//controller.say(`I am on floor ${currentPosition.floor} going ${currentPosition.direction}`);
				controller.tryFloor(currentPosition.nextPosition());
				//controller.go(currentPosition.nextPosition());
			};

			this.onFloorButtonPressed = function(controller, floorNum){
				this.numberButtons[floorNum] = newTime();
			};

			this.onStopped = function(controller, floorNum){
				if (this.numberButtons[floorNum] > 0){				
					var timeElapsed = newTime() - this.numberButtons[floorNum];
					var secondsElapsed = timeElapsed / 1000;
					//console.log(`${secondsElapsed} to reach Floor ${floorNum}.`);
					this.numberButtons[floorNum] = 0;
				} 
			};

			this.getMostUrgentDropOff = function(){
				var mostUrgentDropOff = findEarliestIndex(this.numberButtons); 
				//console.log("Most Urgent DropOff: " + mostUrgentDropOff);
				return mostUrgentDropOff;
			};

			this.say = function(text){
				if (this.chatty){
					console.log(`Elevator ${this.num}: ${text}`);
				}
			};

			//go to a floor if it is wanted
			this.tryFloor = function(position){
				if (this.isCurrentPosition(position)){
					this.say("I don't see anywhere to go.");
					//return; //stops the function to avoid an infinite loop
				} else if (this.isGoodStop(position)){ 			//go to the selected floor if it is a good place to stop
					this.go(position);
				} else {
					this.tryFloor(position.nextPosition());
				}
			};

			//check if an elevator or floor button is pressed
			this.isGoodStop = function(position){
				var floor = position.floor;
				var direction = position.direction;

				if (direction == "down" || floor === 0){
					return this.isGoodPickUp(position) || this.isGoodDropOff(position);
				} else if (direction == "up"){
					return this.isGoodPickUp(position) || this.isGoodDropOff(position); 
				}
			};	

			this.isGoodPickUp = function(position){
				var floor = position.floor;
				var direction = position.direction;
				if (!this.isFull() || this.elevator.getPressedFloors().includes(floor)){	//if the elevator has or will have space

					if (direction == "up" && upButtons[floor]){
						return true;
					} else if (direction == "down" && downButtons[floor]){
						return true;
					}
				}
				return false;
			};

			this.isGoodDropOff = function(position){
				if (this.elevator.getPressedFloors().includes(position.floor)){
					return true;
				}
			};

			this.isCurrentPosition = function(position){
				var elevatorPosition = this.getPosition();
				if (position.floor == elevatorPosition.floor && position.direction == elevatorPosition.direction){
					return true;
				} else {
					return false;
				}
			};

			//go to a floor and turns off the wanted status
			this.go = function(position){
				var floor = position.floor;
				var direction = position.direction;
				//this.say(`I am ${Math.round(this.elevator.loadFactor()*100)}% full.`);
				this.say(`I'm going to floor ${floor}`);
				this.elevator.goToFloor(floor);
				if (direction == "up"){
					this.indicateUp(elevator);
					upButtons[floor] = false;
				} else {
					this.indicateDown(elevator);
					downButtons[floor] = false;
				}
			};
	
			//check if an elevator is full
			this.isFull = function(){
				if (this.elevator.loadFactor() > loadThreshold){
					this.say("I'm full.");
					return true;
				} else {
					return false;
				}
			};

			//return the current position of the elevator
			this.getPosition = function(){
				var floor = this.elevator.currentFloor();
				var direction;
				if (this.elevator.goingUpIndicator()){
					direction = "up";
				} else {
					direction = "down";
				}
				var position = new Position(floor, direction);
				return position;
			};

			//change indicators
			this.indicateUp = function(){
				this.elevator.goingUpIndicator(true);
				this.elevator.goingDownIndicator(false);
				//this.say("Let's go up.");
			};

			this.indicateDown = function(){
				this.elevator.goingUpIndicator(false);
				this.elevator.goingDownIndicator(true);
				//this.say("Let's go down.");
			};

			this.request = function(position){
				if(this.elevator.destinationQueue.length === 0){
					this.say(`Responding to request from floor ${position.floor}.`);
					var currentPosition = this.getPosition();
					this.tryFloor(currentPosition.nextPosition());
				}
			};
		}

		//return the index of the lowest non-zero value in the array
		function findEarliestIndex(array){
			var earliestTime = newTime();
			var i;
			var indexOfEarliestTime;
			for (i = 0; i < array.length; i ++){
				if (array[i] > 0 && array[i] < earliestTime){
					earliestTime = array[i];
					indexOfEarliestTime = i;
				}
			}
			return indexOfEarliestTime;
		}


		//------------ 	UTILITIES -------------

		//return the current time in milliseconds since the program start time
		function newTime(){
			var absoluteTime = new Date(Date.now());
			var relativeTime = absoluteTime - startTime;
			return relativeTime;
		}

		//create a position object
		function Position(floor, direction){
			this.floor = floor;

			if (direction == "up" || direction == "down"){
				this.direction = direction;
			} else if (direction == true){
				this.direction = "up";
			} else {
				this.direction = "down";
			}

			this.goingUp = function(){
				if (this.direction == "up"){
					return true;
				} else {
					return false;
				}
			};

			this.goingDown = function(){
				if (this.direction == "down"){
					return true;
				} else {
					return false;
				}
			}

			this.nextFloor = function(){
				// if (floor === 0 || direction == "up"  && floor < topFloor){	 			//next floor up if at the bottom or going up

				//Assumes a valid starting position
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
	},
	update: function(dt, elevators, floors) {
		// We normally don't need to do anything here
	}
}