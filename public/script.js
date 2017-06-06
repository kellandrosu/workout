document.addEventListener("DOMContentLoaded", function(){

	var today = new Date();
	document.getElementById("date").value = today.toISOString().split('T')[0];

	document.getElementById("addWrktBtn").addEventListener("click", addWorkout);

	document.getElementById("workoutTbl").addEventListener("click", function(event){
		
		event.preventDefault();
		
		switch(event.target.name){
			case "edit":
				editWorkout(event);
				break;
			case "delete":
				deleteWorkout(event);
				break;
			case "save":
				saveWorkout(event);
				break;
		}
	});
})

/****************************************************
*			saveWorkout(event)
* saves the inputs of the edited row to the database
****************************************************/
function saveWorkout(event){

	var cells = event.target.parentNode.parentNode.parentNode.children;
	
	var payload = {};
	payload.name = cells[0].firstElementChild.value;
	payload.reps = cells[1].firstElementChild.value;
	payload.weight = cells[2].firstElementChild.value;
	payload.lbs = cells[3].firstElementChild.value;
	payload.date = cells[4].firstElementChild.value;
	payload.id = cells[5].firstElementChild.firstElementChild.value;


	var req = new XMLHttpRequest();
	req.open("POST", "/update", true);
	req.setRequestHeader("Content-Type", "application/json");

	req.addEventListener("load", function(){
		//replace current row with updated row
		if(req.status >= 200 && req.status < 400){
		
		var row = event.target.parentNode.parentNode.parentNode;
		row.textContent = "";
		addRow( JSON.parse(req.responseText), row);
		}
	});
	req.send(JSON.stringify(payload));

}


/*****************************************************
*			deleteWorkout(event)
* handles the click event for the add workout button
******************************************************/
function deleteWorkout(event){
	//send delete request
	var req = new XMLHttpRequest();

	req.open("POST", "/delete", true)
	req.setRequestHeader("Content-Type", "application/json");

	var id = event.target.parentNode.firstElementChild.value;
	
	req.addEventListener("load", function(){
		if(req.status >= 200 && req.status < 400){

			console.log("success");
			//delete from table
			event.target.parentNode.parentNode.parentNode.remove();

		}
	});
	
	req.send( JSON.stringify( { "id": id }));
	
}

/*****************************************************
*			addWorkout(event)
* handles the click event for the add workout button
******************************************************/
function addWorkout(event){

	event.preventDefault();

	var payload = {};
	//create payload
	payload.name = document.getElementById("name").value;
	payload.reps = document.getElementById("reps").value;
	payload.weight = document.getElementById("weight").value;
	payload.date = document.getElementById("date").value;
	payload.lbs = document.getElementById("lbs").value; 

	//create http request
	var req = new XMLHttpRequest();

	req.open("POST", "/add", true);
	req.setRequestHeader("Content-Type", "application/json");
	
	req.addEventListener("load", function(){
		//if request status OK, add payload to table
		if(req.status >= 200 && req.status < 400){

			var newRow = document.createElement("tr");

			document.getElementById("workoutTbl").firstElementChild.appendChild(newRow);
		
			addRow(  JSON.parse(req.responseText), newRow );
		
		}
		else {
			console.log("fail");
		}

	});

	req.send( JSON.stringify(payload));;
}


/*****************************************************
*			editWorkout(event)
* replaces the cells of event.target's row with appropriate
* inputs and enters information
******************************************************/
function editWorkout(event){

	var cells = event.target.parentNode.parentNode.parentNode.children;
	
	for(var i=0; i < cells.length; i++){

		var input = document.createElement("input");
		var width = Math.floor(cells[i].offsetWidth * .94);
		
		var value = cells[i].textContent;
		input.value = value;
		
		switch(i){
			case 0:
				input.type = "text";
				break
			case 1:
			case 2:
				input.type = "number";
				break;
			case 3:
				input = document.createElement("select");
				input.appendChild( document.createElement("option"));
				input.lastChild.value = "1"
				input.lastChild.textContent = "Lbs";
				input.appendChild( document.createElement("option"));
				input.lastChild.value = "0"
				input.lastChild.textContent = "kgs";
				if(value == "kgs")
					input.lastChild.selected = true;				
				break;
			case 4: 
				input.type = "date";
				input.value = new Date(value).toISOString().split('T')[0];
				//width = 120;
				break;
			case 5:
				//set input to old form
				input = cells[i].firstElementChild;
				//delete old buttons
				input.lastElementChild.remove();
				input.lastElementChild.name = "save";
				input.lastElementChild.value = "Save";
				break;
		}

		input.style = "width:" + width + "px; padding:0px";
		
		cells[i].textContent = ""
		cells[i].appendChild(input);
	}
}



/*****************************************************
*			addRow(workout))
* adds a new row to the botom of the workoutTbl table
******************************************************/
function addRow(workout, row){


	//add data elements
	row.appendChild(document.createElement("td")).textContent = workout.name;
	row.appendChild(document.createElement("td")).textContent = workout.reps;
	row.appendChild(document.createElement("td")).textContent = workout.weight;
	row.appendChild(document.createElement("td")).textContent = workout.lbs ? "lbs" : "kgs";
	row.appendChild(document.createElement("td")).textContent = new Date(workout.date).toDateString();
	
	//add edit/delete buttons
	row.appendChild(document.createElement("td"));
				
	var newForm = document.createElement("form");
	row.lastElementChild.appendChild( newForm );

	newForm.appendChild( document.createElement("input")).type = "hidden";
	newForm.lastElementChild.name = "id";
	newForm.lastElementChild.value = workout.id;
	
	newForm.appendChild( document.createElement("input")).type = "submit";
	newForm.lastElementChild.name = "edit";
	newForm.lastElementChild.value = "Edit";

	newForm.appendChild( document.createElement("input")).type = "submit";
	newForm.lastElementChild.name = "delete";
	newForm.lastElementChild.value = "Delete";

}
