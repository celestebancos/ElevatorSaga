{
	init: function(elevators, floors) {
		var elevator = elevators[0];
		// var floorsWanted = [];
		// for (index = 0; index <= floors.length(); index++){
		// 	floorsWanted.push(false);
		// 	console.log(index);
		// }
		// console.log(floorsWanted);

		elevator.on("idle", function() {
			for (i = 1; i<= 4; i++){
				console.log("Floor " + i + "pressed = " + isButtonPressed(elevator, i));
				if (isButtonPressed(elevator, i)){
					elevator.goToFloor(i);
				}
			}
			elevator.goToFloor(0);
		});

		function isButtonPressed (elevator, floor){
			if (elevator.getPressedFloors().includes(floor)){
				return true;
			} else {
				return false;
			}
		}
	},

		update: function(dt, elevators, floors) {
		}
}

//Okay, so my idea is to have a floors wanted array, that stores boolean values for all the floors.
//I'll make a new elevator.go() function that goes to the floor and sets the value to false for that floor.
//And when a button is pressed, I'll set the value to true.