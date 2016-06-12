function updateClock ( )
	{
		var currentTime = new Date ( );
		var currentHours = currentTime.getHours ( );
		var currentMinutes = currentTime.getMinutes ( );
		var currentSeconds = currentTime.getSeconds ( );

	  	// Pad the minutes and seconds with leading zeros, if required
	  	currentMinutes = ( currentMinutes < 10 ? "0" : "" ) + currentMinutes;
	  	currentSeconds = ( currentSeconds < 10 ? "0" : "" ) + currentSeconds;

	  	// Choose either "AM" or "PM" as appropriate
	  	var timeOfDay = ( currentHours < 12 ) ? "AM" : "PM";

	  	// Convert the hours component to 12-hour format if needed
	  	currentHours = ( currentHours > 12 ) ? currentHours - 12 : currentHours;

	  	// Convert an hours component of "0" to "12"
	  	currentHours = ( currentHours == 0 ) ? 12 : currentHours;

	  	// Compose the string for display
	  	var currentTimeString = currentHours + ":" + currentMinutes + ":" + currentSeconds + " " + timeOfDay;
	  	
	  	$("#currentTime").html("Current Time: " + currentTimeString);

  	}

$(document).ready(function() {
	var url = "https://train-data.firebaseio.com/";
	var dataRef = new Firebase(url); 
	var name = "";
	var dest = "";
	var firstTime = "";
	var freq = "";


	
  	setInterval('updateClock()', 1000);

  	// regular expression to match required time format
	function checkTime(firstTime)
	{
	   
	   re = /^([01]\d|2[0-3]):([0-5]\d)$/;

	   if(firstTime != '' && !firstTime.match(re)) {
	   	alert("Invalid time format. HH:mm only!");
	   	firstTime.focus();
	   	return false;
	   }

	   return true;
	};

	// regular expression to match required number format
	function checkFreq(freq)
	{
		
		re = /^\d+$/;

		if(freq != '' && !freq.match(re)) {
			alert("Invalid value. Numbers only!");
			freq.focus();
			return false;
		}

		return true;
	};

	// Adds Train Added Message and then removes it after 3 seconds
	function trainAdded()
	{
		$('.trainAdded').css('display', 'block').text('Train successfully added');
		var sec = 3
		var timer = setInterval(function() { 
			$('.trainAdded span').text(sec--);
			if (sec == -1) {
				$('.trainAdded').css('display', 'none');
				clearInterval(timer);
			} 
		}, 1000);


			// Clears all of the text-boxes
			$("#name-input").val("");
			$("#dest-input").val("");
			$("#start-input").val("");
			$("#freq-input").val("");
			return true;
		};

	// Capture Button Click
	$(document).on("click", "#addTrain", function() {
		console.log('clicked');
		name = $('#name-input').val().trim(); 
		dest = $('#dest-input').val().trim(); 
		firstTime = $('#start-input').val().trim(); 
		checkTime(firstTime);
		freq = $('#freq-input').val().trim(); 
		checkFreq(freq);
		//dateAdded: Firebase.ServerValue.TIMESTAMP

		dataRef.push({
			name: name,
			dest: dest,
			firstTime: firstTime,
			freq: freq
		});
		
		// Alert
		trainAdded();

		return false;
	})

	// Create Firebase "watcher" (.on("value"))
	dataRef.on("child_added", function(childSnapshot, prevChildKey) {

		console.log(childSnapshot.val());
		var trnName = childSnapshot.val().name;
		var trnDest = childSnapshot.val().dest;
		var trnStart = childSnapshot.val().firstTime;
		var trnFreq = childSnapshot.val().freq;
		
		var firstTrain = moment(trnStart, "hh:mm").subtract(1, "years");	
		var diffTime = moment().diff(moment(firstTrain), "minutes");		
		var remainder = diffTime % trnFreq;		
		var minUntilTrain = trnFreq - remainder;		
		var nextTrain = moment().add(minUntilTrain, "minutes").format("hh:mm A");

		$('#table-data').append("<tr><td>"+trnName+"</td><td> "+trnDest+"</td><td>"+trnFreq+"</td><td>"+nextTrain+"</td><td>"+minUntilTrain+"</td></tr>");
	}, 

	// Create Error Handling
	function (errorObject) {

		console.log("The read failed: " + errorObject.code);

	});

});
