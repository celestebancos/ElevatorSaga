
{
	init: function(elevators, floors) {
		//elevators is an array of elevator objects
		//the .foreach() function loops through each item in the array and does stuff with it
		//the elevator parameter takes the elevator object selected from the array by the .foreach() function and passes it into the addEvents function 
		elevators.forEach(function(elevator){
			addEvents(elevator);
		});

		//adds event handlers to whichever elevator object is passed in as a parameter 
		function addEvents(elevator){
			//This event is triggered when the elevator has completed all its tasks and is not doing anything.	
			elevator.on("idle", function(){
				//your code here 
				elevator.goToFloor(0);
				elevator.goToFloor(1);
			});

			//This event is triggered when a passenger has pressed a button inside the elevator.	
			elevator.on("floor_button_pressed", function(floorNum){
				//your code here 
			});

			//This event is triggered slightly before the elevator will pass a floor (only if the floor is not the destination floor).
			elevator.on("passing_floor", function(floorNum, direction){
				//your code here 
			});

			//This event is triggered when the elevator has arrived at a floor.	
			elevator.on("stopped_at_floor", function(floorNum){
				//your code here 
			});
		}
	},
	update: function(dt, elevators, floors) {
		// We normally don't need to do anything here
	}
}