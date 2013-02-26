CALENDARTYPE = {
    MONTH: 0,
    WEEK: 1,
    YEAR: 2
};
DAYSOFWEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sun", "Mon", "Tues", "Wed", "Thurs", "Fri", "Sat"];
MONTHS = [{
    name: 'January',
    length: 31
}, {
    name: 'February',
    length: 28
}, {
    name: 'March',
    length: 31
}, {
    name: 'April',
    length: 30
}, {
    name: 'May',
    length: 31
}, {
    name: 'June',
    length: 30
}, {
    name: 'July',
    length: 31
}, {
    name: 'August',
    length: 31
}, {
    name: 'September',
    length: 30
}, {
    name: 'October',
    length: 31
}, {
    name: 'November',
    length: 30
}, {
    name: 'December',
    length: 31
}];



var makeMonth = function(index, year) {
	var month = new Month({

		index: index,
		year: year

	});

	return month;
}

var makeWeek = function (index, startDay) {
    var week = new Week({
        index: index,
        startDay: startDay
    });
    
    return week;
};

var makeDay = function (day) {

    var newDay = new Day({
        index: 0,
        name: ""
    });

    if (null !== day) {
        newDay = new Day({
            index: day.getDate(),
            name: DAYSOFWEEK[day.getDay()],
            day: day
        });
    }

    return newDay;

};

// Collections







// Models

var Day = Backbone.Model.extend({
    defaults: {
        "index": 0,
        "name": "",
        "events": null,
        "day":  (new Date())
    }
});
var DayCollection = Backbone.Collection.extend({
    model: Day
});

var Week = Backbone.Model.extend({
    defaults: {
        index: 0,
        days: null,
        startDay: (new Date()),
        days: new DayCollection(),
        head: new DayCollection(),
        tail: new DayCollection()
    },
    initialize: function () {

        var startDay = this.get("startDay");
        var month = startDay.getMonth();

        // for 0 .. (day of week)
        // add a null day
        var week = new DayCollection();
        var head = new DayCollection();
        var tail = new DayCollection();

        // if the week start day is not a Sunday iterate from 0 .. startday
        // Fill the head of the week with the null days
        for (i = 0; i < startDay.getDay(); i++) {
            var day = makeDay(null);
            head.add(day);
        }
        
        // Get the number of days in the current month
        var daysInMonth = MONTHS[month].length;

        var dayCounter = 0;

        // initialize the current date to the startDay;
        var currentDate = startDay.getDate();

        // while the week is not complete and the current date is < (number of days in the month)
        var weekComplete = false;
        while (!weekComplete && currentDate <= daysInMonth) {

        	// Make a new day 
            var day = makeDay(new Date(startDay.getFullYear(), startDay.getMonth(), currentDate));

            // add the new day to the list of days ( the week )
            week.add(day);

            // if the current day is the last day of the week 
            // mark the week complete
            // otherwise increment the day counter and update the current date
            if ( 6 === day.get("day").getDay() ) {
            	weekComplete = true;
            } else {
	            
				dayCounter++;
				currentDate = startDay.getDate() + dayCounter;
	        }
	    }

        // for ( 0 .. (7 - size of days array) )

        // if the above loop terminates before the week complete flag is set
        // Fill the tail of the week with the remaining days
        if ( !weekComplete ) {
            for (i = 0; i < (7 - week.length); i++) {
                var day = makeDay(null);
                tail.add(day);
            }
        }

        
        this.set({
            days: week,
            head: head,
            tail: tail
        });

    }

});
var WeekCollection = Backbone.Collection.extend({
    model: Week
});

var Month = Backbone.Model.extend({
    defaults: {
        index: (new Date()).getMonth(),
        year: (new Date()).getFullYear(),
        weeks: new WeekCollection(),
        days: new DayCollection()
    },
    initialize: function () {

        var month = this.get('index');
        var year = this.get('year');
        var currentDay = new Date(year, month, 1);
        this.set({
            firstDay: currentDay
        });

        var weeks = new WeekCollection();
        var days = new DayCollection();

        // Get the size of the current month
        var daysInMonth = MONTHS[month].length;
        
        // declare week counter
        var weekCounter = 0;

        // flag for when the month is complete
        var monthComplete = false;

        // until month complete flag is set
        while (!monthComplete) {

        	// make a new week from the current day
        	// assumes current day is a sunday
            var week = makeWeek(weekCounter, currentDay);

            // read the size of the new week
            var length = week.get("days").length;

            // get the index of the last day of the new week 
            var lastDayOfWeekIndex = week.get("days").at(length - 1).get("index");

            // add the new week to the months list of month
            weeks.add(week);

            // pull (references) od the days from the new week and add them \
            // and add them the months list of days
            days.add(week.get("days").models);

            // increment week counter
            weekCounter++;

            // if the index of the last day of the new week is the size of \
            // the current month, mark the month as complete.
            // otherwise update the currentDay
            if (lastDayOfWeekIndex === daysInMonth) {
            	monthComplete = true;
            } else {
            	// update the current day 
            	currentDay = new Date(year, month, lastDayOfWeekIndex + 1);
            }
        }


        // set the weeks and days
        this.set({
            weeks: weeks,
            days: days
        });

    }

});
var MonthCollection = Backbone.Collection.extend({
    model: Month
});

var Year = Backbone.Model.extend({
    defaults: {
        index: (new Date()).getFullYear(),
        months: new MonthCollection()
    },
    initialize: function() {

    	var year = this.get("index");
    	var months = new MonthCollection();
    	for ( var i = 0; i < 12; i++) {

    		var month = makeMonth(i, year);
    		months.add(month);

    	}

    	this.set({months : months});

    }
});

var Activity = Backbone.Model.extend({
    defaults: {
        title: "Activity Title",
        when: {
            time: 1234567890
        },
        headline: "This is an event that you want to attend",
        description: "Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged."
    }
});

var ActivityCollection = Backbone.Collection.extend({
    model: Activity
});

var Calendar = Backbone.Model.extend({
    defaults: {
        name: "",
        type: CALENDARTYPE.MONTH,
        numberOfDays: 30
    },
    initialize: function () {

        // find the number of days
        // the first day 
    }


});


